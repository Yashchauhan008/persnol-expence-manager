import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@/types/auth';
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  saveSession,
  type StoredUser,
} from '@/services/authStorage';
import * as authApi from '@/services/api/auth.api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(() => {
    const u = getStoredUser();
    return u ? { ...u } : null;
  });
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  const signInWithGoogleIdToken = useCallback(
    async (idToken: string) => {
      const res = await authApi.signInWithGoogle(idToken);
      const { token: t, user: u } = res.data.data;
      queryClient.clear();
      saveSession(t, u as StoredUser);
      setToken(t);
      setUser(u);
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    queryClient.clear();
    clearSession();
    setToken(null);
    setUser(null);
    window.google?.accounts.id.cancel();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      signInWithGoogleIdToken,
      logout,
    }),
    [user, token, signInWithGoogleIdToken, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
