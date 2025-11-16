import { supabase } from '../../lib/supabaseClient';

export type ChildProfileData = {
  childFullName: string;
  childDateOfBirth: string; // DD/MM/YYYY
  position: string;
  location: string;
  nationality: string;
  clubName?: string;
  height?: string;
  weight?: string;
  preferredFoot: string;
  highlightVideoLink?: string;
};

export async function saveChildProfile(
  userId: string,
  childProfile: ChildProfileData,
  parentEmail?: string
): Promise<void> {
  // Build payload for Supabase
  const payload = {
    user_id: userId,
    role: 'child',
    full_name: childProfile.childFullName.trim(),
    date_of_birth: childProfile.childDateOfBirth.trim(), // DD/MM/YYYY string
    email: parentEmail ?? null,
    country: childProfile.nationality.trim(), // map nationality to country
    is_under_18: true, // children are under 18 by definition
    position: childProfile.position.trim(),
    location: childProfile.location.trim(),
    nationality: childProfile.nationality.trim(),
    club_name: childProfile.clubName?.trim() ?? null,
    height_cm: childProfile.height ? Number(childProfile.height) : null,
    weight_kg: childProfile.weight ? Number(childProfile.weight) : null,
    preferred_foot: childProfile.preferredFoot.toLowerCase() as 'left' | 'right' | 'both',
    highlight_link: childProfile.highlightVideoLink?.trim() ?? null,
    status: 'pending',
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('saveChildProfile error', error);
    throw new Error(error.message || 'Failed to save child profile');
  }
}

