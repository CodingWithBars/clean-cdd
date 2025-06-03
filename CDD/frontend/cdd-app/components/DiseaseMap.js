import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useRef, useEffect } from 'react';
import MapView, { Circle, Marker } from 'react-native-maps';

const diseaseColors = {
  Salmonellosis: '#FFD93D',
  Newcastle: '#4ECDC4',
  Coccidiosis: '#FF6B6B',
  Healthy: '#95E1D3',
  Unknown: '#888',
};

export default function DiseaseMap({
  locations = [],
  userLocation,
  useRegistered,
  onToggleLocation,
}) {
  const mapRef = useRef(null);

  const initialRegion = {
    latitude: userLocation?.latitude || 0,
    longitude: userLocation?.longitude || 0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  }, [userLocation]);

  return (
    <View style={styles.mapContainer}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion}>
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

      {/* Toggle location button */}
      <View style={styles.toggleButtonContainer}>
        <TouchableOpacity onPress={onToggleLocation} style={styles.toggleButton}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>
            {useRegistered ? 'Current Location' : 'Registered Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.mapOverlay}>
        <Text style={styles.mapTitle}>Legend</Text>
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
    height: 320,
    width: '100%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: 320,
  },
  toggleButtonContainer: {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 10,
},
toggleButton: {
  backgroundColor: '#2563EB',
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 6,
},
  mapOverlay: {
  position: 'absolute',
  top: 40, // below the toggle
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
  legend: {
  flexDirection: 'column', // vertical
  justifyContent: 'flex-start',
},
legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 2,
},
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    color: '#FFF',
    fontSize: 8,
  },
});
