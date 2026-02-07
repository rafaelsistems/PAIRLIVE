import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing } from '@theme/spacing';
import { UserCard } from '@components/ui/UserCard';
import { AnimatedInput } from '@components/ui/AnimatedInput';

const mockFriends = [
  { id: '1', name: 'JaneD', isOnline: true, lastSeen: null },
  { id: '2', name: 'Mike', isOnline: true, lastSeen: null },
  { id: '3', name: 'Sarah', isOnline: false, lastSeen: '2h ago' },
  { id: '4', name: 'Tom', isOnline: false, lastSeen: '1d ago' },
  { id: '5', name: 'Emma', isOnline: false, lastSeen: '3d ago' },
];

export const FriendsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = React.useState('');

  const onlineFriends = mockFriends.filter((f) => f.isOnline);
  const offlineFriends = mockFriends.filter((f) => !f.isOnline);

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.Text
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.title}
        >
          Friends
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <AnimatedInput
            placeholder="Search friends..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search-outline"
          />
        </Animated.View>
      </View>

      <FlatList
        data={[
          { type: 'section', title: `Online Now (${onlineFriends.length})` },
          ...onlineFriends.map((f) => ({ type: 'friend', ...f })),
          { type: 'section', title: `All Friends (${mockFriends.length})` },
          ...offlineFriends.map((f) => ({ type: 'friend', ...f })),
        ]}
        keyExtractor={(item, index) =>
          item.type === 'section' ? `section-${index}` : item.id
        }
        renderItem={({ item, index }) => {
          if (item.type === 'section') {
            return (
              <Animated.Text
                entering={FadeInDown.delay(300 + index * 50).duration(500)}
                style={styles.sectionTitle}
              >
                {item.title}
              </Animated.Text>
            );
          }
          return (
            <Animated.View entering={FadeInDown.delay(300 + index * 50).duration(500)}>
              <UserCard
                name={item.name}
                isOnline={item.isOnline}
                subtitle={item.isOnline ? 'Online' : `Last seen ${item.lastSeen}`}
                onPress={() => {}}
              />
            </Animated.View>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 16,
  },
  title: {
    ...typography.h1,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: spacing.screenHorizontal,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: 24,
    marginBottom: 12,
  },
});
