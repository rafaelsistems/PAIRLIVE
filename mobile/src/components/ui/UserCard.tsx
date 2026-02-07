import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'react-native-haptic-feedback';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { borderRadius, spacing, avatarSizes } from '@theme/spacing';

interface UserCardProps {
  name: string;
  avatarUrl?: string;
  subtitle?: string;
  isOnline?: boolean;
  onPress?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  name,
  avatarUrl,
  subtitle,
  isOnline = false,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    Haptics.trigger('impactLight');
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Animated.Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.avatar}
            >
              <Animated.Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Animated.Text>
            </LinearGradient>
          )}

          {/* Online Indicator */}
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Animated.Text style={styles.name}>{name}</Animated.Text>
          {subtitle && (
            <Animated.Text style={styles.subtitle}>{subtitle}</Animated.Text>
          )}
        </View>

        {/* Chevron */}
        <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: avatarSizes.lg,
    height: avatarSizes.lg,
    borderRadius: avatarSizes.lg / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
