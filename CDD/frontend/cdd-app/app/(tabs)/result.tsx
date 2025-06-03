import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import styles from './styles/result.styes';

export default function ResultScreen() {
  const { disease, probability, latitude, longitude } = useLocalSearchParams<{
    disease: string;
    probability: string;
    latitude?: string;
    longitude?: string;
  }>();

  const parsedLat = latitude ? parseFloat(latitude) : 0;
  const parsedLong = longitude ? parseFloat(longitude) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prediction Result</Text>
      <Text style={styles.label}>Disease: <Text style={styles.value}>{disease}</Text></Text>
      <Text style={styles.label}>Probability: <Text style={styles.value}>{(parseFloat(probability) * 100).toFixed(2)}%</Text></Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: parsedLat,
          longitude: parsedLong,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: parsedLat, longitude: parsedLong }}
          title="Scan Location"
          description={disease}
        />
      </MapView>
    </View>
  );
}
