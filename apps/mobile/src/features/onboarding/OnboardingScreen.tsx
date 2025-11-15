import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { DES_LOGO } from '../../lib/branding';

interface OnboardingScreenProps {
  onFinished: () => void;
}

const slides = [
  {
    title: 'Welcome to Draft Elite Sport',
    body: 'Create your football profile and get seen by elite clubs and scouts.',
    figure: 'welcome',
  },
  {
    title: 'Showcase your talent',
    body: 'Add positions, highlights and career history so scouts see the full picture.',
    figure: 'player',
  },
  {
    title: 'Discover real talent',
    body: 'Search players by age, position and location, and track your favourites.',
    figure: 'discover',
  },
];

export default function OnboardingScreen({ onFinished }: OnboardingScreenProps) {
  const [index, setIndex] = useState(0);
  const currentSlide = slides[index];
  const isLastSlide = index === slides.length - 1;
  const showWatermark = currentSlide.figure === 'welcome';

  // Animation for icons (bounce/pulse)
  const ballTranslateY = useRef(new Animated.Value(0)).current;
  const ballScale = useRef(new Animated.Value(1)).current;

  // Animation for discover/radar figure
  const radarScale = useRef(new Animated.Value(1)).current;

  // Animation for slide transitions
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const slideTranslateX = useRef(new Animated.Value(0)).current;
  const isInitialMount = useRef(true);

  // Animate icons with bounce/pulse on mount and keep it looping
  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ballTranslateY, {
            toValue: -10,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(ballScale, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ballTranslateY, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(ballScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    bounceAnimation.start();
    return () => bounceAnimation.stop();
  }, []);

  // Animate radar/discover figure with gentle pulse
  useEffect(() => {
    const radarPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(radarScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(radarScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    radarPulse.start();
    return () => radarPulse.stop();
  }, []);

  // Animate slide transition when index changes
  useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Reset and animate in
    slideOpacity.setValue(0);
    slideTranslateX.setValue(20);

    Animated.parallel([
      Animated.timing(slideOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideTranslateX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handleNext = () => {
    if (isLastSlide) {
      onFinished();
    } else {
      setIndex(index + 1);
    }
  };

  const handleSkip = () => {
    onFinished();
  };

  const renderFigure = (figure: string) => {
    switch (figure) {
      case 'player':
        return (
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: ballScale },
                  { translateY: ballTranslateY },
                ],
              },
            ]}
          >
            <View style={styles.iconGlow}>
              <FontAwesome5 name="running" size={90} color="#D4AF37" />
              <View style={styles.playerBallIcon}>
                <FontAwesome5 name="futbol" size={28} color="#D4AF37" />
              </View>
            </View>
          </Animated.View>
        );

      case 'discover':
        return (
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: radarScale }],
              },
            ]}
          >
            <View style={styles.iconGlow}>
              <MaterialCommunityIcons
                name="radar"
                size={96}
                color="#D4AF37"
              />
            </View>
          </Animated.View>
        );

      case 'welcome':
      default:
        return (
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { scale: ballScale },
                  { translateY: ballTranslateY },
                ],
              },
            ]}
          >
            <View style={styles.iconGlow}>
              <MaterialCommunityIcons
                name="soccer-field"
                size={96}
                color="#D4AF37"
              />
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {showWatermark && (
          <View style={styles.watermarkContainer}>
            <Image
              source={DES_LOGO}
              style={styles.watermarkLogo}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={styles.foregroundContent}>
          {/* Animated figure */}
          <View style={styles.figureWrapper}>
            {renderFigure(currentSlide.figure)}
          </View>

          {/* Animated slide content */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: slideOpacity,
                transform: [{ translateX: slideTranslateX }],
              },
            ]}
          >
            <Text style={styles.title}>{currentSlide.title}</Text>
            <Text style={styles.body}>{currentSlide.body}</Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={[styles.primaryButton, isLastSlide && styles.getStartedButton]}
          >
            <Text style={styles.primaryButtonText}>
              {isLastSlide ? 'Get started' : 'Next'}
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
    width: 360,
    height: 360,
    opacity: 0.06,
  },
  foregroundContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  figureWrapper: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 140,
  },
  iconGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 999,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  playerBallIcon: {
    position: 'absolute',
    right: -16,
    bottom: -8,
  },
  textContainer: {
    maxWidth: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.4,
  },
  body: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2F2F2F',
  },
  dotActive: {
    backgroundColor: '#D4AF37',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#8B8B8B',
    fontSize: 16,
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minWidth: 120,
  },
  getStartedButton: {
    flex: 1,
    marginLeft: 16,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

