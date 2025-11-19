import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function InitialLayout() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [navigated, setNavigated] = useState(false);

  useEffect(() => {
    if (status === 'loading' || navigated) return;
    const targetRoute = user ? '/(tabs)' : '/(pages)/login';
    router.replace(targetRoute);
    setNavigated(true);
  }, [user, status, router, navigated]);

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(pages)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );

  return stack;
}