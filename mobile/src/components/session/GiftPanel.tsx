import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'react-native-haptic-feedback';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { borderRadius, spacing } from '@theme/spacing';
import { AnimatedButton } from '@components/ui/AnimatedButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Gift {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

const gifts: Gift[] = [
  { id: 'wave', name: 'Wave', emoji: '👋', price: 5 },
  { id: 'heart', name: 'Heart', emoji: '❤️', price: 10 },
  { id: 'star', name: 'Star', emoji: '🌟', price: 25 },
  { id: 'gift', name: 'Gift Box', emoji: '🎁', price: 50 },
  { id: 'diamond', name: 'Diamond', emoji: '💎', price: 100 },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', price: 500 },
];

interface GiftPanelProps {
  onClose: () => void;
  onSendGift: (gift: Gift) => void;
  balance?: number;
}

// Individual Gift Item
const GiftItem: React.FC<{
  gift: Gift;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}> = ({ gift, isSelected, onSelect, disabled }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, {}, () => {
        scale.value = withSpring(1);
      });
      Haptics.trigger('impactLight');
      onSelect();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.giftItem,
          isSelected && styles.giftItemSelected,
          disabled && styles.giftItemDisabled,
          animatedStyle,
        ]}
      >
        <Animated.Text style={styles.giftEmoji}>{gift.emoji}</Animated.Text>
        <Animated.Text style={styles.giftPrice}>{gift.price}</Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const GiftPanel: React.FC<GiftPanelProps> = ({
  onClose,
  onSendGift,
  balance = 150,
}) => {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  const handleSend = () => {
    if (selectedGift) {
      Haptics.trigger('notificationSuccess');
      onSendGift(selectedGift);
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        entering={SlideInDown.duration(300).springify()}
        style={styles.panel}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dragIndicator} />
          <Animated.Text style={styles.title}>Send a Gift</Animated.Text>
          <View style={styles.balanceContainer}>
            <Icon name="wallet-outline" size={16} color={colors.warning} />
            <Animated.Text style={styles.balanceText}>
              {balance} coins
            </Animated.Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Gifts Grid */}
        <View style={styles.giftsContainer}>
          <View style={styles.giftsRow}>
            {gifts.slice(0, 5).map((gift) => (
              <GiftItem
                key={gift.id}
                gift={gift}
                isSelected={selectedGift?.id === gift.id}
                onSelect={() => setSelectedGift(gift)}
                disabled={gift.price > balance}
              />
            ))}
          </View>
          <View style={styles.giftsRowCenter}>
            {gifts.slice(5).map((gift) => (
              <GiftItem
                key={gift.id}
                gift={gift}
                isSelected={selectedGift?.id === gift.id}
                onSelect={() => setSelectedGift(gift)}
                disabled={gift.price > balance}
              />
            ))}
          </View>
        </View>

        {/* Selected Info */}
        {selectedGift && (
          <Animated.Text style={styles.selectedInfo}>
            Selected: {selectedGift.emoji} {selectedGift.name} ({selectedGift.price} coins)
          </Animated.Text>
        )}

        {/* Send Button */}
        <View style={styles.buttonContainer}>
          <AnimatedButton
            title="Send Gift"
            onPress={handleSend}
            disabled={!selectedGift}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.textTertiary,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceText: {
    ...typography.body,
    color: colors.warning,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: 0,
    padding: 8,
  },
  giftsContainer: {
    paddingVertical: spacing.lg,
  },
  giftsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  giftsRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  giftItem: {
    width: 60,
    height: 70,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  giftItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  giftItemDisabled: {
    opacity: 0.4,
  },
  giftEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  giftPrice: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  selectedInfo: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  buttonContainer: {
    paddingTop: spacing.sm,
  },
});
