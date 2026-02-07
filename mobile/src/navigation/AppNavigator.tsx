import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors } from '@theme/colors';
import { CustomTabBar } from '@components/navigation/CustomTabBar';

// Auth Screens
import { SplashScreen } from '@screens/auth/SplashScreen';
import { WelcomeScreen } from '@screens/auth/WelcomeScreen';
import { LoginScreen } from '@screens/auth/LoginScreen';
import { RegisterScreen } from '@screens/auth/RegisterScreen';

// Main Screens
import { HomeScreen } from '@screens/main/HomeScreen';
import { FriendsScreen } from '@screens/main/FriendsScreen';
import { ProfileScreen } from '@screens/main/ProfileScreen';

// Session Screens
import { MatchingScreen } from '@screens/session/MatchingScreen';
import { LiveSessionScreen } from '@screens/session/LiveSessionScreen';
import { FeedbackScreen } from '@screens/session/FeedbackScreen';

// Types
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Matching: undefined;
  LiveSession: { sessionId: string; partnerId: string };
  Feedback: { sessionId: string; partnerName: string };
};

export type MainTabParamList = {
  Home: undefined;
  Friends: undefined;
  GoLive: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen 
        name="GoLive" 
        component={HomeScreen} // Placeholder, handled by CustomTabBar
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            // Navigation to matching is handled in CustomTabBar
          },
        }}
      />
      <Tab.Screen name="Chat" component={FriendsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// App Navigator
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ animation: 'slide_from_right' }}
        />

        {/* Main App */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator}
          options={{ animation: 'fade' }}
        />

        {/* Session Flow */}
        <Stack.Screen 
          name="Matching" 
          component={MatchingScreen}
          options={{ 
            animation: 'fade_from_bottom',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen 
          name="LiveSession" 
          component={LiveSessionScreen}
          options={{ 
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Feedback" 
          component={FeedbackScreen}
          options={{ 
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
