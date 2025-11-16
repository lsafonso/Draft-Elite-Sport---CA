import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/providers/AuthProvider';
import OnboardingScreen from '../src/features/onboarding/OnboardingScreen';
import LoginScreen from '../src/features/auth/LoginScreen';
import SelectAccountTypeScreen from '../src/features/auth/SelectAccountTypeScreen';
import PlayerSignupAccountScreen from '../src/features/auth/PlayerSignupAccountScreen';
import SignupCompleteScreen from '../src/features/auth/SignupCompleteScreen';
import PlayerProfileSetupScreen from '../src/features/auth/PlayerProfileSetupScreen';
import {
  hasSeenOnboarding,
  setOnboardingSeen,
} from '../src/features/onboarding/onboardingStorage';
import { supabase } from '../src/lib/supabaseClient';
import {
  savePlayerProfile,
  type AccountData,
  type PlayerProfileData,
} from '../src/features/auth/savePlayerProfile';


export default function Index() {
  const { session } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'selectAccountType' | 'playerSignupAccount' | 'signupComplete'>('login');
  const [signupCompleteInfo, setSignupCompleteInfo] = useState<{
    fullName?: string;
  } | null>(null);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'needsProfile' | 'hasProfile'>('idle');
  const [accountFromSession, setAccountFromSession] = useState<AccountData | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await hasSeenOnboarding();
      setHasCompletedOnboarding(completed);
      setCheckingOnboarding(false);
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfileStatus('idle');
      setAccountFromSession(null);
      return;
    }

    const loadProfile = async () => {
      setProfileStatus('loading');
      const user = session.user;
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, everything else is a real error
        console.error('loadProfile error', error);
        setProfileStatus('needsProfile');
        return;
      }

      if (!data) {
        // No profile yet → show setup
        const meta = user.user_metadata || {};
        setAccountFromSession({
          fullName: meta.full_name || user.email || '',
          dateOfBirth: meta.date_of_birth || '',
          email: user.email || '',
        });
        setProfileStatus('needsProfile');
      } else {
        setProfileStatus('hasProfile');
      }
    };

    loadProfile();
  }, [session]);

  if (checkingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingScreen
        onFinished={async () => {
          await setOnboardingSeen();
          setHasCompletedOnboarding(true);
        }}
      />
    );
  }

  if (!session) {
    if (authMode === 'selectAccountType') {
      return (
        <SelectAccountTypeScreen
          onSelectAccountType={(accountType) => {
            if (accountType === 'player') {
              setAuthMode('playerSignupAccount');
            }
          }}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
    if (authMode === 'playerSignupAccount') {
      return (
        <PlayerSignupAccountScreen
          onSignupComplete={(data) => {
            setSignupCompleteInfo({
              fullName: data.fullName,
            });
            setAuthMode('signupComplete');
          }}
          onSwitchToLogin={() => setAuthMode('login')}
          onRequireParentAccount={() => {
            setAuthMode('selectAccountType');
          }}
        />
      );
    }
    if (authMode === 'signupComplete') {
      return (
        <SignupCompleteScreen
          fullName={signupCompleteInfo?.fullName}
          onBackToLogin={() => {
            setSignupCompleteInfo(null);
            setAuthMode('login');
          }}
        />
      );
    }
    return (
      <LoginScreen
        onSwitchToSignup={() => setAuthMode('selectAccountType')}
      />
    );
  }

  if (session) {
    if (profileStatus === 'loading' || profileStatus === 'idle') {
      return (
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </SafeAreaView>
      );
    }

    if (profileStatus === 'needsProfile' && accountFromSession) {
      return (
        <PlayerProfileSetupScreen
          fullName={accountFromSession.fullName}
          dateOfBirth={accountFromSession.dateOfBirth}
          isUnder18={Boolean(session.user.user_metadata?.is_under_18)}
          onProfileCompleted={async (profileData) => {
            const userId = session.user.id;

            // Transform profile data to match PlayerProfileData type
            const transformedProfile: PlayerProfileData = {
              position: profileData.position,
              location: profileData.location,
              nationality: profileData.nationality,
              clubName: profileData.clubName,
              heightCm: profileData.height ? Number(profileData.height) : undefined,
              weightKg: profileData.weight ? Number(profileData.weight) : undefined,
              preferredFoot: profileData.preferredFoot.toLowerCase() as 'left' | 'right' | 'both',
              highlightLink: profileData.highlightVideoLink,
              isUnder18: profileData.isUnder18,
            };

            const { error } = await savePlayerProfile(userId, accountFromSession, transformedProfile);

            if (error) {
              Alert.alert(
                'Error',
                error.message
                  ? `There was a problem saving your profile: ${error.message}`
                  : 'There was a problem saving your profile. Please try again.'
              );
              return;
            }

            setProfileStatus('hasProfile');
          }}
        />
      );
    }

    // If we reach here, profile exists → show your real home / placeholder
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.homeTitle}>Home screen placeholder</Text>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
