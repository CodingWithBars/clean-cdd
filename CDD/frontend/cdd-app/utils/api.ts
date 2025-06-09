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

export async function uploadScan(formData) {
  const response = await axios.post(`${API_BASE}/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getScanLocations() {
  const response = await axios.get(`${API_BASE}/scans`);
  return response.data;
}