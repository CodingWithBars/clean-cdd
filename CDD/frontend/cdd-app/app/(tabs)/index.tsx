import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getScanLocations } from '@/utils/api';
import styles from './styles/index.styles';

export default function HomeScreen() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getScanLocations();
        setLocations(response.data);
      } catch (err) {
        console.error('Failed to fetch scan locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: locations[0]?.latitude || 14.5995,
          longitude: locations[0]?.longitude || 120.9842,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {locations.map((loc, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.disease}
            description={`Confidence: ${(loc.probability * 100).toFixed(1)}%`}
          />
        ))}
      </MapView>
    </View>
  );
}
