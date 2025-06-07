import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';

const AuthFlowScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [checkingSession, setCheckingSession] = useState(true);

  // 🧠 Skip screen if user already has a session
  useEffect(() => {
    let didComplete = false;

    const checkInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && !didComplete) {
        didComplete = true;
        onComplete(); // Skip OTP screen entirely
      } else {
        setCheckingSession(false); // Show login UI
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !didComplete) {
        didComplete = true;
        onComplete(); // Trigger once when session is valid
      }
    });

    checkInitialSession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Countdown for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');

    // Check for an active session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      onComplete(); // Session exists; skip sending OTP
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: '', // Optional: you can set your deep link here if needed
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
      setResendTimer(30);
    }

    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      setError(error.message);
    }

    // Success will auto trigger onAuthStateChange → onComplete
    setLoading(false);
  };

  if (checkingSession) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Chicken Disease Detector</Text>

        {!otpSent ? (
          <>
            <Text style={styles.label}>Enter your email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, (loading || !email) && styles.buttonDisabled]}
              disabled={loading || !email}
              onPress={handleSendOtp}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter the 6-digit OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, (loading || otp.length !== 6) && styles.buttonDisabled]}
              disabled={loading || otp.length !== 6}
              onPress={handleVerifyOtp}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendContainer}
              onPress={handleSendOtp}
              disabled={resendTimer > 0}
              activeOpacity={resendTimer > 0 ? 1 : 0.6}
            >
              <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}; 

export default AuthFlowScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 24,
  },
  splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  title: {
    fontSize: 28,
    color: '#4ECDC4',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 1,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    fontSize: 18,
    marginBottom: 24,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#3a8a84',
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 1,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#4ECDC4',
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#666',
    textDecorationLine: 'none',
  },
  error: {
    marginTop: 20,
    color: '#FF5A5F',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
});
