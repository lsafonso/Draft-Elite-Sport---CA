import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DES_LOGO } from '../../lib/branding';

type SignupCompleteScreenProps = {
  fullName?: string;
  isUnder18?: boolean;
  onBackToLogin: () => void;
};

export default function SignupCompleteScreen({
  fullName,
  isUnder18,
  onBackToLogin,
}: SignupCompleteScreenProps) {
  // Compute firstName from fullName (split on space, take first) and fallback to "Thanks" if not provided
  const firstName = fullName ? fullName.split(' ')[0] || 'Thanks' : 'Thanks';

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

          <Text style={styles.title}>Thanks, {firstName}!</Text>

          <View style={styles.body}>
            <Text style={styles.bodyText}>
              Your Draft Elite Sport profile has been created.
            </Text>
            <Text style={styles.bodyText}>
              Our staff will review your details before you can apply for trials.
            </Text>
            {isUnder18 && (
              <Text style={styles.under18Text}>
                Because you are under 18, some trials may also require a parent or guardian to be present.
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onBackToLogin}
          >
            <Text style={styles.primaryButtonText}>Back to login</Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            You can update your details later from your profile.
          </Text>
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
  body: {
    marginBottom: 32,
    gap: 12,
  },
  bodyText: {
    fontSize: 14,
    color: '#B3B3B3',
    lineHeight: 20,
  },
  under18Text: {
    fontSize: 13,
    color: '#D4AF37',
    lineHeight: 18,
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});

