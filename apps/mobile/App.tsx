import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { AuthProvider, useAuth } from './src/providers/AuthProvider';
import LoginScreen from './src/features/auth/LoginScreen';
import SelectAccountTypeScreen from './src/features/auth/SelectAccountTypeScreen';
import PlayerSignupAccountScreen from './src/features/auth/PlayerSignupAccountScreen';
import PlayerProfileSetupScreen from './src/features/auth/PlayerProfileSetupScreen';
import SignupCompleteScreen from './src/features/auth/SignupCompleteScreen';
import OnboardingScreen from './src/features/onboarding/OnboardingScreen';
import {
  hasSeenOnboarding,
  setOnboardingSeen,
} from './src/features/onboarding/onboardingStorage';
import {
  savePlayerProfile,
  type AccountData,
  type PlayerProfileData,
} from './src/features/auth/savePlayerProfile';

// Helper function to parse UK date format (DD/MM/YYYY)
function parseUkDate(dateStr: string): Date | null {
  // Expect "DD/MM/YYYY"
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const [dayStr, monthStr, yearStr] = parts.map(p => p.trim());
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);

  if (!day || !month || !year) return null;

  const d = new Date(year, month - 1, day);

  // Basic sanity check so 32/13/0000 doesn't pass silently
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }

  return d;
}

// Helper function to calculate if user is under 18
function calculateIsUnder18(dateOfBirth: string): boolean {
  try {
    // Parse date of birth (expected format: DD/MM/YYYY)
    const dobDate = parseUkDate(dateOfBirth);
    if (!dobDate) {
      return false; // Invalid format, default to false
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const currentDay = today.getDate();

    const dobYear = dobDate.getFullYear();
    const dobMonth = dobDate.getMonth() + 1;
    const dobDay = dobDate.getDate();

    // Calculate age
    let age = currentYear - dobYear;

    // Adjust if birthday hasn't occurred this year
    if (currentMonth < dobMonth || (currentMonth === dobMonth && currentDay < dobDay)) {
      age--;
    }

    return age < 18;
  } catch (error) {
    // If parsing fails, default to false
    return false;
  }
}

function RootContent() {
  const { session, loading } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasSeenOnboardingState, setHasSeenOnboardingState] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'selectAccountType' | 'playerSignupAccount' | 'playerProfileSetup' | 'signupComplete'>('login');
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [signupCompleteInfo, setSignupCompleteInfo] = useState<{
    fullName?: string;
    isUnder18?: boolean;
  } | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await hasSeenOnboarding();
      setHasSeenOnboardingState(seen);
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, []);

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
            }
          }}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
    if (authMode === 'playerSignupAccount') {
      return (
        <PlayerSignupAccountScreen
          onAccountCreated={(data) => {
            setAccountData(data);
            setAuthMode('playerProfileSetup');
          }}
          onSwitchToLogin={() => setAuthMode('login')}
          onRequireParentAccount={() => {
            setAuthMode('selectAccountType');
          }}
        />
      );
    }
    if (authMode === 'playerProfileSetup') {
      if (!accountData) {
        // Fallback if accountData is missing
        setAuthMode('login');
        return null;
      }
      const isUnder18 = calculateIsUnder18(accountData.dateOfBirth);
      return (
        <PlayerProfileSetupScreen
          fullName={accountData.fullName}
          dateOfBirth={accountData.dateOfBirth}
          isUnder18={isUnder18}
          onProfileCompleted={async (profileData) => {
            if (!accountData?.userId) {
              Alert.alert('Error', 'There was a problem with your account details. Please try signing up again.');
              return;
            }

            const userId = accountData.userId;

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

            const { error } = await savePlayerProfile(userId, accountData, transformedProfile);

            if (error) {
              Alert.alert(
                'Error',
                error.message
                  ? `There was a problem saving your profile: ${error.message}`
                  : 'There was a problem saving your profile. Please try again.'
              );
              return;
            }

            // Set signup complete info and navigate to signup complete screen
            setSignupCompleteInfo({
              fullName: accountData.fullName,
              isUnder18: profileData.isUnder18,
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
          isUnder18={signupCompleteInfo?.isUnder18}
          onBackToLogin={() => {
            setSignupCompleteInfo(null);
            setAccountData(null);
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

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
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
});
