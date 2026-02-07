import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { RootStackParamList } from '@navigation/AppNavigator';
import { AnimatedButton } from '@components/ui/AnimatedButton';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Matching'>;

// Animated Radar Ring
const RadarRing: React.FC<{ delay: number; size: number }> = ({ delay, size }) => {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.radarRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

// Animated Dot (for loading)
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.5, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return <Animated.View style={[styles.loadingDot, animatedStyle]} />;
};

export const MatchingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [queuePosition, setQueuePosition] = useState(12);
  const [estimatedWait, setEstimatedWait] = useState(30);
  const [matchFound, setMatchFound] = useState(false);

  // Simulate queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueuePosition((prev) => Math.max(1, prev - 1));
      setEstimatedWait((prev) => Math.max(5, prev - 3));
    }, 2000);

    // Simulate match found after some time
    const matchTimeout = setTimeout(() => {
      setMatchFound(true);
      clearInterval(interval);

      // Navigate to live session after animation
      setTimeout(() => {
        navigation.replace('LiveSession', {
          sessionId: 'ses_123',
          partnerId: 'usr_456',
        });
      }, 2000);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(matchTimeout);
    };
  }, []);

  const handleCancel = () => {
    navigation.goBack();
  };

  if (matchFound) {
    return <MatchFoundAnimation />;
  }

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      {/* Radar Animation */}
      <View style={styles.radarContainer}>
        <RadarRing delay={0} size={300} />
        <RadarRing delay={500} size={300} />
        <RadarRing delay={1000} size={300} />

        {/* Center Dot */}
        <View style={styles.radarCenter}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.radarCenterGradient}
          />
        </View>
      </View>

      {/* Text Content */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(500)}
        style={styles.content}
      >
        <Animated.Text style={styles.title}>Finding your match...</Animated.Text>

        {/* Loading Dots */}
        <View style={styles.loadingDots}>
          <LoadingDot delay={0} />
          <LoadingDot delay={150} />
          <LoadingDot delay={300} />
        </View>

        {/* Queue Info */}
        <View style={styles.queueInfo}>
          <View style={styles.queueItem}>
            <Animated.Text style={styles.queueLabel}>Queue Position</Animated.Text>
            <Animated.Text style={styles.queueValue}>#{queuePosition}</Animated.Text>
          </View>
          <View style={styles.queueDivider} />
          <View style={styles.queueItem}>
            <Animated.Text style={styles.queueLabel}>Est. Wait</Animated.Text>
            <Animated.Text style={styles.queueValue}>~{estimatedWait}s</Animated.Text>
          </View>
        </View>
      </Animated.View>

      {/* Cancel Button */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        style={styles.cancelContainer}
      >
        <AnimatedButton
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
        />
      </Animated.View>
    </LinearGradient>
  );
};

// Match Found Animation Component
const MatchFoundAnimation: React.FC = () => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(1, { duration: 200 })
    );
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <Animated.View style={[styles.matchFoundContainer, containerStyle]}>
        <Animated.Text style={styles.matchFoundEmoji}>🎉</Animated.Text>
        <Animated.Text style={styles.matchFoundTitle}>Match Found!</Animated.Text>
        <Animated.Text style={styles.matchFoundSubtitle}>
          Connecting in 3...
        </Animated.Text>

        {/* Avatars */}
        <View style={styles.avatarsContainer}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.matchAvatar}
          >
            <Animated.Text style={styles.matchAvatarText}>J</Animated.Text>
          </LinearGradient>
          <Animated.Text style={styles.matchVs}>⚡</Animated.Text>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryLight]}
            style={styles.matchAvatar}
          >
            <Animated.Text style={styles.matchAvatarText}>?</Animated.Text>
          </LinearGradient>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  radarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  radarCenterGradient: {
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  queueInfo: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 20,
    gap: 24,
  },
  queueItem: {
    alignItems: 'center',
  },
  queueLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  queueValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  queueDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  cancelContainer: {
    position: 'absolute',
    bottom: 50,
    left: spacing.screenHorizontal,
    right: spacing.screenHorizontal,
  },
  // Match Found styles
  matchFoundContainer: {
    alignItems: 'center',
  },
  matchFoundEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  matchFoundTitle: {
    ...typography.displayMedium,
    marginBottom: 8,
  },
  matchFoundSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  matchAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchAvatarText: {
    ...typography.displayMedium,
    color: '#FFFFFF',
  },
  matchVs: {
    fontSize: 32,
  },
});
