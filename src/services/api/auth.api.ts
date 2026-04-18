import httpRequest from './httpRequest';
import type { AuthResponse } from '@/types/auth';

export const signInWithGoogle = (id_token: string) =>
  httpRequest.post<{ success: boolean; data: AuthResponse }>('/auth/google', { id_token });

export const getMe = () =>
  httpRequest.get<{ success: boolean; data: AuthResponse['user'] }>('/auth/me');
