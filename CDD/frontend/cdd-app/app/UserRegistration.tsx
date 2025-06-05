import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import LocationDropdowns from '../components/LocationDropdowns';

const UserRegistration = ({ onComplete }) => {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', contact: '', email: '' });
  const [imageUri, setImageUri] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const checkExistingUser = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) onComplete();
    };
    checkExistingUser();
  }, []);

  const handleInputChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

    const signUpUser = async () => {
  try {
    if (!location) {
      Alert.alert('Location Missing', 'Please complete the location fields.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.contact,
      options: {
        data: {
          name: form.name,
          contact: form.contact,
          region: location.region,
          province: location.province,
          municipality: location.municipality,
          barangay: location.barangay,
        },
        emailRedirectTo: 'cddapp://verified',
      },
    });

    if (error || !data.user) {
      console.error('Supabase sign-up error:', error?.message || 'Missing user');
      Alert.alert('Registration Error', error?.message || 'Missing user info');
      return;
    }

    const userInfo = {
      id: data.user.id, // ✅ include ID
      ...form,
      ...location,
    };

    await AsyncStorage.setItem('user_info', JSON.stringify(userInfo)); // ✅ consistent key
    console.log("Saved user info:", userInfo);

    if (!data.session?.user?.email_confirmed_at) {
      router.replace('/verify-email');
    } else {
      onComplete();
    }
  } catch (err) {
    console.error('Unexpected registration error:', err);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>User Registration</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <Text style={styles.imageText}>Pick Profile Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={form.name}
        onChangeText={(val) => handleInputChange('name', val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="phone-pad"
        value={form.contact}
        onChangeText={(val) => handleInputChange('contact', val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(val) => handleInputChange('email', val)}
      />

      <LocationDropdowns
        onLocationChange={(loc) => {
          if (loc) setLocation(loc);
        }}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={signUpUser}
        disabled={!form.name || !form.contact || !form.email || !location}
      >
        <Text style={styles.submitText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: 20,
    marginBottom: 100,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
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
  label: {
    color: '#ccc',
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
  },
  picker: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageText: {
    color: '#888',
    fontSize: 14,
    padding: 10,
    borderRadius: 8,
    borderColor: '#444',
    borderWidth: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  footer: {
    padding: 20,
    borderTopColor: '#333',
    borderTopWidth: 1,
  },
  submitButton: {
    backgroundColor: '#00c853',
    padding: 15,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default UserRegistration;
