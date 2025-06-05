import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileSection = () => {
  const [userInfo, setUserInfo] = useState(null);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userInfo');
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (!userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#aaa' }}>Loading user info...</Text>
      </View>
    );
  }

  const fullLocation = [userInfo.barangay, userInfo.municipality]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.userHeader}>
      {userInfo.imageUri ? (
        <Image source={{ uri: userInfo.imageUri }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholderAvatar}>
          <Text style={styles.avatarInitial}>
            {userInfo.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View>
        <Text style={styles.welcomeText}>
          Welcome, {userInfo.name || 'User'}
        </Text>
        <Text style={styles.locationText}>{fullLocation || 'Unknown Location'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  placeholderAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarInitial: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
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
  loadingContainer: {
    marginTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});

export default ProfileSection;
