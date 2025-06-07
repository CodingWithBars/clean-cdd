// VerifyEmailModal.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

const VerifyEmailModal = ({ onVerified }) => {
  const [checking, setChecking] = useState(false);

  const checkVerification = async () => {
    setChecking(true);
    const { data, error } = await supabase.auth.getUser();
    setChecking(false);

    if (error) {
      console.error(error);
      return;
    }

    if (data?.user?.email_confirmed_at) {
      onVerified();
    } else {
      alert('Email not verified yet. Please confirm it in your inbox.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>A verification email has been sent.</Text>
      <Text style={styles.text}>Please confirm your email and click below.</Text>
      <Button title="I've Verified My Email" onPress={checkVerification} disabled={checking} />
      {checking && <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    padding: 20,
  },
  text: {
    color: '#fff',
    marginBottom: 15,
  },
});

export default VerifyEmailModal;
