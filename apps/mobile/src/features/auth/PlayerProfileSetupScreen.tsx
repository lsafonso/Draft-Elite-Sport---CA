import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DES_LOGO } from '../../lib/branding';

interface PlayerProfileSetupScreenProps {
  fullName: string;
  dateOfBirth: string;
  isUnder18: boolean;
  onProfileCompleted: (profileData: {
    position: string;
    location: string;
    nationality: string;
    clubName?: string;
    height?: string;
    weight?: string;
    preferredFoot: string;
    highlightVideoLink?: string;
    isUnder18: boolean;
  }) => void;
  onSwitchToLogin?: () => void;
}

const POSITIONS = [
  'Goalkeeper',
  'Defender',
  'Midfielder',
  'Forward',
  'Winger',
];

const PREFERRED_FOOT_OPTIONS = ['Left', 'Right', 'Both'];

export default function PlayerProfileSetupScreen({
  fullName,
  dateOfBirth,
  isUnder18,
  onProfileCompleted,
  onSwitchToLogin,
}: PlayerProfileSetupScreenProps) {
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [nationality, setNationality] = useState('');
  const [clubName, setClubName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [preferredFoot, setPreferredFoot] = useState('');
  const [highlightVideoLink, setHighlightVideoLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [showFootPicker, setShowFootPicker] = useState(false);

  // Extract first name for greeting
  const firstName = fullName.split(' ')[0] || fullName;

  const handleComplete = () => {
    setError(null);

    // Validation
    if (!position.trim()) {
      setError('Position is required.');
      return;
    }

    if (!location.trim()) {
      setError('Location is required.');
      return;
    }

    if (!nationality.trim()) {
      setError('Nationality is required.');
      return;
    }

    if (!preferredFoot.trim()) {
      setError('Preferred foot is required.');
      return;
    }

    const profileData = {
      position: position.trim(),
      location: location.trim(),
      nationality: nationality.trim(),
      clubName: clubName.trim() || undefined,
      height: height.trim() || undefined,
      weight: weight.trim() || undefined,
      preferredFoot: preferredFoot.trim(),
      highlightVideoLink: highlightVideoLink.trim() || undefined,
      isUnder18,
    };

    // Saving is handled in the parent via savePlayerProfile
    setLoading(true);
    
    // Simulate a brief delay for UX
    setTimeout(() => {
      onProfileCompleted(profileData);
      setLoading(false);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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

            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Step 2 of 2</Text>
            </View>

            <Text style={styles.title}>You're almost there</Text>

            <Text style={styles.subtitle}>
              Step 2 of 2. Tell us more about your game so we can match you with the right opportunities.
            </Text>

            {isUnder18 && (
              <View style={styles.under18Banner}>
                <Text style={styles.under18BannerText}>
                  We've detected you are under 18. Please ask a parent or guardian to review your details before you submit.
                </Text>
              </View>
            )}

            <Text style={styles.greeting}>
              Hi {firstName}, let's set up your player profile.
            </Text>

            <View style={styles.form}>
              {/* Position - Required */}
              <View>
                <Text style={styles.label}>Position *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.pickerInput]}
                  onPress={() => {
                    setShowFootPicker(false);
                    setShowPositionPicker(!showPositionPicker);
                  }}
                >
                  <Text style={[styles.pickerText, !position && styles.placeholderText]}>
                    {position || 'Select position'}
                  </Text>
                </TouchableOpacity>
                {showPositionPicker && (
                  <View style={styles.pickerOptions}>
                    {POSITIONS.map((pos) => (
                      <TouchableOpacity
                        key={pos}
                        style={styles.pickerOption}
                        onPress={() => {
                          setPosition(pos);
                          setShowPositionPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{pos}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Location - Required */}
              <View>
                <Text style={styles.label}>Location *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Belfast, Northern Ireland"
                  placeholderTextColor="#777777"
                  value={location}
                  onChangeText={setLocation}
                  autoCapitalize="words"
                />
              </View>

              {/* Nationality - Required */}
              <View>
                <Text style={styles.label}>Nationality *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. British"
                  placeholderTextColor="#777777"
                  value={nationality}
                  onChangeText={setNationality}
                  autoCapitalize="words"
                />
              </View>

              {/* Club Name - Optional */}
              <View>
                <Text style={styles.label}>Club name (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Current club name"
                  placeholderTextColor="#777777"
                  value={clubName}
                  onChangeText={setClubName}
                  autoCapitalize="words"
                />
              </View>

              {/* Height - Optional */}
              <View>
                <Text style={styles.label}>Height (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 180 (cm)"
                  placeholderTextColor="#777777"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>

              {/* Weight - Optional */}
              <View>
                <Text style={styles.label}>Weight (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 75 (kg)"
                  placeholderTextColor="#777777"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>

              {/* Preferred Foot - Required */}
              <View>
                <Text style={styles.label}>Preferred foot *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.pickerInput]}
                  onPress={() => {
                    setShowPositionPicker(false);
                    setShowFootPicker(!showFootPicker);
                  }}
                >
                  <Text style={[styles.pickerText, !preferredFoot && styles.placeholderText]}>
                    {preferredFoot || 'Select preferred foot'}
                  </Text>
                </TouchableOpacity>
                {showFootPicker && (
                  <View style={styles.pickerOptions}>
                    {PREFERRED_FOOT_OPTIONS.map((foot) => (
                      <TouchableOpacity
                        key={foot}
                        style={styles.pickerOption}
                        onPress={() => {
                          setPreferredFoot(foot);
                          setShowFootPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{foot}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Highlight Video Link - Optional */}
              <View>
                <Text style={styles.label}>Highlight video link (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor="#777777"
                  value={highlightVideoLink}
                  onChangeText={setHighlightVideoLink}
                  autoCapitalize="none"
                  keyboardType="url"
                  autoComplete="url"
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.primaryButtonText}>Complete profile</Text>
                )}
              </TouchableOpacity>

              {onSwitchToLogin && (
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Already have an account?</Text>
                  <TouchableOpacity onPress={onSwitchToLogin}>
                    <Text style={styles.switchLink}> Log in</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    paddingBottom: 32,
  },
  logo: {
    width: 120,
    height: 90,
    marginBottom: 32,
    alignSelf: 'center',
    opacity: 0.02,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#141414',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  stepBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  greeting: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 24,
    fontWeight: '500',
  },
  under18Banner: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  under18BannerText: {
    fontSize: 13,
    color: '#D4AF37',
    lineHeight: 18,
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
  pickerInput: {
    justifyContent: 'center',
  },
  pickerText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  placeholderText: {
    color: '#777777',
  },
  pickerOptions: {
    marginTop: 4,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
    zIndex: 10,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  pickerOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
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

