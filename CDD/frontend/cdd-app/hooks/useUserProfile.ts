import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const cached = await AsyncStorage.getItem('user_profile');
        if (cached) {
          setUserProfile(JSON.parse(cached));
        } else {
          Alert.alert('User Info Missing', 'Please complete your profile setup.');
        }
      } catch (err: any) {
        Alert.alert('User Info Error', err.message);
      }
    };

    loadUserInfo();
  }, []);

  return userProfile;
};

export default useUserProfile;
