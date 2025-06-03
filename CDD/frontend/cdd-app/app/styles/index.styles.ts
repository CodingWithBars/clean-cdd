import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop:50,
    backgroundColor: '#121212',
    zIndex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  welcome: {
    fontSize: 14,
    color: '#6b7280',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  screen: {
  flex: 1,
  backgroundColor: '#121212',
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#121212',
},
locationMap: {
  flex: 1,
  width: '100%',
  height: '100%',
},
analyticsContainer: {
  padding: 16,
  backgroundColor: '#fff',
},
analyticsTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 12,
},
analyticsList: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
},
analyticsCard: {
  alignItems: 'center',
  padding: 12,
  borderRadius: 12,
  margin: 6,
  width: 100,
},
diseaseIcon: {
  fontSize: 24,
  marginBottom: 4,
},
analyticsText: {
  fontSize: 14,
  fontWeight: '600',
},
analyticsCount: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
},


});

export default styles;
