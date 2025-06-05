import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ScannerScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Location permission is needed to tag scans.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const userInfo = await AsyncStorage.getItem('user_info');
    const user = userInfo ? JSON.parse(userInfo) : null;
    if (!user) throw new Error("User info not found.");

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'scan.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('latitude', String(location.coords.latitude));
    formData.append('longitude', String(location.coords.longitude));
    formData.append('municipality', user.municipality);
    formData.append('barangay', user.barangay);
    formData.append('user_id', user.id); // Should be saved on registration

    const response = await fetch('http://192.168.2.7:8080/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${errorText}`);
    }

    const data = await response.json();

    const existing = await AsyncStorage.getItem('scan_history');
    const history = existing ? JSON.parse(existing) : [];
    const newHistory = [data, ...history].slice(0, 10);
    await AsyncStorage.setItem('scan_history', JSON.stringify(newHistory));

    router.replace({ pathname: '/result', params: { ...data } });

  } catch (err: any) {
    Alert.alert('Prediction Failed', err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chicken Disease Scanner</Text>

      <TouchableOpacity style={styles.button} onPress={handleImagePick}>
        <Text style={styles.buttonText}>Pick or Capture Image</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#4ECDC4" style={{ marginTop: 20 }} />}
      {image && !loading && <Image source={{ uri: image }} style={styles.preview} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, color: 'white', marginBottom: 20 },
  button: { backgroundColor: '#4ECDC4', padding: 12, borderRadius: 8 },
  buttonText: { color: '#121212', fontSize: 16 },
  preview: { width: 250, height: 250, marginTop: 20, borderRadius: 12 },
});
