import axios from 'axios';
import { env } from '@/config/env';
import toast from 'react-hot-toast';
import { clearSession, getAccessToken } from '@/services/authStorage';

const httpRequest = axios.create({
  baseURL: `${env.API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

httpRequest.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url || '');

    if (status === 401 && !url.includes('/auth/google')) {
      clearSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Something went wrong';

    if (status !== 404 && status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default httpRequest;
