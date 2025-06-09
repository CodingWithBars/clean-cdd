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
import useUserProfile from '../hooks/useUserProfile';


const ProfileSetupForm = ({ onProfileSaved, onCancel }) => {
  const [name, setName] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
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
        Alert.alert('Permission denied', 'We need your location to set up your profile.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(location.coords);

      if (geocode.length > 0) {
        const place = geocode[0];
        setMunicipality(place.city || place.subregion || '');
        setBarangay(place.name || '');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to retrieve location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !municipality || !barangay) {
      Alert.alert('Incomplete', 'Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      const userProfile = {
        name,
        municipality,
        barangay,
      };

      await AsyncStorage.setItem('userInfo', JSON.stringify(userProfile));
      onProfileSaved(userProfile);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#aaa', marginTop: 10 }}>Fetching your location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Your Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Your Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.locationPreview}>
        <Text style={styles.label}>Detected Location:</Text>
        <Text style={styles.locationText}>
          {barangay}, {municipality}
        </Text>
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
          <Text style={styles.saveText}>{loading ? 'Saving…' : 'Save'}</Text>
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
