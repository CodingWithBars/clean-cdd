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
scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  locationText: {
    color: '#ccc',
    fontSize: 14,
  },
  mapContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },


});

export default styles;
