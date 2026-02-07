import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('MainTabs');
    }, 1500);
  };

  const isFormValid = email && displayName && password && agreeTerms;

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Title */}
          <Animated.Text
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.title}
          >
            Create Account
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.subtitle}
          >
            Join the PAIRLIVE community
          </Animated.Text>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
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
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              leftIcon="person-outline"
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
            <Animated.Text style={styles.passwordHint}>
              Password must be at least 8 characters
            </Animated.Text>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  agreeTerms && styles.checkboxChecked,
                ]}
              >
                {agreeTerms && (
                  <Icon name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Animated.Text style={styles.termsText}>
                I agree to the{' '}
                <Animated.Text style={styles.termsLink}>
                  Terms of Service
                </Animated.Text>
                {' '}and{' '}
                <Animated.Text style={styles.termsLink}>
                  Privacy Policy
                </Animated.Text>
              </Animated.Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Register Button */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <AnimatedButton
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={!isFormValid}
            />
          </Animated.View>

          {/* Login Link */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(600)}
            style={styles.loginContainer}
          >
            <Animated.Text style={styles.loginText}>
              Already have an account?{' '}
            </Animated.Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Animated.Text style={styles.loginLink}>Login</Animated.Text>
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
  title: {
    ...typography.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
    gap: 16,
  },
  passwordHint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: -8,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
