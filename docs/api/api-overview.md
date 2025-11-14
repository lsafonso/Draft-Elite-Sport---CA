# Draft Elite Sport – API & Data Model Overview

This document describes how the Draft Elite Sport mobile app talks to the backend. We are using **Supabase** (Postgres + Supabase Auth + Storage + RLS). There is no separate custom REST API for MVP; the mobile app uses the official `@supabase/supabase-js` client.

## 1. High-Level Architecture

- **Client:** React Native / Expo app (this repo).

- **Backend:** Supabase project:

  - `auth.users` for authentication & identity.

  - Postgres tables in `public` schema for domain data (profiles, events, applications, payments, scout_requests, etc.).

  - Row Level Security (RLS) to enforce per-user access.

- **Communication:** Supabase client (JS) using:

  - table queries (`from('table').select(...)`)

  - inserts/updates/deletes

  - auth methods (`auth.signInWithPassword`, `auth.getSession`, `auth.signOut`).

## 2. Core Entities & Tables (MVP)

### 2.1 Auth: `auth.users`

Managed by Supabase. We do **not** modify its schema directly.

Key fields (read-only from our perspective):

- `id` (uuid) – primary key referenced by other tables.

- `email`

- `created_at`

- `last_sign_in_at`

- plus Supabase internals (password hash, etc.).

Used for:

- login, signup, password reset.

- linking to `profiles.user_id`.

---

### 2.2 Profiles: `public.profiles`

Stores extended user information and roles.

Suggested schema (already created):

- `id` (uuid, PK)

- `user_id` (uuid, FK → `auth.users.id`, `on delete cascade`)

- `role` (text, one of: `player`, `scout`, `admin`)

- `full_name` (text)

- `date_of_birth` (date)

- `country` (text)

- `created_at` (timestamptz, default now)

- `updated_at` (timestamptz, default now)

RLS (conceptual):

- Users can **see and edit only their own profile** (`user_id = auth.uid()`).

- Admins may have a policy that allows broader access.

The app will typically:

- Load the current user's profile after login.

- Derive `isMinor` in code or via a view/column based on `date_of_birth`.

---

### 2.3 Events: `public.events` (planned)

Represents trials / showcases / other events.

Suggested fields:

- `id` (uuid, PK)

- `title` (text)

- `description` (text)

- `type` (text: `trial` | `event`)

- `status` (text: `draft` | `published` | `closed` | `cancelled`)

- `starts_at` (timestamptz)

- `ends_at` (timestamptz, optional)

- `city` (text)

- `country` (text)

- `age_category` (text or enum, e.g. `U16`, `U18`, `Senior`)

- `capacity` (integer, optional)

- `price_amount` (numeric)

- `price_currency` (text, default `GBP`)

- `created_by` (uuid, FK → `auth.users.id`)

- `created_at`, `updated_at` (timestamptz)

RLS (high-level):

- **Players & scouts:** can `select` only `status = 'published'` events.

- **Admins:** full CRUD.

---

### 2.4 Applications: `public.applications` (planned)

Represents a player applying to an event.

Suggested fields:

- `id` (uuid, PK)

- `player_id` (uuid, FK → `profiles.id`)

- `event_id` (uuid, FK → `events.id`)

- `status` (text: `pending` | `confirmed` | `rejected` | `cancelled`)

- `admin_notes` (text, optional)

- `created_at`, `updated_at` (timestamptz)

RLS (high-level):

- Players can `insert` and `select` **their own** applications (where `player_id` belongs to them).

- Scouts should not see other players' applications by default.

- Admins can see and update all.

---

### 2.5 Payments: `public.payments` (planned)

Records payments for paid events.

Suggested fields:

- `id` (uuid, PK)

- `application_id` (uuid, FK → `applications.id`)

- `amount` (numeric)

- `currency` (text)

- `provider` (text, e.g. `stripe`)

- `provider_payment_id` (text)

- `status` (text: `pending` | `paid` | `failed` | `refunded`)

- `created_at`, `updated_at` (timestamptz)

Logic (in app + backend):

- Only `status = 'paid'` should confirm an application and decrement event capacity.

---

### 2.6 Scout Requests: `public.scout_requests` (planned)

Captures interest and recommendations between scouts, players, and admins.

Suggested fields:

- `id` (uuid, PK)

- `type` (text: `INFO_REQUEST` | `SIGN_REQUEST` | `ADMIN_RECOMMENDATION`)

- `scout_profile_id` (uuid, FK → `profiles.id`)

- `player_profile_id` (uuid, FK → `profiles.id`)

- `status` (text: `open` | `in_progress` | `closed`)

- `message` (text, optional)

- `created_at`, `updated_at` (timestamptz)

- optional `handled_by_admin_id` (uuid, FK → `profiles.id` with role `admin`)

Usage:

- Scouts create INFO_REQUEST / SIGN_REQUEST from a player profile.

- Admins create ADMIN_RECOMMENDATION linking scouts and players.

- Admin dashboard shows and filters these records.

---

### 2.7 Notifications: `public.notifications` (optional/placeholder)

For future storing of sent notifications, or just logging key events.

Possible fields:

- `id` (uuid, PK)

- `user_id` (uuid, FK → `auth.users.id`)

- `type` (text, e.g. `application_status_changed`, `new_event_in_area`)

- `payload` (jsonb)

- `created_at` (timestamptz)

- `read_at` (timestamptz, optional)

---

## 3. API Usage from the Mobile App

### 3.1 Auth

Using `@supabase/supabase-js`:

- `supabase.auth.signInWithPassword({ email, password })`

- `supabase.auth.signUp({ email, password })`

- `supabase.auth.signOut()`

- `supabase.auth.getSession()` / `getUser()` for current user.

The app stores the session via the Supabase client; no custom token handling is needed.

### 3.2 Profiles

- After login, app loads the current profile:

  ```ts

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase

    .from('profiles')

    .select('*')

    .eq('user_id', user.id)

    .single();

  ```

* If there is no profile, app will show an onboarding / profile creation flow.

* Updating profile uses `update` or `upsert` with RLS enforcing ownership.

### 3.3 Events & Applications

* Events list: `supabase.from('events').select(...).eq('status', 'published').order('starts_at')`

* Event details: `select('*').eq('id', eventId).single()`

* Apply to event:

  * Insert into `applications` with `player_id` and `event_id`.

  * If paid, create a payment via the chosen provider and update `applications` + `payments` accordingly.

### 3.4 Scout Requests

* From a player profile, a scout submits a request:

  ```ts

  await supabase.from('scout_requests').insert({

    type: 'SIGN_REQUEST',

    scout_profile_id,

    player_profile_id,

    message,

  });

  ```

Admin tools will query this table to drive workflows.

---

## 4. RLS Strategy (high-level)

* **profiles**

  * `select`, `update` restricted to `user_id = auth.uid()` for normal users.

  * Admin roles get broader access via a dedicated policy.

* **events**

  * `select` of `status = 'published'` for all authenticated users.

  * `insert`, `update`, `delete` restricted to admins.

* **applications**

  * Players: `select` / `insert` only where the linked profile belongs to them.

  * Admins: full access for monitoring and status updates.

* **scout_requests**

  * Scouts: can create and see requests they created.

  * Admins: can see all and update status/notes.

Exact policies will be defined in SQL migrations under `supabase/migrations`.

---

## 5. Next Steps

* Finalise exact column sets and enums for each table.

* Add SQL migration files under `supabase/migrations` to create these tables and policies.

* Generate TypeScript types via `supabase gen types typescript` into `supabase/types/database.types.ts` and share them through `@draft-elite/api-client`.

* Gradually replace mock data in the app with real Supabase queries once the schema is stable.


---
