import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import {
  Home,
  Calendar,
  Apple,
  Dumbbell,
  User,
  Settings,
  X,
  BookOpen,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import AppText from './AppText';
import BgPattern from './BgPattern';
import { darkenColor } from '@/src/utils';

interface DrawerItem {
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  route?: string;
  onPress?: () => void;
  divider?: boolean;
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { theme, accentColor } = useTheme();
  const router = useRouter();
  const [headerLayout, setHeaderLayout] = useState({ width: 0, height: 0 });

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setHeaderLayout({ width, height });
  };

  const handleNavigation = (route?: string) => {
    if (route) {
      router.push(route as any);
      props.navigation.closeDrawer();
    }
  };

  const handleLogout = () => {
    // Handle logout logic here
    props.navigation.closeDrawer();
    // Add your logout logic
  };

  const drawerItems: DrawerItem[] = [
    // { label: 'Home', icon: Home, route: '/(tabs)' },
    // { label: 'Calendar', icon: Calendar, route: '/(tabs)/calendar' },
    // { label: 'Food', icon: Apple, route: '/(tabs)/food' },
    // { label: 'Exercise', icon: Dumbbell, route: '/(tabs)/exercise' },
    // { label: 'Profile', icon: User, route: '/(tabs)/profile' },
    // { divider: true },
    { label: 'Tips', icon: BookOpen, route: '/(tabs)/profile' },
    { label: 'Help & Support', icon: HelpCircle, route: undefined },
    { label: 'Settings', icon: Settings, route: '/(pages)/settings' },
    { divider: true },
    // { label: 'Logout', icon: LogOut, onPress: handleLogout },
  ];

  const dynamicStyles = createStyles(theme, accentColor);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={dynamicStyles.drawerContent}
      style={dynamicStyles.drawer}
    >
      {/* Drawer Header */}
      <View
        style={dynamicStyles.drawerHeader}
        onLayout={onHeaderLayout}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <BgPattern
            width={headerLayout.width}
            height={headerLayout.height}
            patternId="drawer-header-pattern"
          />
        </View>
        <View style={dynamicStyles.headerContent}>
          <AppText variant="bold" style={dynamicStyles.drawerTitle}>
            Menu
          </AppText>
          <TouchableOpacity
            onPress={() => props.navigation.closeDrawer()}
            style={dynamicStyles.closeButton}
            activeOpacity={0.7}
          >
            <X size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer Items */}
      <View style={dynamicStyles.drawerItems}>
        {drawerItems.map((item, index) => {
          if (item.divider) {
            return (
              <View
                key={`divider-${index}`}
                style={dynamicStyles.divider}
              />
            );
          }

          const Icon = item.icon;
          const currentRoute = props.state.routes[props.state.index]?.name;
          const itemRouteName = item.route?.split('/').pop()?.replace('(tabs)', '').replace('/', '');
          const isActive = currentRoute === itemRouteName || 
            (itemRouteName === 'index' && currentRoute === 'index');

          return (
            <TouchableOpacity
              key={item.label}
              style={[
                dynamicStyles.drawerItem,
                isActive && dynamicStyles.drawerItemActive,
              ]}
              onPress={() => {
                if (item.onPress) {
                  item.onPress();
                } else {
                  handleNavigation(item.route);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={dynamicStyles.drawerItemContent}>
                <View
                  style={[
                    dynamicStyles.iconContainer,
                    { backgroundColor: `${accentColor}15` },
                    isActive && { backgroundColor: `${accentColor}25` },
                  ]}
                >
                  <Icon size={22} color={isActive ? accentColor : theme.textPrimary} />
                </View>
                <Text
                  style={[
                    dynamicStyles.drawerItemText,
                    isActive && { color: accentColor, fontWeight: '700' },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

const createStyles = (theme: any, accentColor: string) =>
  StyleSheet.create({
    drawer: {
      flex: 1,

      backgroundColor: theme.cardBackground,
    },
    drawerContent: {
      flex: 1,
     
    },
    drawerHeader: {
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 20,
      // borderBottomWidth: 1,
      // borderBottomColor: theme.border,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    drawerTitle: {
      fontSize: 28,
      fontFamily: 'Bold',
      color: darkenColor(theme.textPrimary, 5),
      // fontWeight: '700',
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: (theme.mode as string) === 'dark' ? '#2a2a2a' : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    drawerItems: {
      flex: 1,
      paddingTop: 8,
    },
    drawerItem: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    drawerItemActive: {
      backgroundColor: `${accentColor}10`,
    },
    drawerItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    drawerItemText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 8,
      marginHorizontal: 20,
    },
  });

