import React, { useState } from 'react';
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
import { supabase } from '../../lib/supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system';
import { saveScanToSupabase } from '../../lib/saveScanToSupabase';

export default function ScannerScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      handlePrediction(result.assets[0].uri);
    }
  };

  const handleImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      handlePrediction(result.assets[0].uri);
    }
  };

  const handlePrediction = async (imageUri: string) => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Authentication Error', 'Please log in to scan.');
        setLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need location to tag this scan.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (!location || !location.coords) {
        Alert.alert('Location Error', 'Unable to retrieve your current location. Please check if location services are enabled.');
        setLoading(false);
        return;
      }

      const fileExt = imageUri.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({ from: imageUri, to: filePath });
      const fileData = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scan-images')
        .upload(fileName, Buffer.from(fileData, 'base64'), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('scan-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData?.publicUrl;

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: fileName,
        type: 'image/jpeg',
      } as any);
      formData.append('latitude', String(location.coords.latitude));
      formData.append('longitude', String(location.coords.longitude));

      const response = await fetch('http://192.168.2.7:8080/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Prediction failed: ${errorText}`);
      }

      const result = await response.json();

      await saveScanToSupabase({
        imageUrl,
        prediction: result.prediction,
        confidence: result.confidence,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const { error: dbError } = await supabase.from('scans').insert({
        user_id: user.id,
        image_url: imageUrl,
        prediction: result.prediction,
        confidence: result.confidence,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      router.replace({
        pathname: '/result',
        params: {
          prediction: result.prediction,
          confidence: result.confidence,
          imageUrl,
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
        <TouchableOpacity style={styles.button} onPress={handleImageFromCamera}>
          <Ionicons name="camera-outline" size={20} color="#121212" />
          <Text style={styles.buttonText}>Take a Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleImageFromGallery}>
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
