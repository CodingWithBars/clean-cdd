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
    setShowModal(false); // Close modal after saving
  };

  const initials = (() => {
    const parts = userInfo?.name?.trim().split(' ') || [];
    const first = parts[0]?.charAt(0).toUpperCase() || '';
    const second = parts[1]?.charAt(0).toUpperCase() || '';
    return (first + second) || '?';
  })();

  const fullLocation = [
    userInfo?.municipality,
    userInfo?.region || 'Davao Region',
    userInfo?.barangay,
  ]
    .filter(Boolean)
    .join(', ');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#aaa" />
      </View>
    );
  }

  return (
    <>
      {userInfo ? (
        <View style={styles.userHeader}>
          <View style={styles.placeholderAvatar}>
            <Text style={styles.avatarInitial}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Welcome, {userInfo.name}</Text>
            <Text style={styles.locationText}>{fullLocation}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.iconButton}>
            <Feather name="edit-2" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
      ) : (
        // If no userInfo yet, show form directly
        <ProfileSetupForm onProfileSaved={handleProfileSaved} />
      )}

      {/* Modal for editing profile */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <ProfileSetupForm
            existingData={userInfo}          // 👈 pre-fill the form
            onCancel={() => setShowModal(false)}  // 👈 handle cancel without saving
            onProfileSaved={(data) => {
              setUserInfo(data);
              setShowModal(false);
            }}
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
  buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
  paddingHorizontal: 20,
},
cancelButton: {
  padding: 10,
  backgroundColor: '#444',
  borderRadius: 6,
},
saveButton: {
  padding: 10,
  backgroundColor: '#28a745',
  borderRadius: 6,
},
cancelText: {
  color: '#fff',
},
saveText: {
  color: '#fff',
  fontWeight: 'bold',
},

});

export default ProfileSection;
