import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { borderRadius, spacing } from '@theme/spacing';

interface StatCardProps {
  value: string;
  label: string;
  icon?: string;
  iconColor?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  iconColor = colors.primary,
  delay = 0,
}) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(500)}
      style={styles.container}
    >
      {icon && (
        <Icon
          name={icon}
          size={20}
          color={iconColor}
          style={styles.icon}
        />
      )}
      <Animated.Text style={styles.value}>{value}</Animated.Text>
      <Animated.Text style={styles.label}>{label}</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  value: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
