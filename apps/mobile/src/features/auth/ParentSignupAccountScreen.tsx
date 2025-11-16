import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabaseClient';
import { DES_LOGO } from '../../lib/branding';

interface ParentSignupAccountScreenProps {
  onSignupComplete: (data: { fullName: string }) => void;
  onSwitchToLogin?: () => void;
}

export default function ParentSignupAccountScreen({
  onSignupComplete,
  onSwitchToLogin,
}: ParentSignupAccountScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullNameFocused, setIsFullNameFocused] = useState(false);
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

    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password;
      const trimmedFullName = fullName.trim();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            full_name: trimmedFullName,
            role: 'parent',
            account_type: 'parent',
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setError('There was a problem creating your account. Please try again.');
        setLoading(false);
        return;
      }

      // Success - go to signup complete screen
      onSignupComplete({
        fullName: trimmedFullName,
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
            Tell us who you are so we can get started.
          </Text>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Full name *</Text>
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
            </View>

            <View>
              <Text style={styles.label}>Email *</Text>
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
            </View>

            <View>
              <Text style={styles.label}>Password *</Text>
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
            </View>

            <View>
              <Text style={styles.label}>Confirm password *</Text>
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
            </View>

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
  label: {
    fontSize: 13,
    color: '#B3B3B3',
    marginBottom: 8,
    fontWeight: '500',
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

