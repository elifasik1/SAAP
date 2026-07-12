import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../services/api';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!api.isAuthenticated()) {
      setUser(null);
      return;
    }
    const profile = await api.getMe();
    setUser(profile);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        if (api.isAuthenticated()) {
          await refreshProfile();
        }
      } catch {
        api.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    await refreshProfile();
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    await api.register(data);
  };

  const logout = () => {
    api.logout();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user && api.isAuthenticated(),
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
