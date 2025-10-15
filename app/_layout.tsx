import { useEffect, useState } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CycleProvider } from '@/contexts/CycleContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { useFonts } from 'expo-font';
import SplashScreenAnimation from '@/components/core-components/SplashScreen';

export default function RootLayout() {

  useFrameworkReady();


  const [fontsLoaded] = useFonts({
    Bold: require('../assets/fonts/Sentient-Bold.otf'),

  });

  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if (fontsLoaded && !splashHidden) {
      SplashScreen.hideAsync().then(() => setSplashHidden(true));
      //  registerForPushNotificationsAsync();
    }
  }, [fontsLoaded, splashHidden]);

  if (!fontsLoaded) {
    return <SplashScreenAnimation />; // render-safe early return
  }





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