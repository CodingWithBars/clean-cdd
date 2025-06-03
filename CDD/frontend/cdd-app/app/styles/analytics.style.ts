import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  analyticsContainer: {
  paddingVertical: 12,
  paddingHorizontal: 10,
  backgroundColor: '#111827', // dark background
},

analyticsTitle: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 12,
},

analyticsRow: {
  flexDirection: 'row',
  gap: 5,
},

analyticsCard: {
  width: 80,
  height: 70,
  borderRadius: 16,
  padding: 10,
  justifyContent: 'space-between',
  alignItems: 'center',
  marginRight: 5,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
},

diseaseIcon: {
  fontSize: 16,
},

analyticsText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#FFF',
},

analyticsCount: {
  fontSize: 10,
  fontWeight: 'bold',
  color: '#FFF',
},

analyticsList: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
},
});

export default styles;
