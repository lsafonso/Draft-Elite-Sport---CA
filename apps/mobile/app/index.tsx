import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/providers/AuthProvider';
import OnboardingScreen from '../src/features/onboarding/OnboardingScreen';
import LoginScreen from '../src/features/auth/LoginScreen';
import SignupScreen from '../src/features/auth/SignupScreen';
import {
  hasSeenOnboarding,
  setOnboardingSeen,
} from '../src/features/onboarding/onboardingStorage';

export default function Index() {
  const { session } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

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
    if (authMode === 'signup') {
      return (
        <SignupScreen
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
    return (
      <LoginScreen
        onSwitchToSignup={() => setAuthMode('signup')}
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
