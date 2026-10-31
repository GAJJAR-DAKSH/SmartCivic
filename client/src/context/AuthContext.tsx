import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<User>;
  loginWithGoogle: (data?: { email?: string; name?: string }) => Promise<User>;
  quickLogin: (persona: 'admin' | 'officer' | 'supervisor' | 'worker' | 'citizen' | 'officer_water' | 'officer_elec') => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('smartcivic_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('smartcivic_token');
      const storedUser = localStorage.getItem('smartcivic_user');
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const fresh = await api.getMe();
          setUser(fresh);
          localStorage.setItem('smartcivic_user', JSON.stringify(fresh));
        } catch (e) {
          console.warn('Token validation failed, clearing session', e);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (username: string, password = 'pass123'): Promise<User> => {
    const res = await api.login(username, password);
    setToken(res.access);
    setUser(res.user);
    localStorage.setItem('smartcivic_token', res.access);
    localStorage.setItem('smartcivic_user', JSON.stringify(res.user));
    return res.user;
  };

  const loginWithGoogle = async (data?: { email?: string; name?: string }): Promise<User> => {
    const res = await api.googleLogin(data);
    setToken(res.access);
    setUser(res.user);
    localStorage.setItem('smartcivic_token', res.access);
    localStorage.setItem('smartcivic_user', JSON.stringify(res.user));
    return res.user;
  };

  const quickLogin = async (persona: 'admin' | 'officer' | 'supervisor' | 'worker' | 'citizen' | 'officer_water' | 'officer_elec') => {
    return login(persona, 'pass123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartcivic_token');
    localStorage.removeItem('smartcivic_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithGoogle,
        quickLogin,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

