import React from 'react';
import { View, Text } from 'react-native';

const HistoryScreen = () => {
  return (
    <View className="flex-1 bg-black p-4">
      <Text className="text-white text-2xl font-bold">Scan History</Text>
      {/* TODO: Load from Supabase */}
    </View>
  );
};

export default HistoryScreen;
