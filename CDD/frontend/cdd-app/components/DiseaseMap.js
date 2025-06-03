import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const diseaseColors = {
  Salmo: '#FFD93D',
  Newcastle: '#4ECDC4',
  Cocci: '#FF6B6B',
  Healthy: '#95E1D3',
  Unknown: '#888',
};

export default function DiseaseMap({ locations = [], userLocation = null }) {
  const defaultRegion = {
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  const region = userLocation
    ? {
        ...userLocation,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }
    : defaultRegion;

  return (
    <View style={styles.mapContainer}>
      <MapView style={styles.map} region={region}>
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#007AFF"
          />
        )}

        {locations.map((loc, index) =>
          typeof loc.latitude === 'number' && typeof loc.longitude === 'number' ? (
            <Circle
              key={index}
              center={{ latitude: loc.latitude, longitude: loc.longitude }}
              radius={3000}
              strokeColor={diseaseColors[loc.disease] || diseaseColors.Unknown}
              fillColor={(diseaseColors[loc.disease] || diseaseColors.Unknown) + '55'}
            />
          ) : null
        )}
      </MapView>

      <View style={styles.mapOverlay}>
        <Text style={styles.mapTitle}>Disease Locations</Text>
        <View style={styles.legend}>
          {Object.entries(diseaseColors).map(([key, color]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{key}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: '300',
    width: '100%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '300',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  mapTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    color: '#FFF',
    fontSize: 12,
  },
});
