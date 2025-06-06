import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { supabase } from '@/lib/supabase';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const restoreSession = async () => {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.log('Error restoring session:', error.message);
        } else if (!session) {
          console.log('No session found');
        } else {
          console.log('Session restored:', session.user.email);
        }

        setIsReady(true); // continue rendering app
      };

      restoreSession();
    }, []);

  if (!isReady) {
    return null; // or splash screen
  }

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
