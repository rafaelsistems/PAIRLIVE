import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import * as Haptics from 'react-native-haptic-feedback';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { borderRadius } from '@theme/spacing';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  icon,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isDisabled = disabled || isLoading;

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.97);
      opacity.value = withTiming(0.9);
      Haptics.trigger('impactLight');
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  const handlePress = () => {
    if (!isDisabled) {
      Haptics.trigger('impactMedium');
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDisabled ? 0.5 : opacity.value,
  }));

  const renderContent = () => (
    <Animated.View style={styles.content}>
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
          <Animated.Text
            style={[
              styles.text,
              variant === 'outline' && styles.textOutline,
            ]}
          >
            {title}
          </Animated.Text>
        </>
      )}
    </Animated.View>
  );

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        disabled={isDisabled}
      >
        <Animated.View style={[styles.outlineButton, animatedStyle, style]}>
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
      disabled={isDisabled}
    >
      <Animated.View style={[animatedStyle, style]}>
        <LinearGradient
          colors={
            variant === 'secondary'
              ? [colors.secondary, colors.secondaryLight]
              : colors.gradients.primary
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  outlineButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    ...typography.buttonLarge,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  textOutline: {
    color: colors.primary,
  },
});
