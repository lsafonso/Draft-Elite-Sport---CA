import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabaseClient';
import { DES_LOGO } from '../../lib/branding';

interface PlayerSignupAccountScreenProps {
  onAccountCreated: (data: { fullName: string; dateOfBirth: string; email: string }) => void;
  onSwitchToLogin?: () => void;
  onRequireParentAccount?: () => void;
}

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

export default function PlayerSignupAccountScreen({
  onAccountCreated,
  onSwitchToLogin,
  onRequireParentAccount,
}: PlayerSignupAccountScreenProps) {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullNameFocused, setIsFullNameFocused] = useState(false);
  const [isDateOfBirthFocused, setIsDateOfBirthFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const handleSignup = async () => {
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!dateOfBirth.trim()) {
      setError('Date of birth is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check if user is under 18 before proceeding with signup
    const isUnder18 = calculateIsUnder18(dateOfBirth.trim());
    if (isUnder18) {
      Alert.alert(
        'Parent Account Required',
        'Because you are under 18, your parent or guardian must create the account. Please go back and choose "Parent/Guardian" as the account type.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onRequireParentAccount) {
                onRequireParentAccount();
              }
            },
          },
        ]
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Success - proceed to profile setup
      onAccountCreated({
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        email: email.trim(),
      });
    } catch (err) {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.watermarkContainer}>
          <Image
            source={DES_LOGO}
            style={styles.watermarkLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.foregroundContent}>
          <Image source={DES_LOGO} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>Create your account</Text>

          <Text style={styles.subtitle}>
            Step 1 of 2. We need a few details to create your Draft Elite Sport account.
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, isFullNameFocused && styles.inputFocused]}
              placeholder="Full name"
              placeholderTextColor="#777777"
              value={fullName}
              onChangeText={setFullName}
              onFocus={() => setIsFullNameFocused(true)}
              onBlur={() => setIsFullNameFocused(false)}
              autoCapitalize="words"
              autoComplete="name"
            />

            <TextInput
              style={[styles.input, isDateOfBirthFocused && styles.inputFocused]}
              placeholder="Date of Birth (YYYY-MM-DD)"
              placeholderTextColor="#777777"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              onFocus={() => setIsDateOfBirthFocused(true)}
              onBlur={() => setIsDateOfBirthFocused(false)}
              keyboardType="default"
            />

            <TextInput
              style={[styles.input, isEmailFocused && styles.inputFocused]}
              placeholder="Email"
              placeholderTextColor="#777777"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <TextInput
              style={[styles.input, isPasswordFocused && styles.inputFocused]}
              placeholder="Password"
              placeholderTextColor="#777777"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />

            <TextInput
              style={[styles.input, isConfirmPasswordFocused && styles.inputFocused]}
              placeholder="Confirm password"
              placeholderTextColor="#777777"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Already have an account?</Text>
              <TouchableOpacity onPress={onSwitchToLogin}>
                <Text style={styles.switchLink}> Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  watermarkLogo: {
    width: 390,
    height: 390,
    opacity: 0.03,
  },
  foregroundContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    zIndex: 1,
  },
  logo: {
    width: 120,
    height: 90,
    marginBottom: 32,
    alignSelf: 'center',
    opacity: 0.02,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFFFFF',
    fontSize: 15,
  },
  inputFocused: {
    borderColor: '#D4AF37',
  },
  primaryButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    color: '#B3B3B3',
    fontSize: 14,
  },
  switchLink: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
});

