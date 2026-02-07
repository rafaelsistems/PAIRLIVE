import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { spacing, borderRadius } from '@theme/spacing';
import { RootStackParamList } from '@navigation/AppNavigator';
import { AnimatedButton } from '@components/ui/AnimatedButton';
import { AnimatedInput } from '@components/ui/AnimatedInput';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('MainTabs');
    }, 1500);
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Animated.View entering={FadeInUp.delay(100).duration(500)}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Logo */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.logoContainer}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.logoInner}>
                <View style={styles.logoDot} />
                <View style={styles.logoDot} />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.title}
          >
            Welcome Back
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.subtitle}
          >
            Sign in to continue
          </Animated.Text>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(600)}
            style={styles.form}
          >
            <AnimatedInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <AnimatedInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Animated.Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Animated.Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Login Button */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <AnimatedButton
              title="Login"
              onPress={handleLogin}
              isLoading={isLoading}
              disabled={!email || !password}
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(700).duration(600)}
            style={styles.divider}
          >
            <View style={styles.dividerLine} />
            <Animated.Text style={styles.dividerText}>or</Animated.Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social Login */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(600)}
            style={styles.socialButtons}
          >
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="logo-apple" size={24} color={colors.textPrimary} />
              <Animated.Text style={styles.socialButtonText}>
                Continue with Apple
              </Animated.Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Icon name="logo-google" size={24} color={colors.textPrimary} />
              <Animated.Text style={styles.socialButtonText}>
                Continue with Google
              </Animated.Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Register Link */}
          <Animated.View
            entering={FadeInDown.delay(900).duration(600)}
            style={styles.registerContainer}
          >
            <Animated.Text style={styles.registerText}>
              Don't have an account?{' '}
            </Animated.Text>
            <TouchableOpacity onPress={handleRegister}>
              <Animated.Text style={styles.registerLink}>Sign Up</Animated.Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    flexDirection: 'row',
    gap: 8,
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
    gap: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginHorizontal: 16,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  socialButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  registerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
