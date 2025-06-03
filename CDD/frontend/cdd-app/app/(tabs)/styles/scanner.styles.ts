import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  preview: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginVertical: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default styles;
