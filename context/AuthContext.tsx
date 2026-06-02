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
      const res = await fetch('/api/auth/session');

      if (!res.ok) {
        setUser(null);
        setIsLoggedIn(false);
        return;
      }

      const data = await res.json();

      if (data?.user) {
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Login failed.' };

      // Cookie is set by the route; now fetch the full session
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
    await fetch('/api/auth/logout', { method: 'POST' });
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
