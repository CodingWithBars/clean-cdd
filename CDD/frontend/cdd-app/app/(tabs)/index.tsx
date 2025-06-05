import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getScanLocations } from '@/utils/api';
import styles from '../styles/index.styles';
import DiseaseMap from '../../components/DiseaseMap';
import AnalyticsPanel from '../../components/AnalyticsPanel';
import ProfileSection from '../../components/ProfileSection';
import UserRegistration from '../UserRegistration';
import DiseaseAlertBanner from '../../components/DiseasAlertBanner';
import LatestScanList from '../../components/LatestScanList';
import { useNavigation } from 'expo-router';

export default function HomeScreen() {
  
  const [useRegistered, setUseRegistered] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [registeredCoords, setRegisteredCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(true);

  const navigation = useNavigation();

  const convertLocationToCoords = async (locationString: string) => {
    if (!locationString || typeof locationString !== 'string' || locationString.trim() === '') {
      console.warn('Location string is empty or invalid.');
      return;
    }

    try {
      const geocode = await Location.geocodeAsync(locationString);
      if (geocode.length > 0) {
        const coords = {
          latitude: geocode[0].latitude,
          longitude: geocode[0].longitude,
        };
        setRegisteredCoords(coords);
        console.log('Geocoded coords:', coords);
      } else {
        console.warn('No geocode results found for the provided location.');
      }
    } catch (error) {
      console.warn('Failed to geocode user location', error);
    }
  };

  useEffect(() => {
    if (useRegistered && registeredCoords) {
      setUserLocation(registeredCoords);
    } else if (!useRegistered) {
      Location.getCurrentPositionAsync({}).then((loc) => {
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      });
    }
  }, [useRegistered, registeredCoords]);

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem('userInfo');
      if (data) {
        const parsed = JSON.parse(data);
        console.log('Loaded user info:', parsed); // Debug log

        setUserInfo(parsed);

        const fullLocation = `${parsed.barangay}, ${parsed.municipality}, ${parsed.province}, ${parsed.region}`;
        convertLocationToCoords(fullLocation);

        setShowRegistration(false);
      } else {
        setShowRegistration(true);
      }
    };

    loadUser();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: showRegistration ? { display: 'none' } : undefined,
    });
  }, [showRegistration]);

  const handleRegistrationComplete = async () => {
    const data = await AsyncStorage.getItem('userInfo');
    if (data) {
      const parsed = JSON.parse(data);
      setUserInfo(parsed);
      const fullLocation = `${parsed.barangay}, ${parsed.municipality}, ${parsed.province}, ${parsed.region}`;
      convertLocationToCoords(fullLocation);
    }
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

        if (!userLocation) {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }

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
      {userInfo && (
        <ProfileSection />
      )}

      

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Map */}
        <View style={{ height: 320, marginTop: 10 }}>
          <DiseaseMap
            currentGpsLocation={userLocation} // ✅ updated
            locations={locations}
            useRegistered={useRegistered}
            onToggleLocation={() => setUseRegistered(!useRegistered)}
          />
        </View>

        {/* Analytics */}
        <AnalyticsPanel locations={locations} useDummyData={true} />
        
        <DiseaseAlertBanner userLocation={userLocation} locations={locations} />
        
        <View style={{ flex: 1, backgroundColor: '#111827', paddingTop: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>Latest Scan Summary</Text>
          <LatestScanList />
        </View>
      
      </ScrollView>
    </SafeAreaView>
  );
}
