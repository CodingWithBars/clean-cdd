import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

const diseaseColors = {
  Newcastle: '#4ECDC4',
  Salmo: '#FFD93D',
  Cocci: '#FF6B6B',
  Healthy: '#95E1D3',
  Unknown: '#888',
};

export default function LatestScanCard({ scan }) {
  if (!scan) return null;

  const {
    disease = 'Unknown',
    confidence = 0,
    timestamp,
    imageUrl,
    location,
  } = scan;

  const formattedTime = timestamp
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : 'Unknown time';

  return (
    <View style={[styles.card, { borderLeftColor: diseaseColors[disease] || '#888' }]}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.disease}>{disease}</Text>
        <Text style={styles.confidence}>Confidence: {(confidence * 100).toFixed(1)}%</Text>
        <Text style={styles.time}>{formattedTime}</Text>
        <Text style={styles.location}>{location || 'Unknown location'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    borderLeftWidth: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  disease: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidence: {
    color: '#E5E7EB',
    fontSize: 12,
  },
  time: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  location: {
    color: '#D1D5DB',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
