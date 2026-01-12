import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Flower as Home, Calendar, Apple, Dumbbell, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  name: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  route: string;
}

const tabs: TabItem[] = [
  { name: 'calendar', label: 'Calendar', icon: Calendar, route: '/(tabs)/calendar' },
  { name: 'food', label: 'Food', icon: Apple, route: '/(tabs)/food' },
  { name: 'index', label: 'Home', icon: Home, route: '/(tabs)' },
  { name: 'exercise', label: 'Exercise', icon: Dumbbell, route: '/(tabs)/exercise' },
  { name: 'profile', label: 'Profile', icon: User, route: '/(tabs)/profile' },
];

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, accentColor } = useTheme();
  const insets = useSafeAreaInsets();

  const getCurrentRoute = () => {
    const segments = pathname.split('/');
    return segments[segments.length - 1] || 'index';
  };

  const currentRoute = getCurrentRoute();

  const dynamicStyles = createStyles(theme, accentColor, insets.bottom);

  return (
    <View style={dynamicStyles.tabBar}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentRoute === tab.name || 
          (tab.name === 'index' && (currentRoute === '' || currentRoute === 'tabs'));

        return (
          <TouchableOpacity
            key={tab.name}
            style={dynamicStyles.tabItem}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <View style={[
              dynamicStyles.tabIconContainer,
              isActive && dynamicStyles.tabIconContainerActive,
            ]}>
              <Icon
                size={24}
                color={isActive ? accentColor : theme.textSecondary}
              />
            </View>
            <Text
              style={[
                dynamicStyles.tabLabel,
                isActive && dynamicStyles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: any, accentColor: string, bottomInset: number) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.cardBackground,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingBottom: Math.max(bottomInset, 8),
      paddingTop: 8,
      height: 70 + Math.max(bottomInset, 8),
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    tabIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    tabIconContainerActive: {
      backgroundColor: `${accentColor}15`,
      borderRadius: 20,
    },
    tabLabel: {
      fontSize: 13,
      fontFamily: 'Bold',
      // fontWeight: '600',
      color: theme.textSecondary,
      marginTop: 0,
    },
    tabLabelActive: {
      color: accentColor,
      fontFamily: 'Bold',
      // fontWeight: '700',
    },
  });

