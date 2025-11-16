import { supabase } from '../../lib/supabaseClient';

export type AccountData = {
  fullName: string;
  dateOfBirth: string; // DD/MM/YYYY
  email: string;
  userId?: string;
};

export type PlayerProfileData = {
  position: string;
  location: string;
  nationality: string;
  clubName?: string;
  heightCm?: number;
  weightKg?: number;
  preferredFoot: 'left' | 'right' | 'both';
  highlightLink?: string;
  isUnder18: boolean;
};

// TODO: confirm profiles table schema in Supabase
export async function savePlayerProfile(
  userId: string,
  account: AccountData,
  profile: PlayerProfileData
) {
  // Build payload for Supabase
  const payload = {
    user_id: userId,
    role: 'player',
    full_name: account.fullName,
    date_of_birth: account.dateOfBirth,
    email: account.email,
    is_under_18: profile.isUnder18,
    position: profile.position,
    location: profile.location,
    nationality: profile.nationality,
    club_name: profile.clubName ?? null,
    height_cm: profile.heightCm ?? null,
    weight_kg: profile.weightKg ?? null,
    preferred_foot: profile.preferredFoot,
    highlight_link: profile.highlightLink ?? null,
    status: 'pending',
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('savePlayerProfile error', error);
  }

  return { data, error };
}

