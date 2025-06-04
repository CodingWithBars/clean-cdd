import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const VerifyEmailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};

  return (
    <View className="flex-1 items-center justify-center bg-gray-900 px-6">
      <Ionicons name="mail-unread-outline" size={72} color="#38bdf8" />
      
      <Text className="text-white text-2xl font-bold mt-6 mb-2">
        Verify Your Email
      </Text>

      <Text className="text-gray-300 text-center mb-8">
        A confirmation link has been sent to
        <Text className="text-sky-400"> {email} </Text>
        Please check your inbox and click the link to complete registration.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        className="bg-sky-500 px-6 py-3 rounded-2xl shadow-md"
      >
        <Text className="text-white font-semibold text-base">
          Go to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyEmailScreen;
