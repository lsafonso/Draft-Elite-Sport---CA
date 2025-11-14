import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingScreenProps {
  onFinished: () => void;
}

const slides = [
  {
    title: 'Welcome to Draft Elite',
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

  // Animation for the gold ball (bounce/pulse) - welcome figure
  const ballTranslateY = useRef(new Animated.Value(0)).current;
  const ballScale = useRef(new Animated.Value(1)).current;

  // Animation for player figure
  const playerBallBounce = useRef(new Animated.Value(0)).current;
  const playerSway = useRef(new Animated.Value(0)).current;

  // Animation for discover/radar figure
  const radarInnerScale = useRef(new Animated.Value(1)).current;
  const radarDotAngle = useRef(new Animated.Value(0)).current;

  // Animation for slide transitions
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const slideTranslateX = useRef(new Animated.Value(0)).current;
  const isInitialMount = useRef(true);

  // Animate the welcome ball on mount and keep it looping
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

  // Animate player figure ball bounce
  useEffect(() => {
    const playerBallAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(playerBallBounce, {
          toValue: -6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(playerBallBounce, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    playerBallAnimation.start();
    return () => playerBallAnimation.stop();
  }, []);

  // Animate player slight sway
  useEffect(() => {
    const swayAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(playerSway, {
          toValue: 2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(playerSway, {
          toValue: -2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(playerSway, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    swayAnimation.start();
    return () => swayAnimation.stop();
  }, []);

  // Animate radar/discover figure
  useEffect(() => {
    const radarPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(radarInnerScale, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(radarInnerScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const radarRotate = Animated.loop(
      Animated.timing(radarDotAngle, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      })
    );

    radarPulse.start();
    radarRotate.start();
    return () => {
      radarPulse.stop();
      radarRotate.stop();
    };
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
      case 'player': {
        return (
          <Animated.View
            style={[
              styles.playerContainer,
              {
                transform: [{ translateX: playerSway }],
              },
            ]}
          >
            {/* Head */}
            <View style={styles.playerHead} />
            {/* Body */}
            <View style={styles.playerBody} />
            {/* Base/Legs */}
            <View style={styles.playerBase} />
            {/* Ball */}
            <Animated.View
              style={[
                styles.playerBall,
                {
                  transform: [{ translateY: playerBallBounce }],
                },
              ]}
            />
          </Animated.View>
        );
      }

      case 'discover': {
        const dotX = radarDotAngle.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, 20, 0, -20, 0],
        });
        const dotY = radarDotAngle.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [-20, 0, 20, 0, -20],
        });

        return (
          <View style={styles.radarContainer}>
            {/* Outer circle */}
            <View style={styles.radarOuter} />
            {/* Middle circle */}
            <View style={styles.radarMiddle} />
            {/* Inner circle with pulse */}
            <Animated.View
              style={[
                styles.radarInner,
                {
                  transform: [{ scale: radarInnerScale }],
                },
              ]}
            />
            {/* Rotating dot */}
            <Animated.View
              style={[
                styles.radarDot,
                {
                  transform: [{ translateX: dotX }, { translateY: dotY }],
                },
              ]}
            />
          </View>
        );
      }

      default: // 'welcome'
        return (
          <Animated.View
            style={[
              {
                transform: [
                  { translateY: ballTranslateY },
                  { scale: ballScale },
                ],
              },
            ]}
          >
            <View style={styles.ball}>
              <View style={styles.ballInner} />
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  figureWrapper: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Welcome figure styles
  ball: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ballInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A0A0A',
    opacity: 0.3,
  },
  // Player figure styles
  playerContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 80,
    width: 60,
    position: 'relative',
  },
  playerHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    marginBottom: 4,
  },
  playerBody: {
    width: 12,
    height: 45,
    backgroundColor: '#D4AF37',
    borderRadius: 6,
    marginBottom: 2,
  },
  playerBase: {
    width: 30,
    height: 4,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  playerBall: {
    position: 'absolute',
    right: -8,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D4AF37',
  },
  // Discover/Radar figure styles
  radarContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    backgroundColor: 'transparent',
  },
  radarMiddle: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#D4AF37',
    backgroundColor: 'transparent',
  },
  radarInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    opacity: 0.6,
  },
  radarDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
    top: 0,
    left: 36,
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
    letterSpacing: 0.6,
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

