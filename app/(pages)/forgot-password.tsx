import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppText from '@/components/core-components/AppText';
import { useTheme } from '@/src/context/ThemeContext';
import api from '@/lib/api';

const ForgotPasswordScreen = () => {
  const { theme, accentColor } = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const router = useRouter();
  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email';
    }
    return '';
  };

  const handleSubmit = async () => {
    const emailErr = validateEmail(email);
    setEmailError(emailErr);

    if (emailErr) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Please check your email for password reset instructions.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Forgot password error:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={[dynamicStyles.container, { backgroundColor: theme.background }]}>
        <View style={dynamicStyles.content}>
          <View style={dynamicStyles.successContainer}>
            <View style={dynamicStyles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={theme.success} />
            </View>
            <AppText style={[dynamicStyles.successTitle, { color: theme.textPrimary }]}>Email Sent!</AppText>
            <AppText style={[dynamicStyles.successText, { color: theme.textSecondary }]}>
              We've sent password reset instructions to{'\n'}
              <AppText style={[dynamicStyles.emailText, { color: theme.textPrimary }]}>{email}</AppText>
            </AppText>
            <TouchableOpacity
              style={[dynamicStyles.backButton, { backgroundColor: accentColor, shadowColor: accentColor }]}
              onPress={() => router.back()}
            >
              <AppText style={dynamicStyles.backButtonText}>Back to Login</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[dynamicStyles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={dynamicStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={dynamicStyles.content}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <TouchableOpacity 
              style={dynamicStyles.backButtonHeader}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={accentColor} />
            </TouchableOpacity>
            <View style={dynamicStyles.logoContainer}>
              <View style={[dynamicStyles.logo, { backgroundColor: `${accentColor}20`, shadowColor: accentColor }]}>
                <Ionicons name="lock-closed" size={40} color={accentColor} />
              </View>
            </View>
            <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>Forgot Password?</AppText>
            <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>
              Enter your email address and we'll send you instructions to reset your password
            </AppText>
          </View>

          {/* Form */}
          <View style={dynamicStyles.form}>
            {/* Email Input */}
            <View style={dynamicStyles.inputContainer}>
              <AppText style={[dynamicStyles.label, { color: theme.textSecondary }]}>Email</AppText>
              <View
                style={[
                  dynamicStyles.inputWrapper,
                  { 
                    backgroundColor: theme.cardBackground,
                    borderColor: emailError ? accentColor : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={accentColor}
                  style={dynamicStyles.inputIcon}
                />
                <TextInput
                  style={[dynamicStyles.input, { color: theme.textPrimary }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textSecondary}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  value={email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              {emailError ? (
                <AppText style={[dynamicStyles.fieldError, { color: accentColor }]}>{emailError}</AppText>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                dynamicStyles.submitButton,
                { backgroundColor: accentColor, shadowColor: accentColor },
                loading && dynamicStyles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <AppText style={dynamicStyles.submitButtonText}>Send Reset Link</AppText>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={dynamicStyles.loginLink}
              onPress={() => router.push('/(pages)/login')}
            >
              <Ionicons name="arrow-back" size={16} color={accentColor} />
              <AppText style={[dynamicStyles.loginLinkText, { color: accentColor }]}>Back to Login</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============================================================================
// DYNAMIC STYLES (Theme-aware)
// ============================================================================

const createStyles = (theme: any, accentColor: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButtonHeader: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: 'Bold',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  fieldError: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  submitButton: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Bold',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '700',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ForgotPasswordScreen;

