import React, { ReactNode } from 'react';
import { Text, TextStyle, TextProps, StyleSheet } from 'react-native';

export type FontVariant = 'normal' | 'bold' | 'semibold' | 'light' | 'feather' ;

interface AppTextProps extends TextProps {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: FontVariant;
  glow?: boolean;
  glowColor?: string;
}

const FONT_MAP: Record<FontVariant, string | undefined> = {
  normal: 'Normal',
  bold: 'Bold',
  semibold: 'Semibold',
  light: 'Light',
  feather: 'Feather',
//   'bold-small': 'Bold',
};

// Fallback font weights when custom fonts are not available
const FONT_WEIGHT_FALLBACK: Record<FontVariant, TextStyle['fontWeight']> = {
  normal: '400',
//   bold: '700',
  semibold: '600',
  light: '300',
  feather: '200',
};

export default function AppText({
  children,
  style,
  variant = 'normal',
  glow = false,
  glowColor = '#00FF5F',
  ...rest
}: AppTextProps) {
  // Get custom font family (optional)
  const fontFamily = FONT_MAP[variant];
  
  // Glow effect using text shadow
  const glowStyle: TextStyle = glow
    ? {
        textShadowColor: glowColor,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 5,
      }
    : {};

  // Base font style with optional fontFamily
  const fontStyle: TextStyle = {
    ...(fontFamily && { fontFamily }), // Only apply if font exists
    fontWeight: FONT_WEIGHT_FALLBACK[variant], // Fallback weight
  };

  return (
    <Text
      style={[styles.baseText, fontStyle, glowStyle, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  baseText: {
    color: '#000000',
  },
});
