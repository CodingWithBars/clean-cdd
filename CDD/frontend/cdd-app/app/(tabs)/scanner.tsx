import React, { useState } from 'react';
import { View, Text, Button, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import styles from './styles/scanner.styles';
import { uploadScan } from '@/utils/api';
import { useRouter } from 'expo-router';

export default function ScannerScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permission required to access photos');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) return Alert.alert('Please select an image first.');

    setUploading(true);

    try {
      const location = await Location.getCurrentPositionAsync({});
      const formData = new FormData();

      formData.append('image', {
        uri: image,
        name: 'scan.jpg',
        type: 'image/jpeg',
      } as any);

      formData.append('latitude', String(location.coords.latitude));
      formData.append('longitude', String(location.coords.longitude));

      const response = await uploadScan(formData);

    router.push({
        pathname: '/result',
        params: {
            disease: response.data.disease,
            probability: response.data.probability,
            latitude: response.data.latitude,
            longitude: response.data.longitude,
        },
    });

    } catch (err) {
      console.error(err);
      Alert.alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chicken Disease Scanner</Text>

      <Button title="Choose Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <Button title="Upload & Predict" onPress={handleUpload} disabled={uploading} />

      {uploading && <ActivityIndicator size="large" style={styles.loader} />}
    </View>
  );
}
