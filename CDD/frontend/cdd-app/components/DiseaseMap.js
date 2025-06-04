import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const diseaseColors = {
  Salmonellosis: '#FFD93D',
  Newcastle: '#4ECDC4',
  Coccidiosis: '#FF6B6B',
  Healthy: '#95E1D3',
  Unknown: '#888',
};

export default function DiseaseMap({
  locations = [],
  currentGpsLocation,
  useRegistered,
  onToggleLocation,
}) {
  const mapRef = useRef(null);
  const [registeredLocation, setRegisteredLocation] = useState(null);

  useEffect(() => {
    const fetchRegisteredLocation = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.lat && user.lng) {
          setRegisteredLocation({ latitude: user.lat, longitude: user.lng });
        }
      }
    };
    fetchRegisteredLocation();
  }, []);

  const activeLocation = useRegistered && registeredLocation ? registeredLocation : currentGpsLocation;

  useEffect(() => {
    if (activeLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...activeLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    }
  }, [activeLocation]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: activeLocation?.latitude || 7.0,
          longitude: activeLocation?.longitude || 126.0,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {activeLocation && (
          <>
            <Marker
              coordinate={activeLocation}
              pinColor={useRegistered ? '#888' : '#2563EB'}
            />
            <Circle
              center={activeLocation}
              radius={100}
              strokeColor={useRegistered ? '#888' : '#2563EB'}
              fillColor={useRegistered ? '#8888884D' : '#2563EB33'}
            />
          </>
        )}

        {locations.map((loc, index) => (
          <Circle
            key={index}
            center={{ latitude: loc.latitude, longitude: loc.longitude }}
            radius={100}
            strokeColor={diseaseColors[loc.disease] || diseaseColors.Unknown}
            fillColor={(diseaseColors[loc.disease] || diseaseColors.Unknown) + '55'}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.toggleButtonContainer} onPress={onToggleLocation}>
        <Text style={styles.toggleButtonText}>
          {useRegistered ? 'Current Location' : 'Registered Location'}
        </Text>
      </TouchableOpacity>

      <View style={styles.mapOverlay}>
        <Text style={styles.mapTitle}>Legend</Text>
        {Object.entries(diseaseColors).map(([key, color]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{key}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 320,
    width: '100%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  toggleButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    zIndex: 10,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  mapOverlay: {
    position: 'absolute',
    top: 40,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  mapTitle: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    color: '#FFF',
    fontSize: 8,
  },
});
