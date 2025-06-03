import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getScanLocations } from '@/utils/api';
import styles from '../styles/index.styles';
import DiseaseMap from '../../components/DiseaseMap';
import AnalyticsPanel from '../../components/AnalyticsPanel';
import UserRegistration from '../UserRegistration'; // Adjust path if needed
import { router } from 'expo-router';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

// Disease color codes
const diseaseColors: Record<string, string> = {
  Newcastle: '#4ECDC4',
  Salmo: '#FFD93D',
  Cocci: '#FF6B6B',
  Healthy: '#95E1D3',
  Unknown: '#888',
};

export default function HomeScreen() {
  const [locations, setLocations] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(true);

  // Placeholder user data — update with real user later
  const user = {
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/100',
  };

  const diseaseCounts: Record<string, number> = locations.reduce((acc, loc) => {
    const key = loc.disease || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: !showRegistration, // Hide header only during registration
      tabBarStyle: showRegistration ? { display: 'none' } : undefined,
    });
  }, [showRegistration]);


  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await AsyncStorage.getItem('userInfo');
      if (storedUser) {
        setShowRegistration(false);
      }
    };
    checkUser();
  }, []);

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
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

    if (!showRegistration) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [showRegistration]);

  if (showRegistration) {
    return <UserRegistration onComplete={handleRegistrationComplete} />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      {/* User Header */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.username}>{user.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Map */}
        <View style={{ height: 300 }}>
          <DiseaseMap locations={locations} userLocation={userLocation} />
        </View>

        {/* Analytics */}
        <AnalyticsPanel locations={locations} useDummyData={true} />
      </ScrollView>
    </SafeAreaView>
  );
}
