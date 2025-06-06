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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import uuid from 'react-native-uuid';

const ProfileSetupForm = ({ existingData = {}, onProfileSaved, onCancel }) => {
  const [name, setName] = useState(existingData.name || '');
  const [email, setEmail] = useState(existingData.email || '');
  const [municipality, setMunicipality] = useState(existingData.municipality || '');
  const [barangay, setBarangay] = useState(existingData.barangay || '');
  const [region, setRegion] = useState(existingData.region || '');
  const [country, setCountry] = useState(existingData.country || '');
  const [street, setStreet] = useState(existingData.street || '');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!existingData?.municipality) {
      fetchLocation();
    }
  }, []);

  const fetchLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need your location to set up your profile.');
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

    const handleSubmit = async () => {
        if (!name || !email || !municipality || !barangay) {
            Alert.alert('Incomplete', 'Please fill out all required fields.');
            return;
        }

        setLoading(true);

        try {
            const userData = {
            user_id: existingData.user_id || uuid.v4(),
            name,
            email,
            municipality,
            barangay,
            region,
            country,
            street,
            };

            // Check if email already exists
            const { data: existingUser, error: lookupError } = await supabase
            .from('users')
            .select('user_id')
            .eq('email', email)
            .single();

            if (lookupError && lookupError.code !== 'PGRST116') {
            // PGRST116 = No rows found
            throw lookupError;
            }

            let response;
            if (existingUser) {
            // Update existing user
            response = await supabase
                .from('users')
                .update(userData)
                .eq('email', email);
            } else {
            // Insert new user
            response = await supabase.from('users').insert([userData]);
            }

            if (response.error) {
            throw response.error;
            }

            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            onProfileSaved(userData);
        } catch (error) {
            console.error('Profile save error:', error);

            if (error.code === '23505') {
                Alert.alert('Email Already Used', 'This email is already associated with another account. Please use a different email or update the existing one.');
            } else {
                Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
            }
        }
    };


  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#aaa', marginTop: 10 }}>Fetching your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {existingData.name ? 'Edit Your Profile' : 'Set Up Your Profile'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Your Email"
        placeholderTextColor="#aaa"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
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
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
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

export default ProfileSetupForm;
