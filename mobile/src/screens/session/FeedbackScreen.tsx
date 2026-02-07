import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing, borderRadius, avatarSizes } from '@theme/spacing';
import { RootStackParamList } from '@navigation/AppNavigator';
import { AnimatedButton } from '@components/ui/AnimatedButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Feedback'>;
type RouteType = RouteProp<RootStackParamList, 'Feedback'>;

const ratingEmojis = ['😠', '😕', '😐', '🙂', '😄'];

// Animated Rating Star
const RatingStar: React.FC<{
  index: number;
  isSelected: boolean;
  onPress: () => void;
}> = ({ index, isSelected, onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.8, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.ratingItem, animatedStyle]}>
        <Animated.Text
          style={[
            styles.ratingEmoji,
            !isSelected && styles.ratingEmojiInactive,
          ]}
        >
          {ratingEmojis[index]}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.ratingNumber,
            isSelected && styles.ratingNumberSelected,
          ]}
        >
          {index + 1}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === null) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    navigation.replace('MainTabs');
  };

  const handleFindNew = () => {
    if (rating !== null) {
      navigation.replace('Matching');
    }
  };

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={[styles.container, { paddingTop: insets.top + 20 }]}
    >
      {/* Session Info */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.sessionInfo}
      >
        <Animated.Text style={styles.title}>Session Ended</Animated.Text>

        {/* Partner Info */}
        <View style={styles.partnerCard}>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryLight]}
            style={styles.partnerAvatar}
          >
            <Animated.Text style={styles.partnerAvatarText}>J</Animated.Text>
          </LinearGradient>
          <Animated.Text style={styles.partnerName}>
            {route.params.partnerName}
          </Animated.Text>
          <Animated.Text style={styles.partnerLevel}>⭐ Level 7</Animated.Text>
        </View>

        <Animated.Text style={styles.sessionDuration}>
          Duration: 15 min 32 sec
        </Animated.Text>
      </Animated.View>

      {/* Rating Section */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={styles.ratingSection}
      >
        <Animated.Text style={styles.ratingTitle}>
          How was your experience?
        </Animated.Text>

        <View style={styles.ratingContainer}>
          {ratingEmojis.map((_, index) => (
            <RatingStar
              key={index}
              index={index}
              isSelected={rating !== null && index <= rating}
              onPress={() => setRating(index)}
            />
          ))}
        </View>
      </Animated.View>

      {/* Comment Section */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(500)}
        style={styles.commentSection}
      >
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment (optional)"
          placeholderTextColor={colors.textTertiary}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
        />
      </Animated.View>

      {/* Add Friend Button */}
      {rating !== null && rating >= 3 && (
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <TouchableOpacity style={styles.addFriendButton}>
            <Icon name="person-add-outline" size={20} color={colors.primary} />
            <Animated.Text style={styles.addFriendText}>
              Add as Friend
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        style={styles.actionButtons}
      >
        <AnimatedButton
          title="Submit Feedback"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          disabled={rating === null}
        />

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleFindNew}
            disabled={rating === null}
          >
            <Icon name="radio" size={20} color={colors.primary} />
            <Animated.Text style={styles.secondaryButtonText}>
              Find New Match
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.replace('MainTabs')}
          >
            <Icon name="home-outline" size={20} color={colors.textSecondary} />
            <Animated.Text
              style={[styles.secondaryButtonText, { color: colors.textSecondary }]}
            >
              Back to Home
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.h2,
    marginBottom: 24,
  },
  partnerCard: {
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerAvatar: {
    width: avatarSizes.xl,
    height: avatarSizes.xl,
    borderRadius: avatarSizes.xl / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerAvatarText: {
    ...typography.h1,
    color: '#FFFFFF',
  },
  partnerName: {
    ...typography.h3,
    marginBottom: 4,
  },
  partnerLevel: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  sessionDuration: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingTitle: {
    ...typography.h3,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  ratingEmojiInactive: {
    opacity: 0.4,
  },
  ratingNumber: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  ratingNumberSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    color: colors.textPrimary,
    ...typography.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addFriendText: {
    ...typography.button,
    color: colors.primary,
  },
  actionButtons: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
});
