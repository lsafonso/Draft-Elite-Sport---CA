# Draft Elite Sport – Mobile App MVP  

Project Requirements (v1.2 – draft summary)

> This file is a working, developer-friendly summary of the full requirements document for the Draft Elite Sport MVP. The source of truth is the v1.2 Word document, but this markdown version is what we'll use inside the repo and in PRs.

---

## 1. Project Overview

Draft Elite Sport is building a **mobile app for football (soccer) players and scouts**.  

- Platforms: **iOS & Android** (built with React Native / Expo).

- Backend: **Supabase** (Postgres, Auth, Storage, RLS).

- Initial geographies: **UK, Europe, Middle East**, with potential expansion.

- Brand: **dark theme** with **black and gold** as primary colours; app should look premium and modern.

The app will later be complemented by a new public website that reuses the same data model, but the **MVP scope is mobile-first**.

---

## 2. Goals & Objectives

- Allow **players** to create football profiles and apply for **trials and events**.

- Allow **clubs/scouts** to discover players, view full profiles and highlight videos, and express interest in signing players.

- Provide **admins** with a central system to manage:

  - users and approvals

  - events

  - applications

  - scout–player interactions (information/sign requests, recommendations)

- Build a **scalable data model** that can later be reused by a future web front-end.

- Ensure the platform looks **premium** and is **simple to use on mobile devices**.

---

## 3. Scope Overview (MVP)

**In-scope platforms**

- Mobile app (this repo):  

  - player experience  

  - scout experience  

  - admin tools embedded for staff (role-based access)

- Supabase backend: authentication, database, storage, row-level security, and API access for the app.

**Out-of-scope for MVP**

- Full public marketing website (will be a separate project later, reusing the same DB).

- Advanced analytics, CRM integrations, or in-app chat.

- Multi-language support beyond English.

---

## 4. Roles & High-level Flows

### 4.1 Roles

- **Player**

  - Creates and manages their football profile.

  - Browses trials/events and submits applications.

  - Can search and view **basic** info for other players.

- **Scout / Club**

  - Logs in as a vetted user (approved by admin).

  - Can search for players with more filters.

  - Views full player profiles (respecting minor privacy rules).

  - Can submit interest / information / sign requests for specific players.

- **Admin (Draft Elite Sport staff)**

  - Approves / rejects user accounts.

  - Manages events and capacity.

  - Reviews and updates applications.

  - Manages scout requests and internal recommendations.

  - Has full data visibility.

---

## 5. Functional Requirements (FR – summary)

This section summarises FR-1 .. FR-37 from the full spec. Exact wording may differ; the intent must match.

### 5.1 Accounts, Roles and Approval

- **FR-1–FR-4 (auth basics)** – Users can:

  - create an account with email + password,

  - log in, log out,

  - reset password by email.

- **FR-5** – New player and scout accounts start in **Pending** status with **limited access** until approved.

- **FR-6** – Admin can change user status to: **Approved, Rejected, Suspended**.

- **FR-7** – Under-18 rules: the system stores date of birth and derives an **isMinor** flag. MVP supports configuring minor behaviour, but full under-18 application flows can be phased in later.

### 5.2 Player Profiles & Minor Privacy

- **FR-8** – Player profiles include:

  - first name, last name

  - date of birth

  - country/location

  - preferred positions

  - dominant foot

  - height (optional)

  - current / recent clubs

  - profile photo

  - highlight video links (e.g. YouTube URLs)

  - short bio

- **FR-8a** – The system derives and stores an **isMinor** flag based on date of birth and a configurable age threshold (default: under 18).

- **FR-8b** – **Minor photo visibility**:

  - If `isMinor = true`, the real profile photo is hidden from other players and optionally from scouts, depending on privacy settings.

  - A default silhouette or safe placeholder is shown instead, along with a short notice that photos are hidden for under-18 players.

- **FR-9** – Admin can view and edit **all** player profile fields.

- **FR-10** – Scouts can view full player profiles, respecting minor rules above.

- **FR-11** – Other players can view **only basic** non-sensitive info for other players (e.g. first name, age bracket, position, country).

### 5.3 Trials & Events Management

- **FR-12** – Admin can create and manage events (trials, showcases, etc.) with:

  - title, description

  - type (Trial, Other Event)

  - date & time

  - location (city, country, venue text)

  - age category / bracket

  - capacity

  - price (free or paid)

  - status: **Draft, Published, Closed, Cancelled**

- **FR-13** – Only **Published** events appear in the mobile app.

- **FR-14** – Capacity tracking:

  - Confirmed applications reduce available capacity.

  - When capacity is reached, the event is marked **Full** and new applications are blocked.

### 5.4 Event Browsing & Filters (Mobile App)

- **FR-15** – Players can see a list of upcoming trials/events showing at minimum:

  - event title

  - date & time

  - city & country

  - price or "Free"

  - age category

  - status badge (e.g. Open, Full, Closed)

- **FR-16** – Players can filter/sort events by:

  - location (country / city),

  - event type (Trial / Other Event),

  - date range,

  - optionally age category.

- **FR-17** – Event detail screens display full event information plus an **Apply** button when the player is eligible.

### 5.5 Applications Flow

- **FR-18** – Eligible players (Approved, correct age, event not full) can apply. An **application record** is created.

- **FR-19** – Application records include:

  - player,

  - event,

  - status (Pending, Confirmed, Rejected, Cancelled),

  - created_at, updated_at,

  - optional admin notes.

- **FR-20** – Admin can view applications **per event** and **per player**.

- **FR-21** – Admin can update application status in the dashboard.

- **FR-22** – Players can view **their own** applications with event title, date and status plus simple textual descriptions.

### 5.6 Payments

- **FR-23** – For paid events, the Apply flow integrates with a payment provider (e.g. Stripe or in-app purchase). Exact provider can be finalised later.

- **FR-24** – Payment records include:

  - application reference,

  - amount,

  - currency,

  - payment provider reference,

  - payment status (Pending, Paid, Failed, Refunded),

  - timestamps.

- **FR-25** – Only **Paid** payments confirm an application and reduce event capacity.

### 5.7 Notifications

- **FR-26** – The system will integrate with a push notification provider suitable for iOS and Android.

- **FR-27** – Automatic notifications are sent for:

  - application status changes (e.g. Confirmed / Rejected),

  - new trial created in a player's country or city (configurable).

- **FR-28** – Users can enable/disable push notifications in a simple preference setting.

### 5.8 Search & Discovery

- **FR-29** – Players can search other players by name and browse by country, age group and position (basic info only).

- **FR-30** – Scouts can perform **advanced search** (name, age/age range, position, location, etc.) and view full profiles, respecting minor privacy rules.

### 5.9 Scout & Admin Workflows (high-level)

- **FR-31** – Admin dashboard modules (web or embedded admin tools) include:

  - Users (approve/reject and change status)

  - Events

  - Applications

  - Scout requests / recommendations

  - Optional notification log.

- **FR-32** – Scout dashboard allows:

  - login for approved scouts,

  - access to player search,

  - viewing full profiles,

  - list of players recommended to them by admins.

### 5.10 Scout Interest & Admin Recommendations

- **FR-33** – From a player profile, scouts can tap **"Request info"** (INFO_REQUEST). The system creates a record linking scout + player + timestamp + optional message to DES staff.

- **FR-34** – From a player profile, scouts can tap **"Request signing"** (SIGN_REQUEST). The system creates a record of type SIGN_REQUEST.

- **FR-35** – Admin dashboard includes a **Scout Requests** area where staff can see, filter and update statuses such as Open, In Progress, Closed, plus internal notes.

- **FR-36** – From a player profile, admins can select **"Recommend to scout"**, choose a scout, and create a record of type ADMIN_RECOMMENDATION linking the player and scout.

- **FR-37** – From a scout profile, admins can select **"Recommend a player"**, choose a player, and create another ADMIN_RECOMMENDATION record.

---

## 6. Non-Functional Requirements (NFR)

- **Security & Privacy**

  - Use Supabase Auth and RLS for per-user data access.

  - Protect minor data (see isMinor handling).

  - Use HTTPS everywhere; store secrets securely.

- **Performance**

  - App should feel responsive on mid-range devices.

  - Pagination / infinite scroll for heavy lists (events, players).

- **Brand & UX**

  - Dark theme, black & gold colour palette.

  - Clean typography, minimal clutter, mobile-first UX.

- **Extensibility**

  - Data model should support a future public website and additional roles with minimal schema change.

---

## 7. Out-of-Scope (MVP)

Explicitly not in this MVP:

- Manual broadcast tools for arbitrary push messages.

- In-app chat/messaging between players and scouts.

- Deep analytics & BI dashboards.

- Integrations with external CRMs or football associations.

- Multi-language UI beyond English.

---

## 8. Responsibilities (high-level)

**Draft Elite Sport will:**

- Approve this requirements document and any major changes.

- Provide branding assets (logo, final colours).

- Provide/approve legal text: Privacy Policy, T&Cs, Refund Policy.

- Decide and sign up for a payment provider.

**The developer will:**

- Implement the mobile app and Supabase backend according to this document.

- Apply appropriate security and privacy best practices.

- Provide basic technical documentation and admin usage guidance.

- Keep this markdown updated as requirements evolve.

---
