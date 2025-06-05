import { Slot } from 'expo-router';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import linking from '../linking'; // Adjust path if needed

export default function Layout() {
  useEffect(() => {
    const handleDeepLink = (event) => {
      console.log('Deep link received:', event.url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return <Slot />;
}
