import React from 'react';
import { ScrollView } from 'react-native';
import LatestScanCard from '../components/LatestScanCard';

const dummyScans = [
  {
    disease: 'Newcastle',
    confidence: 0.92,
    timestamp: new Date().toISOString(),
    imageUrl: 'https://via.placeholder.com/60',
    location: 'Barangay Uno, Laguna',
  },
  {
    disease: 'Salmo',
    confidence: 0.87,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    imageUrl: 'https://via.placeholder.com/60',
    location: 'Barangay Dos, Batangas',
  },
  {
    disease: 'Cocci',
    confidence: 0.78,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    imageUrl: 'https://via.placeholder.com/60',
    location: 'Barangay Tres, Quezon',
  },
  {
    disease: 'Healthy',
    confidence: 0.99,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    imageUrl: 'https://via.placeholder.com/60',
    location: 'Barangay Quatro, Cavite',
  },
  {
    disease: 'Unknown',
    confidence: 0.5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    imageUrl: 'https://via.placeholder.com/60',
    location: 'Barangay Cinco, Rizal',
  },
];

export default function LatestScanList() {
  return (
    <ScrollView style={{ maxHeight: 600, marginVertical: 10 }}>
      {dummyScans.map((scan, index) => (
        <LatestScanCard key={index} scan={scan} />
      ))}
    </ScrollView>
  );
}
