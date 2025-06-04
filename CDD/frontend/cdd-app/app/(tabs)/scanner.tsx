import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

const API_BASE_URL = 'http://192.168.2.7:8080'; // 🔧 Adjust IP or move to config

export default function ScanScreen() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('Unknown');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          Alert.alert('Location Disabled', 'Enable location services to use scanning.');
          return;
        }

        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          return;
        }

        const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (camStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required.');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);

        const geocode = await Location.reverseGeocodeAsync(loc.coords);
        const place = geocode[0];
        const humanReadable = `${place?.district || ''}, ${place?.city || place?.region || ''}`;
        setLocationName(humanReadable || 'Unknown');
      } catch (err) {
        console.error('Permission error:', err);
        Alert.alert('Error', 'Could not retrieve location.');
      }
    };

    requestPermissions();
  }, []);

  const handleImagePick = async (source) => {
    try {
      const pickerFunc = source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

      const result = await pickerFunc({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop();
        setImage(uri);
        setImageName(filename);
      }
    } catch (err) {
      console.error('Image pick error:', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleSubmit = async () => {
    if (!image || !location) {
      Alert.alert('Missing Data', 'Please capture an image and ensure location is available.');
      return;
    }

    setLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Prediction failed');

      const { prediction, probabilities } = result;
      const filename = `${Date.now()}_${imageName || 'scan'}`;

      const { data, error } = await supabase.storage
        .from('scans')
        .upload(filename, await (await fetch(image)).blob());

      if (error) throw error;

      const { error: insertError } = await supabase
        .from('scan_results')
        .insert({
          image_url: data.path,
          prediction,
          probabilities,
          latitude: location.latitude,
          longitude: location.longitude,
        });

      if (insertError) throw insertError;

      await AsyncStorage.setItem('last_scan', JSON.stringify({ prediction, probabilities }));
      router.push(`/result?prediction=${prediction}`);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to process scan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan a Chicken</Text>
      <Text style={styles.subtitle}>Location: {locationName}</Text>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => handleImagePick('camera')} style={styles.button}>
          <Text style={styles.buttonText}>Use Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleImagePick('gallery')} style={styles.button}>
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.button, { marginTop: 16 }]}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
