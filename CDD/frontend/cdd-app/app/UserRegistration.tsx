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
import { supabase } from '../lib/supabase';

const RegistrationForm = ({ onRegistered, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [street, setStreet] = useState('');
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
        Alert.alert('Permission denied', 'Location is required to set up your profile.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(location.coords);
      if (geocode.length > 0) {
        const place = geocode[0];
        setMunicipality(place.city || place.subregion || '');
        setBarangay(place.name || '');
        setRegion(place.region || '');
        setCountry(place.country || '');
        setStreet(place.street || '');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to retrieve location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Incomplete', 'Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const user = data?.user;
      if (!user) throw new Error('No user returned after signup.');

      const profileData = {
        user_id: user.id,
        name,
        email,
        municipality,
        barangay,
        region,
        country,
        street,
      };

      const { error: insertError } = await supabase.from('user_profiles').insert([profileData]);

      if (insertError) throw insertError;

      onRegistered(profileData);
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#aaa', marginTop: 10 }}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <View style={styles.locationPreview}>
        <Text style={styles.label}>Detected Location:</Text>
        <Text style={styles.locationText}>
          {barangay}, {municipality}
        </Text>
        {region ? <Text style={styles.locationText}>{region}</Text> : null}
        {country ? <Text style={styles.locationText}>{country}</Text> : null}
        {street ? <Text style={styles.locationText}>Street: {street}</Text> : null}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, loading && { backgroundColor: '#555' }]}
          onPress={handleRegister}
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

export default RegistrationForm;
