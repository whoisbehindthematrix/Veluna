import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';

export default function InitialLayout() {
  const { user, status, onboardingCompleted, isInitialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const hasNavigated = useRef(false);
  const lastStateKey = useRef<string>('');

  useEffect(() => {
    // Wait for auth to be initialized (e.g. restoreSession). Do NOT wait for status !== 'loading'
    // so that when user taps Sign In, we keep showing the login screen and it can show its own loading modal.
    if (!isInitialized) {
      return;
    }

    // ✅ Create a unique state key to detect significant changes
    const stateKey = `${user?.id || 'no-user'}-${onboardingCompleted}-${status}`;

    // ✅ Reset navigation flag when auth state changes significantly
    if (lastStateKey.current !== stateKey) {
      hasNavigated.current = false;
      lastStateKey.current = stateKey;
    }

    // ✅ Check current route
    const currentPath = pathname || segments.join('/');
    const isOnLogin = currentPath.includes('login');
    const isOnSignup = currentPath.includes('signup');
    const isOnForgotPassword = currentPath.includes('forgot-password');
    const isOnOnboarding = currentPath.includes('onboarding-basic') || currentPath.includes('onboarding-questions');
    const isOnTabs = currentPath.includes('tabs') || currentPath === '/' || currentPath === '';

    // Determine the correct route based on auth state
    let targetRoute: string;
    let shouldNavigate = false;

    if (!user) {
      // Not authenticated - go to login (but don't redirect if on signup/forgot-password)
      targetRoute = '/(pages)/login';
      shouldNavigate = !isOnLogin && !isOnSignup && !isOnForgotPassword;
    } else if (!onboardingCompleted) {
      // Authenticated but onboarding not completed - start with basic onboarding
      targetRoute = '/(pages)/onboarding-basic';
      shouldNavigate = !isOnOnboarding;
    } else {
      // Authenticated and onboarded - go to main app
      targetRoute = '/(tabs)';
      shouldNavigate = !isOnTabs;
    }

    // ✅ Navigate if needed
    if (shouldNavigate && !hasNavigated.current) {
      hasNavigated.current = true;
      console.log('🔄 [InitialLayout] Navigating to:', targetRoute, {
        user: !!user,
        userId: user?.id,
        onboardingCompleted,
        status,
        currentPath,
        stateKey,
      });
      
      // Use replace to prevent back navigation
      router.replace(targetRoute as any);
    }
    
    // Debug: Log state changes
    if (__DEV__) {
      // console.log('👁️ [InitialLayout] Auth state:', {
      //   hasUser: !!user,
      //   userId: user?.id,
      //   onboardingCompleted,
      //   isInitialized,
      //   status,
      //   currentPath: pathname || segments.join('/'),
      // });
    }
  }, [user, status, onboardingCompleted, isInitialized, router, segments, pathname]);

  // Show loading only while auth is initializing (e.g. restoreSession). When user taps Sign In,
  // status becomes 'loading' but we must keep rendering the Stack so the login screen stays
  // mounted (and can show its own "Signing in..." modal). Otherwise the login screen unmounts
  // and input fields clear.
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('@/assets/images/icon.png')} style={{ width: 100, height: 100 }} />
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(pages)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(pages)/signup" options={{ headerShown: false }} />
      <Stack.Screen name="(pages)/forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="(pages)/onboarding-basic" options={{ headerShown: false }} />
      <Stack.Screen name="(pages)/onboarding-questions" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );

  return stack;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF0F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});