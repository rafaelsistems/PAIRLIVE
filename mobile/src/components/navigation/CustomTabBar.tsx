import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '@theme/colors';
import { RootStackParamList } from '@navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 70;
const GO_LIVE_BUTTON_SIZE = 64;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const tabIcons: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Friends: { active: 'people', inactive: 'people-outline' },
  GoLive: { active: 'radio', inactive: 'radio-outline' },
  Chat: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

// Animated Tab Item
const TabItem: React.FC<{
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
}> = ({ routeName, isFocused, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      isFocused ? 1 : 0,
      [0, 1],
      [colors.textTertiary, colors.primary]
    ),
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        <Icon
          name={isFocused ? tabIcons[routeName].active : tabIcons[routeName].inactive}
          size={24}
          color={isFocused ? colors.primary : colors.textTertiary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// GO LIVE Button with Pulse Animation
const GoLiveButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    // Pulse animation
    const pulse = () => {
      scale.value = withTiming(1.05, { duration: 1000 }, () => {
        scale.value = withTiming(1, { duration: 1000 });
      });
      glowOpacity.value = withTiming(0.6, { duration: 1000 }, () => {
        glowOpacity.value = withTiming(0.3, { duration: 1000 });
      });
    };
    
    pulse();
    const interval = setInterval(pulse, 2000);
    return () => clearInterval(interval);
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.goLiveContainer}>
        {/* Glow Effect */}
        <Animated.View style={[styles.goLiveGlow, glowStyle]} />
        
        {/* Button */}
        <Animated.View style={buttonStyle}>
          <LinearGradient
            colors={colors.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goLiveButton}
          >
            <View style={styles.goLiveDot} />
          </LinearGradient>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

// Main Custom Tab Bar
export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<NavigationProp>();

  const handleGoLive = () => {
    rootNavigation.navigate('Matching');
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
      ]}
    >
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // GO LIVE button in center
          if (route.name === 'GoLive') {
            return (
              <View key={route.key} style={styles.goLiveWrapper}>
                <GoLiveButton onPress={handleGoLive} />
              </View>
            );
          }

          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  goLiveWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  goLiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  goLiveGlow: {
    position: 'absolute',
    width: GO_LIVE_BUTTON_SIZE + 30,
    height: GO_LIVE_BUTTON_SIZE + 30,
    borderRadius: (GO_LIVE_BUTTON_SIZE + 30) / 2,
    backgroundColor: colors.primary,
  },
  goLiveButton: {
    width: GO_LIVE_BUTTON_SIZE,
    height: GO_LIVE_BUTTON_SIZE,
    borderRadius: GO_LIVE_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  goLiveDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
});
