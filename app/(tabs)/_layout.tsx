import { Tabs } from 'expo-router';
import { Flower as Home, Calendar, BookOpen, User, Apple, Dumbbell } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1e6f1',
          paddingBottom: 8,
          paddingTop: 8,
          height: 100,
          paddingHorizontal: 2,
        },
        tabBarActiveTintColor: '#ec4899',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color === '#ec4899' ? '#ec4899' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ size, color }) => (
            <Apple size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          title: 'Exercise',
          tabBarIcon: ({ size, color }) => (
            <Dumbbell size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="tips"
        options={{
          title: 'Tips',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}