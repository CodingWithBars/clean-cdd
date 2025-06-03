import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: height * 0.35,
    borderRadius: 10,
    marginTop: 8,
  },
  item: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  disease: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
