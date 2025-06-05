import axios from 'axios';

// TODO: Replace with your actual API URL or FastAPI server IP
const API_BASE = 'http://192.168.2.7:8080'; // Example: Local LAN IP

export async function getScanLocations() {
  const response = await axios.get(`${API_BASE}/scans`);
  return response.data;
}

export const uploadScan = async (formData: FormData) => {
  return await axios.post(`${API_BASE}/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getScanHistory = async () => {
  return await axios.get(`${API_BASE}/history`);
};
