import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import styles from './styles/history.styles';
import { getScanHistory } from '@/utils/api';

type Scan = {
  disease: string;
  probability: number;
  latitude: number;
  longitude: number;
  timestamp: string;
};

export default function HistoryScreen() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScans = async () => {
      try {
        const res = await getScanHistory();
        setScans(res.data.reverse()); // latest first
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan History</Text>

      <FlatList
        data={scans}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.disease}>🐔 {item.disease}</Text>
            <Text>🧪 {Math.round(item.probability * 100)}%</Text>
            <Text>🕓 {new Date(item.timestamp).toLocaleString()}</Text>
            <Text>📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
          </View>
        )}
      />
    </View>
  );
}
