import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { RootStackParamList } from '@navigation/AppNavigator';
import { GoLiveButton } from '@components/ui/GoLiveButton';
import { StatCard } from '@components/ui/StatCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const handleGoLive = () => {
    navigation.navigate('Matching');
  };

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
          <View>
            <Animated.Text style={styles.logo}>PAIRLIVE</Animated.Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="notifications-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.coinButton}>
              <Icon name="wallet-outline" size={18} color={colors.warning} />
              <Animated.Text style={styles.coinText}>150</Animated.Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Greeting */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.greetingSection}
        >
          <Animated.Text style={styles.greeting}>Good Evening,</Animated.Text>
          <Animated.Text style={styles.userName}>John! 👋</Animated.Text>
          <Animated.Text style={styles.subtitle}>
            Ready to meet someone new?
          </Animated.Text>
        </Animated.View>

        {/* GO LIVE Button */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          style={styles.goLiveSection}
        >
          <GoLiveButton onPress={handleGoLive} />
          <Animated.Text style={styles.goLiveHint}>
            Tap to find your match
          </Animated.Text>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Animated.Text style={styles.sectionTitle}>📊 Your Stats</Animated.Text>
          <View style={styles.statsGrid}>
            <StatCard
              value="42"
              label="Sessions"
              icon="videocam-outline"
              delay={500}
            />
            <StatCard
              value="4.2"
              label="Rating"
              icon="star-outline"
              iconColor={colors.warning}
              delay={600}
            />
            <StatCard
              value="15"
              label="Friends"
              icon="people-outline"
              delay={700}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.actionsSection}
        >
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="time-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Animated.Text style={styles.actionTitle}>Session History</Animated.Text>
              <Animated.Text style={styles.actionSubtitle}>
                View your past connections
              </Animated.Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Icon name="gift-outline" size={24} color={colors.secondary} />
            </View>
            <View style={styles.actionContent}>
              <Animated.Text style={styles.actionTitle}>Get Coins</Animated.Text>
              <Animated.Text style={styles.actionSubtitle}>
                Send gifts to your matches
              </Animated.Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
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
  logo: {
    ...typography.h2,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  coinText: {
    ...typography.button,
    color: colors.warning,
  },
  greetingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    ...typography.h2,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.displayMedium,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  goLiveSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  goLiveHint: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 16,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionsSection: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.h4,
    marginBottom: 2,
  },
  actionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
