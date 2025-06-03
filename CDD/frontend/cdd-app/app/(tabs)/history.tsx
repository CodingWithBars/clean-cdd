import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import styles from '../styles/history.styles';
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
        setScans(res.data.reverse());
      } catch (err) {
        console.error('Failed to load scan history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  const initialRegion = scans.length > 0
    ? {
        latitude: scans[0].latitude,
        longitude: scans[0].longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }
    : {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 30,
        longitudeDelta: 30,
      };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Scan Locations</Text>

      <MapView style={styles.map} initialRegion={initialRegion}>
        {scans.map((scan, idx) => (
          <Marker
            key={idx}
            coordinate={{
              latitude: scan.latitude,
              longitude: scan.longitude,
            }}
            title={scan.disease}
            description={`Scanned: ${new Date(scan.timestamp).toLocaleString()}`}
          />
        ))}
      </MapView>

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
        style={{ marginTop: 12 }}
      />
    </View>
  );
}
