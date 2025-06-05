import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      Alert.alert('Success', 'Check your email to verify your account.');
      router.replace('/user/login'); // Redirect to login
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>
        Create Account
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
        onPress={handleRegister}
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
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/user/login')} style={{ marginTop: 20 }}>
        <Text style={{ color: '#aaa', textAlign: 'center' }}>
          Already have an account? <Text style={{ color: '#00c853' }}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
