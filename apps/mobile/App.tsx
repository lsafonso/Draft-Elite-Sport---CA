import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from './src/providers/AuthProvider';
import LoginScreen from './src/features/auth/LoginScreen';
import OnboardingScreen from './src/features/onboarding/OnboardingScreen';
import {
  hasSeenOnboarding,
  setOnboardingSeen,
} from './src/features/onboarding/onboardingStorage';

function RootContent() {
  const { user, loading } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasSeenOnboardingState, setHasSeenOnboardingState] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await hasSeenOnboarding();
      setHasSeenOnboardingState(seen);
      setOnboardingChecked(true);
    };

    checkOnboarding();
  }, []);

  if (!onboardingChecked) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
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
