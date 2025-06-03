import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import styles from '../app/styles/analytics.style';
import { router } from 'expo-router';

// Color mappings
const diseaseColors: Record<string, string> = {
  Newcastle: '#4ECDC4',
  Salmo: '#FFD93D',
  Cocci: '#FF6B6B',
  Healthy: '#95E1D3',
  Unknown: '#888',
};

const diseaseIcons: Record<string, string> = {
  Newcastle: '🦠',
  Salmo: '🧫',
  Cocci: '🧪',
  Healthy: '✅',
  Unknown: '❓',
};

type Props = {
  locations: { disease: string }[];
  useDummyData?: boolean;
};

export default function AnalyticsPanel({ locations, useDummyData = false }: Props) {
  const testLocations = [
    { disease: 'Newcastle' },
    { disease: 'Cocci' },
    { disease: 'Salmo' },
    { disease: 'Newcastle' },
    { disease: 'Healthy' },
  ];

  const data = useDummyData ? testLocations : locations;

  const diseaseCounts: Record<string, number> = data.reduce((acc, loc) => {
    const key = loc.disease || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.analyticsContainer}>
      <Text style={styles.analyticsTitle}>Disease Analytics</Text>

      {Object.keys(diseaseCounts).length === 0 ? (
        <Text style={{ color: 'white', padding: 10 }}>
          No disease scan data yet.
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.analyticsRow}>
            {Object.entries(diseaseCounts).map(([disease, count]) => {
              const color = diseaseColors[disease] || diseaseColors['Unknown'];
              const icon = diseaseIcons[disease] || diseaseIcons['Unknown'];
              return (
                <TouchableOpacity
                  key={disease}
                  style={[styles.analyticsCard, { backgroundColor: color + '33' }]}
                  onPress={() =>
                    router.push({ pathname: '/result', params: { filter: disease } })
                  }
                >
                  <Text style={styles.diseaseIcon}>{icon}</Text>
                  <Text style={styles.analyticsText}>{disease}</Text>
                  <Text style={styles.analyticsCount}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
