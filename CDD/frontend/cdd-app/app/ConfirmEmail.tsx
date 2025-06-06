import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';

const ConfirmEmail = () => {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams();

  // Cast to string in case it's an array
  const initialEmail = Array.isArray(emailParam) ? emailParam[0] : emailParam;

  const [email, setEmail] = useState(initialEmail || '');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email || !token) {
      Alert.alert('Missing Fields', 'Please enter both email and the 6-digit code.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error.message);
    } else {
      Alert.alert('Email Verified!', 'You can now log in.');
      router.replace('/UserLogin');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="6-digit Code"
        keyboardType="number-pad"
        value={token}
        onChangeText={setToken}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2f80ed',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmEmail;
