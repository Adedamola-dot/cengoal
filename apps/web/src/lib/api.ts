import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// 🔥 FORCING THE PRODUCTION URL FOR TESTING
const baseURL = 'https://cengoal-api.onrender.com/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true, // Allows receiving the refreshToken cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});