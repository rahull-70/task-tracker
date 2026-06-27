'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface AuthUser {
  id: string;
  codename: string;
  email: string;
  isPremium: boolean;
  premiumSince?: string | null;
  createdAt?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    codename: string,
    email: string,
    password: string,
  ) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const checkSession = async () => {
    try {
      // credentials: 'include' ensures the auth_token cookie is always sent
      const res = await fetch('/api/auth/session', {
        credentials: 'include',
        cache: 'no-store',
      });

      // Session route always returns 200 — check for user in body
      const data = await res.json();

      if (data?.user?.id) {
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Login failed.' };

      // Cookie is now set — re-check session to sync state
      await checkSession();
      return {};
    } catch {
      return { error: 'Network error. Try again.' };
    }
  };

  const register = async (
    codename: string,
    email: string,
    password: string,
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ codename, email, password }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Registration failed.' };

      await checkSession();
      return {};
    } catch {
      return { error: 'Network error. Try again.' };
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Reset failed.' };
      return {};
    } catch {
      return { error: 'Network error. Try again.' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    setIsLoggedIn(false);
  };

  const refreshUser = async () => {
    await checkSession();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        login,
        register,
        resetPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};