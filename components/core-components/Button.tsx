import React, { ReactNode } from 'react';
import { TouchableOpacity, TouchableOpacityProps, View, Text, StyleSheet } from 'react-native';
import AppText from './AppText';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'purple' | 'white' | 'rose';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const colorVariants = {
  primary: {
    backgroundColor: '#2dd4bf', // teal-400
    borderColor: '#14b8a6', // teal-500
    textColor: '#ccfbf1', // teal-100
  },
  secondary: {
    backgroundColor: '#9333ea', // purple-600
    borderColor: '#a855f7', // purple-500
    textColor: '#f3e8ff', // purple-100
  },
  danger: {
    backgroundColor: '#ef4444', // red-500
    borderColor: '#dc2626', // red-600
    textColor: '#fee2e2', // red-100
  },
  success: {
    backgroundColor: '#22c55e', // green-500
    borderColor: '#16a34a', // green-600
    textColor: '#dcfce7', // green-100
  },
  purple: {
    backgroundColor: '#a855f7', // purple-500
    borderColor: '#9333ea', // purple-600
    textColor: '#f3e8ff', // purple-100
  },
  white: {
    backgroundColor: '#ffffff', // white
    borderColor: '#e5e7eb', // gray-200
    textColor: '#000000', // black
  },
  rose: {
    backgroundColor: '#f43f5e', // rose-500
    borderColor: '#e11d48', // rose-600
    textColor: '#ffe4e6', // rose-100
  },
};

const sizeVariants = {
  xs: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 16,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    fontSize: 18,
  },
};

export default function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  style,
  ...props
}: AppButtonProps) {
  const colorStyle = colorVariants[variant];
  const sizeStyle = sizeVariants[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colorStyle.backgroundColor,
          borderColor: colorStyle.borderColor,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <View style={styles.iconContainer}>{icon}</View>
      )}

      <AppText 
        variant="feather" 
        style={[
          styles.text,
          { 
            color: colorStyle.textColor,
            fontSize: sizeStyle.fontSize 
          }
        ]}
      >
        {title}
      </AppText>

      {icon && iconPosition === 'right' && (
        <View style={styles.iconContainer}>{icon}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 2,
    margin: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
    textAlign: 'center',
  },
  iconContainer: {
    marginHorizontal: 4,
  },
});
