import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../providers/AuthProvider';
import { DES_LOGO } from '../../lib/branding';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={DES_LOGO.default} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Log in</Text>

        <Text style={styles.subtitle}>
          Welcome back to Draft Elite Sport.
        </Text>

        <View style={styles.form}>
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
            autoComplete="password"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 32,
    alignSelf: 'center',
    opacity: 0.85,
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
});

