import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const RegisterUser = ({ onProfileSaved, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need your location to auto-fill your area.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync(location.coords);

      if (place) {
        setMunicipality(place.city || place.subregion || '');
        setBarangay(place.name || '');
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      }
    } catch (error) {
      console.error('Location fetch error:', error);
      Alert.alert('Location Error', 'Unable to retrieve your location.');
    } finally {
      setLocationLoading(false);
    }
  };

  // In RegisterUser.js
const handleSubmit = async () => {
  if (!email || !password || !confirmPassword) {
    Alert.alert('Missing Info', 'Please enter email and password.');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Weak Password', 'Password must be at least 6 characters.');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Password Mismatch', 'Passwords do not match.');
    return;
  }

  setLoading(true);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    Alert.alert('Verify Email', 'Check your email to confirm your account.');
    onProfileSaved(); // tell parent to proceed to the next step
  } catch (error) {
    Alert.alert('Registration Failed', error.message);
  } finally {
    setLoading(false);
  }
};


  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#aaa', marginTop: 10 }}>Locating you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#aaa" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#aaa" />
        </TouchableOpacity>
      </View>

      <View style={styles.locationPreview}>
        <Text style={styles.label}>Auto-Detected Location:</Text>
        <Text style={styles.locationText}>{barangay}, {municipality}</Text>
        {latitude && longitude ? (
          <Text style={styles.locationText}>
            Lat: {latitude.toFixed(5)} | Long: {longitude.toFixed(5)}
          </Text>
        ) : null}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && { backgroundColor: '#555' }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
    fontWeight: '600',
  },
  input: {
    borderColor: '#555',
    borderWidth: 1,
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#555',
    borderWidth: 1,
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    padding: 10,
  },
  locationPreview: {
    marginBottom: 20,
  },
  label: {
    color: '#bbb',
    marginBottom: 5,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  saveButton: {
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 6,
    width: '45%',
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
});

export default RegisterUser;
