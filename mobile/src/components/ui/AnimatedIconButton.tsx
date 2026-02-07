import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'react-native-haptic-feedback';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

interface AnimatedIconButtonProps {
  icon: string;
  onPress: () => void;
  isActive?: boolean;
  disabled?: boolean;
  color?: string;
  label?: string;
  size?: number;
}

export const AnimatedIconButton: React.FC<AnimatedIconButtonProps> = ({
  icon,
  onPress,
  isActive = true,
  disabled = false,
  color,
  label,
  size = 48,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9);
      Haptics.trigger('impactLight');
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = disabled
    ? colors.textTertiary
    : color || (isActive ? colors.textPrimary : colors.textTertiary);

  const backgroundColor = isActive
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(255, 255, 255, 0.05)';

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <View
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <Icon name={icon} size={size * 0.45} color={iconColor} />
        </View>
        {label && (
          <Animated.Text
            style={[
              styles.label,
              { color: disabled ? colors.textTertiary : colors.textSecondary },
            ]}
          >
            {label}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    marginTop: 4,
  },
});
