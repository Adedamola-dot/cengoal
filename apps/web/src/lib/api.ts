import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Use the environment variable from Vercel, fallback to local for development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true, 
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