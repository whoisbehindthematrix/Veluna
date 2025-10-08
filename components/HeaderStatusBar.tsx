import React from 'react';
import { View, Platform, StyleSheet, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

export default function HeaderStatusBar() {
  const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight || 24;

  return (
    <>
      {/* Background Blur or Fallback */}
      {Platform.OS === 'android' ? (
        <BlurView intensity={16} tint="light"  blurReductionFactor={5} experimentalBlurMethod='dimezisBlurView' style={[styles.blur, { height: STATUS_BAR_HEIGHT }]} />
      ) : (
        <View style={[styles.androidBar, { height: STATUS_BAR_HEIGHT }]} />
      )}

      {/* Status Bar Icons */}
      <StatusBar style="dark" translucent backgroundColor="transparent" />
    </>
  );
}

const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  androidBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.7)', // fake blur look
    zIndex: 999,
  },
});
