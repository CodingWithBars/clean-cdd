import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, Image, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import { getScanLocations } from '@/utils/api';
import styles from '../styles/index.styles';
import DiseaseMap from '../../components/DiseaseMap';

export default function HomeScreen() {
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Optional: Replace with real user info from auth context if available
  const user = {
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/100', // Placeholder avatar
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location access is required.');
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const response = await getScanLocations();
        setLocations(response.data || []);
      } catch (error) {
        console.error('Error fetching location or scan data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* User Profile Header */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.username}>{user.name}</Text>
        </View>
      </View>

      {/* Disease Map Below */}
      <View style={{ flex: 1 }}>
        <DiseaseMap locations={locations} userLocation={userLocation} />
      </View>
    </SafeAreaView>
  );
}
