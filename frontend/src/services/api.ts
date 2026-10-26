
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== 'undefined' && localStorage.getItem('kurio_token')) {
      localStorage.removeItem('kurio_token');
      window.dispatchEvent(new Event('kurio:session-expired'));
    }
    return Promise.reject(error);
  },
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kurio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
