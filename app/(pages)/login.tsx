import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { signInWithEmail, clearAuthError, syncUser } from '@/src/store/slices/authSlice';
import AppText from '@/components/core-components/AppText';
import { AppDispatch, RootState } from '@/src/store';
import { Ionicons } from '@expo/vector-icons';
import Logo from '@/assets/images/logo';
import { useTheme } from '@/src/context/ThemeContext';

const LoginScreen = () => {
  const { theme, accentColor } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { status, error, user } = useSelector((state: RootState) => state.auth);

  const dynamicStyles = useMemo(() => createStyles(theme, accentColor), [theme, accentColor]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && user?.id) {
      dispatch(clearAuthError());
      router.replace('/(tabs)/home'); // your redirect
    }
  }, [status, user?.id]);

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting || status === 'loading') {
      return;
    }

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) return;

    try {
      setIsSubmitting(true);

      await dispatch(signInWithEmail({ email, password })).unwrap();
      await dispatch(syncUser()).unwrap();

    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <View style={dynamicStyles.header}>
            <View style={dynamicStyles.logoContainer}>
            {/* <Logo color={accentColor} width={250} height={80} /> */}
            </View>
            <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>Welcome,</AppText>
            <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>Sign in to continue</AppText>
          </View>

          {error && (
            <View style={[dynamicStyles.errorContainer, { 
              backgroundColor: `${accentColor}20`,
              borderColor: `${accentColor}40`,
            }]}>
              <Ionicons name="alert-circle" size={20} color={accentColor} />
              <AppText style={[dynamicStyles.errorText, { color: accentColor }]}>{error}</AppText>
            </View>
          )}

          <View style={dynamicStyles.form}>
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
                  editable={!isSubmitting}
                />
              </View>
              {emailError ? (
                <AppText style={[dynamicStyles.fieldError, { color: accentColor }]}>{emailError}</AppText>
              ) : null}
            </View>

            <View style={dynamicStyles.inputContainer}>
              <AppText style={[dynamicStyles.label, { color: theme.textSecondary }]}>Password</AppText>
              <View
                style={[
                  dynamicStyles.inputWrapper,
                  { 
                    backgroundColor: theme.cardBackground,
                    borderColor: passwordError ? accentColor : theme.border,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={accentColor}
                  style={dynamicStyles.inputIcon}
                />
                <TextInput
                  style={[dynamicStyles.input, { color: theme.textPrimary }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  value={password}
                  secureTextEntry={!showPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={dynamicStyles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={accentColor}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <AppText style={[dynamicStyles.fieldError, { color: accentColor }]}>{passwordError}</AppText>
              ) : null}
            </View>

            <TouchableOpacity
              style={dynamicStyles.forgotPassword}
              onPress={() => router.push('/(pages)/forgot-password')}
            >
              <AppText style={[dynamicStyles.forgotPasswordText, { color: accentColor }]}>
                Forgot Password?
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                dynamicStyles.submitButton,
                { backgroundColor: accentColor },
                isSubmitting && dynamicStyles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText style={dynamicStyles.submitButtonText}>Sign In</AppText>
              )}
            </TouchableOpacity>

            <View style={dynamicStyles.divider}>
              <View style={[dynamicStyles.dividerLine, { backgroundColor: theme.border }]} />
              <AppText style={[dynamicStyles.dividerText, { color: theme.textSecondary }]}>OR</AppText>
              <View style={[dynamicStyles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
              style={[dynamicStyles.socialButton, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              }]}
              activeOpacity={0.8}
              onPress={() => { }}
              disabled={status === 'loading'}
            >
              <Ionicons name="logo-google" size={20} color={accentColor} />
              <AppText style={[dynamicStyles.socialButtonText, { color: accentColor }]}>
                Continue with Google
              </AppText>
            </TouchableOpacity>

            <View style={dynamicStyles.toggleContainer}>
              <AppText style={[dynamicStyles.toggleText, { color: theme.textSecondary }]}>
                Don't have an account?{' '}
              </AppText>
              <TouchableOpacity onPress={() => router.push('/(pages)/signup')}>
                <AppText style={[dynamicStyles.toggleLink, { color: accentColor }]}>Sign Up</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Full-screen loading overlay */}
      {isSubmitting && (
        <View style={[dynamicStyles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      )}
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
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    marginBottom: 2,
    fontFamily: 'Bold',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
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
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 24,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
  },
  toggleLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default LoginScreen;
