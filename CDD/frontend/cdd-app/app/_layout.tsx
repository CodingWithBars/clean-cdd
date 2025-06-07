import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import AuthFlowScreen from '../app/screens/AuthFlowScreen'; // Confirm this path is correct

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authComplete, setAuthComplete] = useState(false);

  // ✅ Check session on app load
  useEffect(() => {
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setCheckingSession(false);
      if (data.session) setAuthComplete(true); // Set authComplete if session is valid
    };

    initSession();

    // ✅ Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) setAuthComplete(true);
      else setAuthComplete(false);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (!loaded || checkingSession) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {session && authComplete ? (
        <Slot /> // 🟢 App content (user is signed in)
      ) : (
        <AuthFlowScreen
          onComplete={async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              setSession(data.session);
              setAuthComplete(true); // 🟢 Complete auth
            }
          }}
        />
      )}
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}
