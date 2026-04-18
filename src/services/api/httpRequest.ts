import axios from 'axios';
import { env } from '@/config/env';
import toast from 'react-hot-toast';

const httpRequest = axios.create({
  baseURL: `${env.API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

httpRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Something went wrong';

    if (error.response?.status !== 404) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default httpRequest;
