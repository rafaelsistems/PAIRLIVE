import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { RootStackParamList } from '@navigation/AppNavigator';
import { AnimatedIconButton } from '@components/ui/AnimatedIconButton';
import { GiftPanel } from '@components/session/GiftPanel';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveSession'>;
type RouteType = RouteProp<RootStackParamList, 'LiveSession'>;

export const LiveSessionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(30);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Skip countdown
  useEffect(() => {
    if (skipCountdown > 0) {
      const timer = setTimeout(() => {
        setSkipCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [skipCountdown]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    navigation.replace('Feedback', {
      sessionId: route.params.sessionId,
      partnerName: 'JaneD',
    });
  };

  const handleSkip = () => {
    if (canSkip) {
      navigation.replace('Matching');
    }
  };

  return (
    <View style={styles.container}>
      {/* Partner Video (Full Screen Background) */}
      <View style={styles.partnerVideo}>
        <LinearGradient
          colors={[colors.secondary, colors.secondaryLight]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Placeholder for actual video */}
        <View style={styles.partnerPlaceholder}>
          <Animated.Text style={styles.partnerInitial}>J</Animated.Text>
        </View>
      </View>

      {/* Top Bar */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(500)}
        style={[styles.topBar, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.partnerInfo}>
          <View style={styles.partnerAvatar}>
            <Text style={styles.partnerAvatarText}>J</Text>
          </View>
          <View>
            <Animated.Text style={styles.partnerName}>JaneD</Animated.Text>
            <Animated.Text style={styles.partnerLevel}>⭐ Level 7</Animated.Text>
          </View>
        </View>

        <View style={styles.sessionTimer}>
          <View style={styles.liveIndicator} />
          <Animated.Text style={styles.timerText}>
            {formatDuration(sessionDuration)}
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Self Video (PIP) */}
      <Animated.View
        entering={FadeIn.delay(500).duration(500)}
        style={styles.selfVideo}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          style={StyleSheet.absoluteFillObject}
        />
        {!isVideoEnabled && (
          <View style={styles.videoOff}>
            <Icon name="videocam-off" size={24} color={colors.textPrimary} />
          </View>
        )}
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        entering={SlideInDown.delay(400).duration(500)}
        style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <AnimatedIconButton
            icon={isAudioEnabled ? 'mic' : 'mic-off'}
            onPress={() => setIsAudioEnabled(!isAudioEnabled)}
            isActive={isAudioEnabled}
            label="Mute"
          />
          <AnimatedIconButton
            icon={isVideoEnabled ? 'videocam' : 'videocam-off'}
            onPress={() => setIsVideoEnabled(!isVideoEnabled)}
            isActive={isVideoEnabled}
            label="Camera"
          />
          <AnimatedIconButton
            icon="gift"
            onPress={() => setShowGiftPanel(true)}
            color={colors.warning}
            label="Gift"
          />
          <AnimatedIconButton
            icon="play-skip-forward"
            onPress={handleSkip}
            disabled={!canSkip}
            label={canSkip ? 'Skip' : `${skipCountdown}s`}
          />
          <AnimatedIconButton
            icon="exit"
            onPress={handleEndSession}
            color={colors.error}
            label="End"
          />
        </View>

        {/* Report Button */}
        <TouchableOpacity style={styles.reportButton}>
          <Icon name="warning-outline" size={16} color={colors.textTertiary} />
          <Animated.Text style={styles.reportText}>Report</Animated.Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Gift Panel */}
      {showGiftPanel && (
        <GiftPanel
          onClose={() => setShowGiftPanel(false)}
          onSendGift={(gift) => {
            console.log('Send gift:', gift);
            setShowGiftPanel(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  partnerVideo: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInitial: {
    ...typography.displayLarge,
    color: '#FFFFFF',
    fontSize: 48,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: borderRadius.full,
    padding: 8,
    paddingRight: 16,
    gap: 10,
  },
  partnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerAvatarText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  partnerName: {
    ...typography.button,
    color: '#FFFFFF',
  },
  partnerLevel: {
    ...typography.caption,
    color: colors.warning,
  },
  sessionTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  timerText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  selfVideo: {
    position: 'absolute',
    top: 120,
    right: spacing.screenHorizontal,
    width: 100,
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  videoOff: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.screenHorizontal,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
  },
  reportText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
