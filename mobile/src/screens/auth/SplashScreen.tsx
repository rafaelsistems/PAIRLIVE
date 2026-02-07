import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { RootStackParamList } from '@navigation/AppNavigator';
import { RootState } from '@store/index';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const dotScale = useSharedValue(0);
  const dot2Scale = useSharedValue(0);
  const dot3Scale = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 500 });

    // Text animation
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));

    // Tagline animation
    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    // Loading dots animation
    const animateDots = () => {
      dotScale.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.5, { duration: 300 })
      );
      dot2Scale.value = withDelay(
        150,
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.5, { duration: 300 })
        )
      );
      dot3Scale.value = withDelay(
        300,
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.5, { duration: 300 })
        )
      );
    };

    const dotsInterval = setInterval(animateDots, 900);
    animateDots();

    // Navigate after delay
    const timeout = setTimeout(() => {
      clearInterval(dotsInterval);
      if (isAuthenticated) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Welcome');
      }
    }, 2500);

    return () => {
      clearTimeout(timeout);
      clearInterval(dotsInterval);
    };
  }, [navigation, isAuthenticated]);

  // Animated styles
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const dotStyle = (scaleValue: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
      opacity: scaleValue.value,
    }));

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.logo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.logoInner}>
              <View style={styles.logoDot} />
              <View style={styles.logoDot} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* App Name */}
        <Animated.Text style={[styles.appName, textStyle]}>
          PAIRLIVE
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          One Random. One Live. One Connection.
        </Animated.Text>

        {/* Loading Dots */}
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingDot, dotStyle(dotScale)]} />
          <Animated.View style={[styles.loadingDot, dotStyle(dot2Scale)]} />
          <Animated.View style={[styles.loadingDot, dotStyle(dot3Scale)]} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    flexDirection: 'row',
    gap: 12,
  },
  logoDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  appName: {
    ...typography.displayLarge,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 48,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
