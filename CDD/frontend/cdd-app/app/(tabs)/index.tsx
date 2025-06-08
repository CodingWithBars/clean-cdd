import { Buffer } from 'buffer';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';

import { getScanLocations } from '@/utils/api';
import styles from '../styles/index.styles';

import ProfileSection from '../../components/ProfileSection';
import DiseaseMap from '../../components/DiseaseMap';
import AnalyticsPanel from '../../components/AnalyticsPanel';
import DiseaseAlertBanner from '../../components/DiseasAlertBanner';
import LatestScanList from '../../components/LatestScanList';

export default function HomeScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  // Hide header
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

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

  if (typeof global.Buffer === 'undefined') {
    global.Buffer = Buffer;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
      </View>
    );
  }

  return (
    <>
    
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <ProfileSection />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ height: 320, marginTop: 10 }}>
          <DiseaseMap
            currentGpsLocation={userLocation}
            locations={locations}
            useRegistered={false}
            onToggleLocation={() => {}}
          />
        </View>

        <AnalyticsPanel locations={locations} useDummyData={true} />
        <DiseaseAlertBanner userLocation={userLocation} locations={locations} />

        <View style={{ flex: 1, backgroundColor: '#111827', paddingTop: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>
            Latest Scan Summary
          </Text>
          <LatestScanList />
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}
