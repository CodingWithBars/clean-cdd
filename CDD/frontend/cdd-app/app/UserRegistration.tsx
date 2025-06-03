import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

import locationData from '../assets/locations.json';
import { supabase } from '../lib/supabase';

const regionInfo = locationData.region;

const getMimeType = (uri: string): string => {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
};

const UserRegistration = ({ onComplete }: { onComplete: () => void }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [imageUri, setImageUri] = useState('');

  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');

  const [provinces, setProvinces] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('userInfo');
      if (storedUser) {
        onComplete();
      } else {
        setProvinces(regionInfo.provinces);
      }
    };
    checkUser();
  }, []);

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    const selectedProvince = provinces.find((p) => p.name === value);
    if (selectedProvince) {
      setMunicipalities(selectedProvince.municipalities);
      setMunicipality('');
      setBarangay('');
      setBarangays([]);
    }
  };

  const handleMunicipalityChange = (value: string) => {
    setMunicipality(value);
    const selectedMunicipality = municipalities.find((m) => m.name === value);
    if (selectedMunicipality) {
      setBarangays(selectedMunicipality.barangays);
      setBarangay('');
    }
  };

  const handleRegister = async () => {
    let imageUrl = '';

    if (imageUri) {
      try {
        const fileExt = imageUri.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const mimeType = getMimeType(imageUri);

        const fileData = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(`public/${fileName}`, fileData, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return;
        }

        const { data: publicUrlData } = supabase
          .storage
          .from('profile-images')
          .getPublicUrl(`public/${fileName}`);

        imageUrl = publicUrlData.publicUrl;
      } catch (error) {
        console.error('Image upload failed:', error);
        return;
      }
    }

    const userInfo = {
      name,
      contact,
      email,
      imageUri: imageUrl,
      region: regionInfo.name,
      province,
      municipality,
      barangay,
    };

    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    onComplete();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Registration</Text>
      </View>

      <View style={styles.formContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <Text style={styles.imageText}>Pick Profile Image</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
          value={contact}
          onChangeText={setContact}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Province</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={province}
            onValueChange={handleProvinceChange}
            dropdownIconColor="#fff"
            style={{ color: '#fff' }}
          >
            <Picker.Item label="Select Province" value="" />
            {provinces.map((prov) => (
              <Picker.Item key={prov.id} label={prov.name} value={prov.name} />
            ))}
          </Picker>
        </View>

        {municipalities.length > 0 && (
          <>
            <Text style={styles.label}>Municipality</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={municipality}
                onValueChange={handleMunicipalityChange}
                dropdownIconColor="#fff"
                style={{ color: '#fff' }}
              >
                <Picker.Item label="Select Municipality" value="" />
                {municipalities.map((mun) => (
                  <Picker.Item key={mun.id} label={mun.name} value={mun.name} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {barangays.length > 0 && (
          <>
            <Text style={styles.label}>Barangay</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={barangay}
                onValueChange={setBarangay}
                dropdownIconColor="#fff"
                style={{ color: '#fff' }}
              >
                <Picker.Item label="Select Barangay" value="" />
                {barangays.map((brgy, index) => (
                  <Picker.Item key={index} label={brgy} value={brgy} />
                ))}
              </Picker>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRegister}
          disabled={!name || !contact || !email || !province || !municipality || !barangay}
        >
          <Text style={styles.submitText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    paddingBottom: 100,
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
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
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
