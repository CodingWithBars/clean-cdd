import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button } from 'react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
  let timeoutId;

  const checkEmailVerified = async () => {
    const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          Alert.alert('Error', 'No session found. Please log in again.');
          return;
        }

        const { data: refreshedUser, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error.message);
          return;
        }

        if (refreshedUser.user.email_confirmed_at) {
          router.replace('/');
        } else {
          timeoutId = setTimeout(checkEmailVerified, 5000);
        }
      };

      checkEmailVerified();

      return () => {
        if (timeoutId) clearTimeout(timeoutId); // cleanup
      };
    }, []);


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 18, marginBottom: 20 }}>
        Please verify your email...
      </Text>
      <ActivityIndicator size="large" color="#00c853" />
      
      <Button
        title="Resend Verification Email"
        onPress={async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            const { error } = await supabase.auth.resend({
              type: 'signup',
              email: session.user.email,
            });
            if (error) {
              Alert.alert('Error', 'Failed to resend email');
            } else {
              Alert.alert('Success', 'Verification email sent again.');
            }
          }
        }}
      />
    </View>
  );
}
