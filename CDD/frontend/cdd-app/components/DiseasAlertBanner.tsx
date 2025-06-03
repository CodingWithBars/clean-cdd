import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import haversine from 'haversine-distance';

const DISEASE_RADIUS_KM = 5;

const diseaseColors = {
  Newcastle: '#4ECDC4',
  Salmo: '#FFD93D',
  Cocci: '#FF6B6B',
  Healthy: '#95E1D3',
  Unknown: '#888',
};

function getNearbyAlert(userLocation, locations) {
  if (!userLocation || !locations.length) return null;

  for (const loc of locations) {
    const distanceMeters = haversine(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: loc.latitude, longitude: loc.longitude }
    );
    const distanceKm = distanceMeters / 1000;
    if (distanceKm <= DISEASE_RADIUS_KM) {
      return { ...loc, distanceKm: distanceKm.toFixed(1) };
    }
  }
  return null;
}

export default function DiseaseAlertBanner({ userLocation, locations = [] }) {
  const [dismissed, setDismissed] = useState(false);

  const nearbyAlert = useMemo(
    () => getNearbyAlert(userLocation, locations),
    [userLocation, locations]
  );

  if (!nearbyAlert || dismissed) return null;

  const backgroundColor = diseaseColors[nearbyAlert.disease] || '#444';

  return (
    <View style={[styles.alertBanner, { backgroundColor }]}>
      <Text style={styles.alertText}>
        ⚠️ {nearbyAlert.disease} outbreak detected {nearbyAlert.distanceKm} km from your location.
      </Text>
      <TouchableOpacity onPress={() => setDismissed(true)}>
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  alertBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#444',
    elevation: 4,
  },
  alertText: {
    color: '#FFF',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    fontSize: 14,
  },
  dismissText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    paddingHorizontal: 8,
  },
});
