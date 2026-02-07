import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing, borderRadius, avatarSizes } from '@theme/spacing';
import { StatCard } from '@components/ui/StatCard';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View style={styles.headerSpacer} />
          <TouchableOpacity>
            <Icon name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.profileCard}
        >
          {/* Avatar */}
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.Text style={styles.avatarText}>J</Animated.Text>
          </LinearGradient>

          <Animated.Text style={styles.displayName}>JohnD</Animated.Text>
          <View style={styles.levelContainer}>
            <Icon name="star" size={16} color={colors.warning} />
            <Animated.Text style={styles.levelText}>Level 5</Animated.Text>
          </View>

          {/* Badges */}
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Animated.Text style={styles.badgeText}>🏆 early_adopter</Animated.Text>
            </View>
            <View style={styles.badge}>
              <Animated.Text style={styles.badgeText}>💬 friendly</Animated.Text>
            </View>
            <View style={styles.badge}>
              <Animated.Text style={styles.badgeText}>💎 generous</Animated.Text>
            </View>
          </View>
        </Animated.View>

        {/* Coins Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <TouchableOpacity style={styles.coinsCard}>
            <View style={styles.coinsLeft}>
              <Icon name="wallet" size={24} color={colors.warning} />
              <View>
                <Animated.Text style={styles.coinsLabel}>Coins</Animated.Text>
                <Animated.Text style={styles.coinsValue}>150</Animated.Text>
              </View>
            </View>
            <View style={styles.getMoreButton}>
              <Animated.Text style={styles.getMoreText}>Get More</Animated.Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats */}
        <Animated.Text
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.sectionTitle}
        >
          📊 Statistics
        </Animated.Text>
        <View style={styles.statsGrid}>
          <StatCard value="42" label="Sessions" icon="videocam-outline" delay={450} />
          <StatCard value="4.2" label="Rating" icon="star-outline" iconColor={colors.warning} delay={500} />
          <StatCard value="15" label="Friends" icon="people-outline" delay={550} />
        </View>
        <View style={styles.statsGrid}>
          <StatCard value="3.5h" label="Total Time" icon="time-outline" delay={600} />
          <StatCard value="230" label="Received" icon="gift-outline" iconColor={colors.success} delay={650} />
          <StatCard value="85" label="Sent" icon="gift-outline" iconColor={colors.primary} delay={700} />
        </View>

        {/* Menu Items */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.menuSection}
        >
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="time-outline" size={22} color={colors.textPrimary} />
            <Animated.Text style={styles.menuItemText}>Session History</Animated.Text>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="card-outline" size={22} color={colors.textPrimary} />
            <Animated.Text style={styles.menuItemText}>Transaction History</Animated.Text>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerSpacer: {
    width: 24,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: avatarSizes.giant,
    height: avatarSizes.giant,
    borderRadius: avatarSizes.giant / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    ...typography.displayLarge,
    color: '#FFFFFF',
  },
  displayName: {
    ...typography.h1,
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  levelText: {
    ...typography.body,
    color: colors.warning,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  coinsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    marginBottom: 24,
  },
  coinsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinsLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  coinsValue: {
    ...typography.h2,
    color: colors.warning,
  },
  getMoreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  getMoreText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  menuSection: {
    marginTop: 12,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 12,
  },
  menuItemText: {
    ...typography.body,
    flex: 1,
  },
});
