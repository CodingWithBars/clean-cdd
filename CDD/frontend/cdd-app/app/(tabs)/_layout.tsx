import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#00BFFF',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#FFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="camera" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          title: 'Results',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="chart-bar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="history" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
