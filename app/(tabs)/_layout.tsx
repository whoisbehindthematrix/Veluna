import React from 'react';
import { View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Flower as Home, Calendar, BookOpen, User, Apple, Dumbbell } from 'lucide-react-native';
import { useTheme } from '@/src/context/ThemeContext';
import CustomDrawerContent from '@/components/core-components/CustomDrawerContent';
import CustomTabBar from '@/components/core-components/CustomTabBar';

export default function DrawerLayout() {
  const { theme, accentColor } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.cardBackground,
            width: '80%',

          },
          drawerActiveTintColor: accentColor,
          drawerInactiveTintColor: theme.textSecondary,
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
          },
          drawerType: 'slide',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            drawerIcon: ({ size, color }) => (
              <Calendar size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="food"
          options={{
            title: 'Food',
            drawerIcon: ({ size, color }) => (
              <Apple size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="exercise"
          options={{
            title: 'Exercise',
            drawerIcon: ({ size, color }) => (
              <Dumbbell size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: 'Profile',
            drawerIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Drawer>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
        <CustomTabBar />
      </View>
    </View>
  );
}