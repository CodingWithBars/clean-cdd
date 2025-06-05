import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error checking user:', error.message);
        return;
      }

      if (user?.email_confirmed_at) {
        clearInterval(interval);
        router.replace('/user/setup-profile');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleResendEmail = async () => {
    setResending(true);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email;

    if (!email) {
      Alert.alert('Error', 'Unable to find your email address.');
      setResending(false);
      return;
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    setResending(false);

    if (error) {
      Alert.alert('Resend Failed', error.message);
    } else {
      Alert.alert('Success', 'Verification email sent again. Please check your inbox.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#fff', fontSize: 20, marginBottom: 20, textAlign: 'center' }}>
        Please verify your email to continue.
      </Text>

      <ActivityIndicator size="large" color="#00c853" style={{ marginBottom: 20 }} />

      <TouchableOpacity
        onPress={handleResendEmail}
        style={{
          backgroundColor: '#1a1a1a',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 10,
        }}
        disabled={resending}
      >
        <Text style={{ color: resending ? '#666' : '#00c853', fontWeight: 'bold' }}>
          {resending ? 'Resending...' : 'Resend Verification Email'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
