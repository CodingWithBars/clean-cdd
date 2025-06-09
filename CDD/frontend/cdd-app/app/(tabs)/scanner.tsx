import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { saveScanToSupabase } from '../../lib/saveScanToSupabase';

import { uploadScan } from '../../utils/api';

export default function ScannerScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  const handleImagePick = async (fromCamera: boolean) => {
    const picker = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await picker({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);
      handlePrediction(uri);
    }
  };

  const handlePrediction = async (imageUri: string) => {
  try {
    setLoading(true);

    if (!userProfile) {
      Alert.alert('Missing Profile', 'User profile not loaded.');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location is required for scan tagging.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    if (!location?.coords) {
      Alert.alert('Location Error', 'Unable to get current position.');
      return;
    }

    const formData = new FormData();
    const fileName = `${uuidv4()}.jpg`;

    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg',
    } as any);

    formData.append('latitude', String(location.coords.latitude));
    formData.append('longitude', String(location.coords.longitude));
    formData.append('municipality', userProfile.municipality);
    formData.append('barangay', userProfile.barangay);
    formData.append('user_id', userProfile.id);

    console.log('📤 Sending FormData:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      municipality: userProfile.municipality,
      barangay: userProfile.barangay,
      user_id: userProfile.id,
      image: imageUri,
    });

    const response = await fetch('https://0901-2001-4455-6f3-a00-dd29-7ce8-1951-677.ngrok-free.app/predict', {
      method: 'POST',
      body: formData,
    });

    const res = await uploadScan(formData);
    console.log("Uploaded:", res);

    if (!response.ok) throw new Error('Prediction failed.');
    const result = await response.json();

    await saveScanToSupabase({
      imageUrl: imageUri,
      prediction: result.prediction,
      confidence: result.confidence,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      name: userProfile.name,
      municipality: userProfile.municipality,
      barangay: userProfile.barangay,
    });

    router.replace({
      pathname: '/result',
      params: {
        prediction: result.prediction,
        confidence: result.confidence,
        imageUrl: imageUri,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    });
  } catch (err: any) {
    Alert.alert('Scan Error', err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chicken Fecal Scanner</Text>

      <View style={styles.previewWrapper}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={48} color="#777" />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleImagePick(true)}>
          <Ionicons name="camera-outline" size={20} color="#121212" />
          <Text style={styles.buttonText}>Take a Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => handleImagePick(false)}>
          <Ionicons name="image-outline" size={20} color="#121212" />
          <Text style={styles.buttonText}>Upload from Gallery</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#4ECDC4" style={{ marginTop: 30 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#ffffff',
    marginBottom: 30,
    fontWeight: '600',
    top: -50,
  },
  previewWrapper: {
    width: 260,
    height: 260,
    borderRadius: 16,
    borderColor: '#4ECDC4',
    borderWidth: 2,
    marginBottom: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#888',
    fontSize: 14,
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '500',
  },
});
