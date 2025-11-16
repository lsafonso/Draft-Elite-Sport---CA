import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/providers/AuthProvider';
import LoginScreen from './src/features/auth/LoginScreen';
import SelectAccountTypeScreen from './src/features/auth/SelectAccountTypeScreen';
import PlayerSignupAccountScreen from './src/features/auth/PlayerSignupAccountScreen';
import ParentSignupAccountScreen from './src/features/auth/ParentSignupAccountScreen';
import SignupCompleteScreen from './src/features/auth/SignupCompleteScreen';
import PlayerProfileSetupScreen from './src/features/auth/PlayerProfileSetupScreen';
import ChildProfileSetupScreen from './src/features/auth/ChildProfileSetupScreen';
import OnboardingScreen from './src/features/onboarding/OnboardingScreen';
import {
  hasSeenOnboarding,
  setOnboardingSeen,
} from './src/features/onboarding/onboardingStorage';
import { supabase } from './src/lib/supabaseClient';
import {
  savePlayerProfile,
  type AccountData,
  type PlayerProfileData,
} from './src/features/auth/savePlayerProfile';
import { saveChildProfile } from './src/features/auth/saveChildProfile';


function RootContent() {
  const { session, loading } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasSeenOnboardingState, setHasSeenOnboardingState] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'selectAccountType' | 'playerSignupAccount' | 'parentSignupAccount' | 'signupComplete'>('login');
  const [signupCompleteInfo, setSignupCompleteInfo] = useState<{
    fullName?: string;
  } | null>(null);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'needsProfile' | 'hasProfile'>('idle');
  const [accountFromSession, setAccountFromSession] = useState<AccountData | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await hasSeenOnboarding();
      setHasSeenOnboardingState(seen);
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfileStatus('idle');
      setAccountFromSession(null);
      setUserRole(undefined);
      return;
    }

    const loadProfile = async () => {
      setProfileStatus('loading');
      const user = session.user;
      const meta = user.user_metadata || {};
      const role = meta.role as string | undefined;
      setUserRole(role);

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
        const fullNameFromMeta = typeof meta.full_name === 'string' ? meta.full_name.trim() : '';
        const dobFromMeta = typeof meta.date_of_birth === 'string' ? meta.date_of_birth.trim() : '';
        setAccountFromSession({
          fullName: fullNameFromMeta || (user.email ?? ''),
          dateOfBirth: dobFromMeta,
          email: user.email ?? '',
        });
        setProfileStatus('needsProfile');
      } else {
        setProfileStatus('hasProfile');
      }
    };

    loadProfile();
  }, [session]);

  if (loading || !onboardingChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (!hasSeenOnboardingState) {
    return (
      <OnboardingScreen
        onFinished={async () => {
          await setOnboardingSeen();
          setHasSeenOnboardingState(true);
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
            } else if (accountType === 'parent') {
              setAuthMode('parentSignupAccount');
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
    if (authMode === 'parentSignupAccount') {
      return (
        <ParentSignupAccountScreen
          onSignupComplete={(data) => {
            setSignupCompleteInfo({
              fullName: data.fullName,
            });
            setAuthMode('signupComplete');
          }}
          onSwitchToLogin={() => setAuthMode('login')}
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
      // Show ChildProfileSetupScreen for parents, PlayerProfileSetupScreen for players
      if (userRole === 'parent') {
        return (
          <ChildProfileSetupScreen
            accountFullName={accountFromSession.fullName}
            onProfileCompleted={async (childProfile) => {
              const userId = session.user.id;

              try {
                await saveChildProfile(userId, childProfile, session.user.email ?? undefined);
                setProfileStatus('hasProfile');
              } catch (error) {
                console.error('Error saving child profile:', error);
                Alert.alert(
                  'Error',
                  'There was a problem saving your child\'s profile. Please try again.'
                );
              }
            }}
          />
        );
      }

      // Default to PlayerProfileSetupScreen for players
      return (
        <PlayerProfileSetupScreen
          accountFullName={accountFromSession.fullName}
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
        <Text style={styles.homeTitle}>Home placeholder</Text>
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
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
