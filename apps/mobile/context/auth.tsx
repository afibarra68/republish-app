import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api } from '../lib/api';

export interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, username: string, displayName: string) => {
      const res = await api<{ accessToken: string; user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username, displayName }),
      });
      setToken(res.accessToken);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
