// app/SetupProfile.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const SetupProfile = () => {
  const [fullName, setFullName] = useState('');
  const [barangay, setBarangay] = useState('');
  const [municipality, setMunicipality] = useState('');
  const router = useRouter();

  const handleSaveProfile = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) {
    Alert.alert('User not found');
    return;
  }

  const userId = userData.user.id;

  const { error: insertError } = await supabase.from('user_info').insert({
    id: userId,
    full_name: fullName,
    barangay,
    municipality,
  });

  if (insertError) {
    Alert.alert('Error saving profile', insertError.message);
  } else {
    Alert.alert('Profile Saved', 'Welcome!');
    setTimeout(() => {
    router.replace('/');
    }, 100); // ✅ goes to app/(tabs)/index.tsx
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Barangay" value={barangay} onChangeText={setBarangay} />
      <TextInput style={styles.input} placeholder="Municipality" value={municipality} onChangeText={setMunicipality} />

      <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
        <Text style={styles.buttonText}>Save and Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2f80ed',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default SetupProfile;
