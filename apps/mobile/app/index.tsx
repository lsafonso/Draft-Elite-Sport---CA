import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../src/providers/AuthProvider';
import OnboardingScreen from '../src/features/onboarding/OnboardingScreen';
import LoginScreen from '../src/features/auth/LoginScreen';
import SelectAccountTypeScreen from '../src/features/auth/SelectAccountTypeScreen';
import PlayerSignupAccountScreen from '../src/features/auth/PlayerSignupAccountScreen';
import PlayerProfileSetupScreen from '../src/features/auth/PlayerProfileSetupScreen';
import {
  hasSeenOnboarding,
  setOnboardingSeen,
} from '../src/features/onboarding/onboardingStorage';

// Helper function to calculate if user is under 18
function calculateIsUnder18(dateOfBirth: string): boolean {
  try {
    // Parse date of birth (expected format: YYYY-MM-DD)
    const dobParts = dateOfBirth.split('-');
    if (dobParts.length !== 3) {
      return false; // Invalid format, default to false
    }

    const dobYear = parseInt(dobParts[0], 10);
    const dobMonth = parseInt(dobParts[1], 10);
    const dobDay = parseInt(dobParts[2], 10);

    if (isNaN(dobYear) || isNaN(dobMonth) || isNaN(dobDay)) {
      return false; // Invalid date, default to false
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const currentDay = today.getDate();

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

export default function Index() {
  const { session } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'selectAccountType' | 'playerSignupAccount' | 'playerProfileSetup'>('login');
  const [accountData, setAccountData] = useState<{ fullName: string; dateOfBirth: string; email: string } | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await hasSeenOnboarding();
      setHasCompletedOnboarding(completed);
      setCheckingOnboarding(false);
    };

    checkOnboarding();
  }, []);

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
          onProfileCompleted={(profileData) => {
            // TODO: Save profile data to backend
            console.log('Profile completed:', profileData);
            
            // Show success message and return to login
            Alert.alert(
              'Signup Complete',
              'Your account has been created! Please check your email to verify your address. Your profile will be reviewed by Draft Elite Sport staff before you can apply for trials.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setAuthMode('login');
                    setAccountData(null);
                  },
                },
              ]
            );
          }}
          onSwitchToLogin={() => setAuthMode('login')}
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
      <Text style={styles.placeholderText}>Home screen placeholder</Text>
    </View>
  );
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
});
