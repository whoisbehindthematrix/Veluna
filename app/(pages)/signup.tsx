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
import { signUpWithEmail, clearAuthError, syncUser } from '@/src/store/slices/authSlice';
import AppText from '@/components/core-components/AppText';
import { AppDispatch, RootState } from '@/src/store';
import { Ionicons } from '@expo/vector-icons';
import Logo from '@/assets/images/logo';
import { useTheme } from '@/src/context/ThemeContext';
import NeuButton from '@/components/core-components/NeuButton';
import { darkenColor, addOpacityToHex } from '@/src/utils';

const SignupScreen = () => {
  const { theme, accentColor } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { status, error, user } = useSelector((state: RootState) => state.auth);

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

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return '';
  };

  const handleSubmit = async () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const nameErr = validateName(displayName);

    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setNameError(nameErr);

    if (emailErr || passwordErr || nameErr) {
      return;
    }

    try {
      await dispatch(signUpWithEmail({
        email,
        password,
        displayName: displayName.trim()
      })).unwrap();

      // ✅ Sync user data after successful signup to get onboarding status
      await dispatch(syncUser()).unwrap();
    } catch (error) {

      // Error is already handled by the thunk
      console.error('Signup error:', error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // ✅ Don't handle redirect here - let InitialLayout handle it
  useEffect(() => {
    if (status === 'succeeded' && user) {
      dispatch(clearAuthError());
      // InitialLayout will handle the redirect based on auth state
    }
  }, [status, user, dispatch]);

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
              style={dynamicStyles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={accentColor} />
            </TouchableOpacity>
            <View style={dynamicStyles.logoContainer}>
              {/* <Logo color={accentColor} width={200} height={80} /> */}
            </View>
            <AppText style={[dynamicStyles.title, { color: theme.textPrimary }]}>Create Account,</AppText>
            <AppText style={[dynamicStyles.subtitle, { color: theme.textSecondary }]}>Sign up to get started!</AppText>
          </View>

          {/* Error Message */}
          {error && (
            <View style={dynamicStyles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={accentColor} />
              <AppText style={[dynamicStyles.errorText, { color: accentColor }]}>{error}</AppText>
            </View>
          )}

          {/* Form */}
          <View style={dynamicStyles.form}>
            {/* Name Input */}
            <View style={dynamicStyles.inputContainer}>
              <AppText style={[dynamicStyles.label, { color: theme.textSecondary }]}>Full Name</AppText>
              <View
                style={[
                  dynamicStyles.inputWrapper,
                  nameError && { borderColor: accentColor },
                  { borderColor: nameError ? accentColor : theme.border, backgroundColor: theme.cardBackground },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={nameError ? accentColor : accentColor}
                  style={dynamicStyles.inputIcon}
                />
                <TextInput
                  style={[dynamicStyles.input, { color: theme.textPrimary }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.textSecondary}
                  onChangeText={(text) => {
                    setDisplayName(text);
                    setNameError('');
                  }}
                  value={displayName}
                  autoCapitalize="words"
                  editable={status !== 'loading'}
                />
              </View>
              {nameError ? (
                <AppText style={[dynamicStyles.fieldError, { color: accentColor }]}>{nameError}</AppText>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={dynamicStyles.inputContainer}>
              <AppText style={[dynamicStyles.label, { color: theme.textSecondary }]}>Email</AppText>
              <View
                style={[
                  dynamicStyles.inputWrapper,
                  emailError && { borderColor: accentColor },
                  { borderColor: emailError ? accentColor : theme.border, backgroundColor: theme.cardBackground },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailError ? accentColor : accentColor}
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
                  editable={status !== 'loading'}
                />
              </View>
              {emailError ? (
                <AppText style={[dynamicStyles.fieldError, { color: accentColor }]}>{emailError}</AppText>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={dynamicStyles.inputContainer}>
              <AppText style={[dynamicStyles.label, { color: theme.textSecondary }]}>Password</AppText>
              <View
                style={[
                  dynamicStyles.inputWrapper,
                  passwordError && { borderColor: accentColor },
                  { borderColor: passwordError ? accentColor : theme.border, backgroundColor: theme.cardBackground },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordError ? accentColor : accentColor}
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
                  editable={status !== 'loading'}
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

            {/* Submit Button */}
            <NeuButton
              title="Sign Up"
              onPress={handleSubmit}
              disabled={status === 'loading'}
              loading={status === 'loading'}
              textStyle={{
                fontFamily: 'Bold',
                color: '#ffffff',
                fontSize: 18,
                letterSpacing: 0.8
              }}
              backgroundColor={accentColor}
              shadowColor={darkenColor(accentColor, 10)}
              style={{ marginBottom: 24 }}
            />

            {/* Divider */}
            <View style={dynamicStyles.divider}>
              <View style={[dynamicStyles.dividerLine, { backgroundColor: theme.border }]} />
              <AppText style={[dynamicStyles.dividerText, { color: theme.textSecondary }]}>OR</AppText>
              <View style={[dynamicStyles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Social Login */}
            <View style={{ marginBottom: 24, borderWidth: 2, borderColor: theme.border, borderRadius: 14 }}>
              <NeuButton
                title="Continue with Google"
                onPress={() => { }}
                disabled={status === 'loading'}
                loading={status === 'loading'}
                leftIcon={<Ionicons name="logo-google" size={20} color={accentColor} />}
                textStyle={{
                  fontFamily: 'Bold',
                  color: accentColor,
                  fontSize: 16,
                  letterSpacing: 0.8
                }}
                backgroundColor={theme.cardBackground}
                shadowColor={addOpacityToHex(theme.border, 0.3)}
              />
            </View>

            {/* Login Link */}
            <View style={dynamicStyles.toggleContainer}>
              <AppText style={[dynamicStyles.toggleText, { color: theme.textSecondary }]}>
                Already have an account?{' '}
              </AppText>
              <TouchableOpacity onPress={() => router.push('/(pages)/login')}>
                <AppText style={[dynamicStyles.toggleLink, { color: accentColor }]}>Sign In</AppText>
              </TouchableOpacity>
            </View>
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
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 64,
  },
  title: {
    fontSize: 32,
    marginBottom: 2,
    fontFamily: 'Bold',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '500',
    fontFamily: 'Bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${accentColor}20`,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${accentColor}40`,
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
  eyeIcon: {
    padding: 4,
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
    fontWeight: '400',
  },
  toggleLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default SignupScreen;

