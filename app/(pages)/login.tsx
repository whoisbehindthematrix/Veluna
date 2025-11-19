import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithEmail, signUpWithEmail, clearAuthError } from '@/src/store/slices/authSlice';
import AppText from '@/components/core-components/AppText';
import { AppDispatch, RootState } from '@/src/store';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));

  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.auth);

  // useEffect(() => {
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 0,
  //     useNativeDriver: true,
  //   }).start();
  // }, []);

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

  const handleSubmit = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    if (isSignUp) {
      dispatch(signUpWithEmail({ email, password }));
    } else {
      dispatch(signInWithEmail({ email, password }));
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmailError('');
    setPasswordError('');
    dispatch(clearAuthError()); // ADD THIS LINE
  };

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Auto-clear error after success
  useEffect(() => {
    if (status === 'succeeded') {
      // Clear after 2 seconds
      const timer = setTimeout(() => {
        dispatch(clearAuthError());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, dispatch]);

  // const handleGoogleSignIn = async () => {
  //   try {
  //     await dispatch(signInWithGoogle()).unwrap();
  //   } catch (error) {
  //     console.error('Google sign-in error:', error);
  //   }
  // };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="sparkles" size={40} color="#FF1493" />
              </View>
            </View>
            <AppText style={styles.title}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </AppText>
            <AppText style={styles.subtitle}>
              {isSignUp
                ? 'Sign up to get started'
                : 'Sign in to continue'}
            </AppText>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF1493" />
              <AppText style={styles.errorText}>{error}</AppText>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <AppText style={styles.label}>Email</AppText>
              <View
                style={[
                  styles.inputWrapper,
                  emailError ? styles.inputError : {},
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailError ? '#FF1493' : '#FF69B4'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#FFB6D9"
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
                <AppText style={styles.fieldError}>{emailError}</AppText>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <AppText style={styles.label}>Password</AppText>
              <View
                style={[
                  styles.inputWrapper,
                  passwordError ? styles.inputError : {},
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordError ? '#FF1493' : '#FF69B4'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#FFB6D9"
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
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#FF69B4"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <AppText style={styles.fieldError}>{passwordError}</AppText>
              ) : null}
            </View>

            {/* Forgot Password */}
            {!isSignUp && (
              <TouchableOpacity style={styles.forgotPassword}>
                <AppText style={styles.forgotPasswordText}>
                  Forgot Password?
                </AppText>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                status === 'loading' && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={status === 'loading'}
              activeOpacity={0.8}
            >
              {status === 'loading' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <AppText style={styles.submitButtonText}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </AppText>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <AppText style={styles.dividerText}>OR</AppText>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={() => { }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <ActivityIndicator color="#FF1493" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#FF1493" />
                  <AppText style={styles.socialButtonText}>
                    Continue with Google
                  </AppText>
                </>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
              <AppText style={styles.toggleText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
              </AppText>
              <TouchableOpacity onPress={toggleMode}>
                <AppText style={styles.toggleLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F8',
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
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE4F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#C71585',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FF69B4',
    fontWeight: '400',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4F1',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFB6D9',
  },
  errorText: {
    color: '#FF1493',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#C71585',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFE4F1',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderColor: '#FF1493',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#C71585',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  fieldError: {
    color: '#FF1493',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#FF69B4',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF1493',
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF1493',
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
    backgroundColor: '#FFE4F1',
  },
  dividerText: {
    color: '#FFB6D9',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFE4F1',
    marginBottom: 24,
  },
  socialButtonText: {
    color: '#FF1493',
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
    color: '#FF69B4',
    fontSize: 15,
    fontWeight: '400',
  },
  toggleLink: {
    color: '#FF1493',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LoginScreen;
