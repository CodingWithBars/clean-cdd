// /app/setup-profile.tsx
import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function SetupProfile() {
  const [username, setUsername] = useState('');
  const [barangay, setBarangay] = useState('');
  const [municipality, setMunicipality] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username,
      barangay,
      municipality,
    });

    if (error) Alert.alert('Error', error.message);
    else router.replace('/');
  };

  return (
    <View>
      <TextInput placeholder="Username" onChangeText={setUsername} />
      <TextInput placeholder="Barangay" onChangeText={setBarangay} />
      <TextInput placeholder="Municipality" onChangeText={setMunicipality} />
      <Button title="Finish Setup" onPress={handleSubmit} />
    </View>
  );
}
