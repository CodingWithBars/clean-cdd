import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      Alert.alert('Login Failed', error.message);
      return;
    }

    const { user } = data;
    if (!user?.email_confirmed_at) {
      setLoading(false);
      router.replace('/verify-email');
    } else {
      setLoading(false);
      router.replace('/user/setup-profile');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>
        Log In
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        style={{
          backgroundColor: '#1a1a1a',
          color: '#fff',
          padding: 12,
          borderRadius: 10,
          marginBottom: 16,
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        style={{
          backgroundColor: '#1a1a1a',
          color: '#fff',
          padding: 12,
          borderRadius: 10,
          marginBottom: 16,
        }}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: '#00c853',
          padding: 14,
          borderRadius: 10,
          alignItems: 'center',
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/user/register')} style={{ marginTop: 20 }}>
        <Text style={{ color: '#aaa', textAlign: 'center' }}>
          Don’t have an account? <Text style={{ color: '#00c853' }}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
