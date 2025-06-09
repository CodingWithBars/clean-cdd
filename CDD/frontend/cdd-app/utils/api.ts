import axios from 'axios';
import Constants from 'expo-constants';

// TODO: Replace with your actual API URL or FastAPI server IP
// const API_BASE = 'https://4090-2001-4455-6f3-a00-dd29-7ce8-1951-677.ngrok-free.app'; // Example: Local LAN IP

const API_BASE =
  Constants.expoConfig?.extra?.API_BASE_URL ||
  Constants.manifest?.extra?.API_BASE_URL ||
  'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getScanLocations() {
  try {
    const response = await api.get('/scans');
    return response.data;
  } catch (error) {
    console.error('Error fetching scan locations:', error);
    throw error;
  }
}

export async function getScanHistory() {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching scan history:', error);
    throw error;
  }
}

export async function uploadScan(formData) {
  try {
    const response = await axios.post(`${API_BASE}/predict`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading scan:', error);
    throw error;
  }
}
