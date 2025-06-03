import { View, Text, StyleSheet, Dimensions } from 'react-native';
import React, { useRef, useEffect } from 'react';
import MapView, { Circle, Marker } from 'react-native-maps';

const diseaseColors = {
  Salmo: '#FFD93D',
  Newcastle: '#4ECDC4',
  Cocci: '#FF6B6B',
  Healthy: '#95E1D3',
  Unknown: '#888',
};

export default function DiseaseMap({ locations = [], userLocation }) {
  const mapRef = useRef(null);

  const initialRegion = userLocation
  ? {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }
  : {
      latitude: 0, // fallback coordinates
      longitude: 0,
      latitudeDelta: 50,
      longitudeDelta: 50,
    };

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000 // duration in ms
      );
    }
  }, [userLocation]);


  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {userLocation && (
          <>
            <Marker coordinate={userLocation} pinColor="#2563EB" />
            <Circle
              center={userLocation}
              radius={100}
              strokeColor="#2563EB"
              fillColor="#2563EB33"
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



      {/* Optional overlay */}
      <View style={styles.mapOverlay}>
        <Text style={styles.mapTitle}>Your Location</Text>
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
  userPointer: {
    position: 'absolute',
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    marginLeft: -14,      // half icon size to center
    marginTop: 30,        // pushes it slightly below the center
    zIndex: 10,
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
