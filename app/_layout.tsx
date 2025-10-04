import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CycleProvider } from '@/contexts/CycleContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <CycleProvider>
      <WorkoutProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </WorkoutProvider>
    </CycleProvider>
  );
}