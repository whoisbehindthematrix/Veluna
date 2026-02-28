import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native'; // <-- Import View and StyleSheet
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider } from '../src/context/AppContext';
import { ReduxProvider } from '@/contexts/ReduxProvider';
import { ThemeProvider, useTheme } from '@/src/context/ThemeContext';
import { useFonts } from 'expo-font';
import SplashScreenAnimation from '@/components/core-components/SplashScreen';
import InitialLayout from './InitialLayout';

if (__DEV__) {
  require('../reactotronConfig');
}

// Prevent the native splash screen from auto-hiding until we are ready
import * as SplashScreen from 'expo-splash-screen';
function RootLayoutInner() {
  useFrameworkReady();
  const [fontsLoaded] = useFonts({
    Bold: require('../assets/fonts/Sentient-Bold.otf'),
    Modak: require('../assets/fonts/Modak-Regular.ttf'),
  });

  // CRITICAL: Call useTheme() BEFORE any conditional returns to maintain hook order
  const { themeName } = useTheme();
  const statusBarStyle = themeName === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => { });
  }, []);
  useEffect(() => {
    // console.log('Fonts loaded:', fontsLoaded);
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.root}>
        <SplashScreenAnimation />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ReduxProvider>
        <AppProvider>
          <InitialLayout />
          <StatusBar style={statusBarStyle} backgroundColor="#FFF0F8" />
        </AppProvider>
      </ReduxProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}

// CRITICAL FIX: Define the root view style with the correct background color.
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF0F8',
  },
});