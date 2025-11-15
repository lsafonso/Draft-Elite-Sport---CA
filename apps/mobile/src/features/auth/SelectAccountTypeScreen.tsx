import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DES_LOGO } from '../../lib/branding';

interface SelectAccountTypeScreenProps {
  onSelectAccountType: (accountType: 'player' | 'parent' | 'coach' | 'scout') => void;
  onSwitchToLogin?: () => void;
}

export default function SelectAccountTypeScreen({
  onSelectAccountType,
  onSwitchToLogin,
}: SelectAccountTypeScreenProps) {
  const handleSelectAccountType = (accountType: 'player' | 'parent' | 'coach' | 'scout') => {
    if (accountType === 'player') {
      onSelectAccountType('player');
    } else {
      // Show TODO alert for non-player account types
      Alert.alert(
        'Coming Soon',
        `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} account creation is not yet available.`,
        [{ text: 'OK' }]
      );
    }
  };

  const accountTypes = [
    { id: 'player', label: 'Player', description: 'Join as a player to showcase your skills' },
    { id: 'parent', label: 'Parent/Guardian', description: 'Manage your child\'s profile' },
    { id: 'coach', label: 'Coach', description: 'Discover and connect with players' },
    { id: 'scout', label: 'Scout', description: 'Find and evaluate talent' },
  ];

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

          <Text style={styles.title}>Choose your account type</Text>

          <Text style={styles.subtitle}>
            Tell us who you are to get the best experience.
          </Text>

          <View style={styles.accountTypesList}>
            {accountTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.accountTypeCard}
                onPress={() => handleSelectAccountType(type.id as 'player' | 'parent' | 'coach' | 'scout')}
                activeOpacity={0.7}
              >
                <View style={styles.accountTypeContent}>
                  <Text style={styles.accountTypeLabel}>{type.label}</Text>
                  <Text style={styles.accountTypeDescription}>{type.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account?</Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.switchLink}> Log in</Text>
            </TouchableOpacity>
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
  accountTypesList: {
    gap: 12,
    marginBottom: 24,
  },
  accountTypeCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 16,
  },
  accountTypeContent: {
    gap: 4,
  },
  accountTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  accountTypeDescription: {
    fontSize: 13,
    color: '#B3B3B3',
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

