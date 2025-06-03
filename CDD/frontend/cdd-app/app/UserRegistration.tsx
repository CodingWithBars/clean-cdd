import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import locationData from '../assets/locations.json';

const UserRegistration = ({ onComplete }: { onComplete: () => void }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');

  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('userInfo');
      if (storedUser) {
        onComplete();
      } else {
        setLoading(false);
        detectRegionFromGPS();
      }
    };
    checkUser();
  }, []);

  const detectRegionFromGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const reverse = await Location.reverseGeocodeAsync(loc.coords);
      const userRegion = reverse[0]?.region || '';

      const matchedRegion = locationData.regions.find((r) => r.name === userRegion);
      if (matchedRegion) {
        setRegion(matchedRegion.name);
        setProvinces(matchedRegion.provinces);
      }
    } catch (err) {
      console.warn('GPS location detection failed');
    }
  };

  useEffect(() => {
    const found = locationData.regions.find((r) => r.name === region);
    if (found) {
      setProvinces(found.provinces);
      setProvince('');
      setMunicipality('');
      setBarangay('');
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [region]);

  useEffect(() => {
    const found = provinces.find((p) => p.name === province);
    if (found) {
      setMunicipalities(found.municipalities);
      setMunicipality('');
      setBarangay('');
      setBarangays([]);
    }
  }, [province]);

  useEffect(() => {
    const found = municipalities.find((m) => m.name === municipality);
    if (found) {
      setBarangays(found.barangays);
      setBarangay('');
    }
  }, [municipality]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !email || !contact || !region || !province || !municipality || !barangay) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    const location = `${barangay}, ${municipality}, ${province}, ${region}`;
    const userInfo = { fullName, email, contact, profileImage, location };
    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    onComplete();
  };

  if (loading) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>User Registration</Text>
        </View>

        {/* Scrollable Form */}
        <ScrollView contentContainerStyle={styles.formContainer}>
          <TouchableOpacity onPress={handleImagePick} style={styles.imagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <Text style={styles.imageText}>Tap to upload profile image</Text>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#888"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={contact}
            onChangeText={setContact}
          />

          <Text style={styles.label}>Region</Text>
          <Picker
            selectedValue={region}
            onValueChange={(value) => setRegion(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Region" value="" />
            {locationData.regions.map((r) => (
              <Picker.Item key={r.name} label={r.name} value={r.name} />
            ))}
          </Picker>

          <Text style={styles.label}>Province</Text>
          <Picker
            selectedValue={province}
            onValueChange={(value) => setProvince(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Province" value="" />
            {provinces.map((p) => (
              <Picker.Item key={p.name} label={p.name} value={p.name} />
            ))}
          </Picker>

          <Text style={styles.label}>Municipality / City</Text>
          <Picker
            selectedValue={municipality}
            onValueChange={(value) => setMunicipality(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Municipality" value="" />
            {municipalities.map((m) => (
              <Picker.Item key={m.name} label={m.name} value={m.name} />
            ))}
          </Picker>

          <Text style={styles.label}>Barangay</Text>
          <Picker
            selectedValue={barangay}
            onValueChange={(value) => setBarangay(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Barangay" value="" />
            {barangays.map((b) => (
              <Picker.Item key={b} label={b} value={b} />
            ))}
          </Picker>
        </ScrollView>

        {/* Fixed Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    paddingBottom: 100, // leave space for submit button
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
    color: '#fff',
    borderRadius: 10,
    marginBottom: 15,
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
