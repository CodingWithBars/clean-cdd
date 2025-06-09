import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileSetupForm from './ProfileSetupForm';
import { Feather } from '@expo/vector-icons';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  const first = parts[0]?.charAt(0).toUpperCase() || '';
  const second = parts[1]?.charAt(0).toUpperCase() || '';
  return first + second || '?';
};

const getFullLocation = (user) => {
  return [
    user?.municipality,
    user?.region || 'Davao Oriental',
    user?.barangay,
  ].filter(Boolean).join(', ');
};

const ProfileSection = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userInfo');
        if (storedUser) {
          setUserInfo(JSON.parse(storedUser));
        } else {
          setShowModal(true);
        }
      } catch (error) {
        console.log('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleProfileSaved = (data) => {
    setUserInfo(data);
    setShowModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#aaa" />
      </View>
    );
  }

  return (
    <>
      {userInfo && (
        <View style={styles.userHeader}>
          <View style={styles.placeholderAvatar}>
            <Text style={styles.avatarInitial}>{getInitials(userInfo.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Welcome, {userInfo.name}</Text>
            <Text style={styles.locationText}>{getFullLocation(userInfo)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={styles.iconButton}
            accessibilityLabel="Edit Profile"
          >
            <Feather name="edit-2" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
            accessibilityLabel="Close Profile Setup"
          >
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <ProfileSetupForm
            existingData={userInfo}
            onCancel={() => setShowModal(false)}
            onProfileSaved={handleProfileSaved}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  placeholderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  locationText: {
    color: '#aaa',
    fontSize: 14,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
  },
});

export default ProfileSection;
