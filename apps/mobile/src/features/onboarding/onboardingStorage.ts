import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_KEY = 'draft-elite_has_seen_onboarding';

export async function setOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export async function hasSeenOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

