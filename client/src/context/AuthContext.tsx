import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string; role?: Role }) => Promise<User>;
  signup: (data: { fullName: string; email: string; password: string; role?: Role }) => Promise<User>;
  logout: () => Promise<void>;
  getDefaultRouteForRole: (role: Role) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getDefaultRouteForRole = (role: Role): string => {
    switch (role) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'SUBJECT_TEACHER':
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'CLASS_TEACHER':
        return '/class/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    async function initAuth() {
      const token =
        localStorage.getItem('smartbro_token') || localStorage.getItem('eduwatch_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.me();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          localStorage.removeItem('smartbro_token');
          localStorage.removeItem('eduwatch_token');
        }
      } catch (err) {
        localStorage.removeItem('smartbro_token');
        localStorage.removeItem('eduwatch_token');
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string; role?: Role }): Promise<User> => {
    const response = await api.auth.login(credentials);
    if (response.success && response.user) {
      localStorage.setItem('smartbro_token', response.token);
      localStorage.setItem('eduwatch_token', response.token);
      setUser(response.user);
      return response.user;
    }
    throw new Error('Login failed: invalid credentials response.');
  };

  const signup = async (data: { fullName: string; email: string; password: string; role?: Role }): Promise<User> => {
    const response = await api.auth.signup(data);
    if (response.success && response.user) {
      localStorage.setItem('smartbro_token', response.token);
      localStorage.setItem('eduwatch_token', response.token);
      setUser(response.user);
      return response.user;
    }
    throw new Error('Registration failed: invalid response.');
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Continue cleanup
    } finally {
      localStorage.removeItem('smartbro_token');
      localStorage.removeItem('eduwatch_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        getDefaultRouteForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
