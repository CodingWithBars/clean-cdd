import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserRegistration = ({ onComplete }: { onComplete: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('userInfo');
      if (storedUser) {
        onComplete(); // Already registered
      } else {
        setLoading(false); // Show form
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async () => {
    if (!fullName || !location || !email || !contact) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    const userInfo = { fullName, location, email, contact };
    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    onComplete();
  };

  if (loading) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>User Registration</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#888"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Farm / Location Name"
          placeholderTextColor="#888"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={contact}
          onChangeText={setContact}
        />

        <Button title="Submit" onPress={handleSubmit} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderColor: '#444',
    borderWidth: 1,
  },
});

export default UserRegistration;
