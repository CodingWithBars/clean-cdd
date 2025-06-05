import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import locations from '@/constants/locations.json';

export default function SetupProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [availableBarangays, setAvailableBarangays] = useState([]);

  useEffect(() => {
    if (municipality && locations[municipality]) {
      setAvailableBarangays(locations[municipality]);
    } else {
      setAvailableBarangays([]);
    }
  }, [municipality]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!username || !municipality || !barangay) {
      Alert.alert('Incomplete Info', 'Please fill in all fields.');
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      Alert.alert('Error', 'No authenticated user.');
      return;
    }

    let profileImageUrl = null;

    if (profileImage) {
      const response = await fetch(profileImage);
      const blob = await response.blob();
      const fileName = `${user.id}-${Date.now()}.jpg`;

      const { data, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) {
        Alert.alert('Upload Error', uploadError.message);
        return;
      }

      const { data: publicURLData } = supabase
        .storage
        .from('profile-images')
        .getPublicUrl(data.path);

      profileImageUrl = publicURLData.publicUrl;
    }

    const userData = {
      user_id: user.id,
      username,
      profile_image_url: profileImageUrl,
      municipality,
      barangay,
      region: 'Davao Region',
      province: 'Davao Oriental',
    };

    const { error: insertError } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'user_id' });

    if (insertError) {
      Alert.alert('Database Error', insertError.message);
      return;
    }

    await AsyncStorage.setItem('user_info', JSON.stringify(userData));
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#000', padding: 20 }}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Complete Your Profile
      </Text>

      <TouchableOpacity onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={{ width: 100, height: 100, borderRadius: 50 }} />
        ) : (
          <View style={{
            width: 100, height: 100, borderRadius: 50, backgroundColor: '#222',
            alignItems: 'center', justifyContent: 'center', marginBottom: 20
          }}>
            <Text style={{ color: '#888' }}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#888"
        style={{
          backgroundColor: '#1a1a1a',
          color: '#fff',
          padding: 12,
          borderRadius: 8,
          marginVertical: 10,
        }}
      />

      <Text style={{ color: '#888', marginTop: 10 }}>Municipality</Text>
      {Object.keys(locations).map((mun) => (
        <TouchableOpacity key={mun} onPress={() => setMunicipality(mun)}>
          <Text style={{
            color: municipality === mun ? '#00c853' : '#fff',
            paddingVertical: 8,
          }}>{mun}</Text>
        </TouchableOpacity>
      ))}

      {availableBarangays.length > 0 && (
        <>
          <Text style={{ color: '#888', marginTop: 10 }}>Barangay</Text>
          {availableBarangays.map((bgy) => (
            <TouchableOpacity key={bgy} onPress={() => setBarangay(bgy)}>
              <Text style={{
                color: barangay === bgy ? '#00c853' : '#fff',
                paddingVertical: 6,
              }}>{bgy}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: '#00c853',
          marginTop: 20,
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#000', fontWeight: 'bold' }}>Finish Setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
