'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'VENDOR' | 'BUYER' | 'SUBADMIN';
  avatar?: string;
  profileImage?: string;
  city?: string;
  vendor?: any;
  admin?: any;
  phoneVerified?: boolean;
  emailVerified?: boolean;
}


interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User, noRedirect?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (activeToken: string) => {
    try {
      const data = await apiFetch('/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      setUser(data.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only logout if error is not token expired (which apiFetch handles by redirecting)
      if (error instanceof Error && error.message !== 'TOKEN_EXPIRED' && error.message !== 'Session expired. Please login again.') {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string, userData: User, noRedirect: boolean = false) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);

    if (noRedirect) return;

    // Check for redirect URL
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      // Redirect based on role
      if (userData.role === 'SUPERADMIN') router.push('/b2b-india/super-admin/dashboard');
      else if (userData.role === 'ADMIN' || userData.role === 'SUBADMIN') router.push(`/b2b-india/${userData.role.toLowerCase()}/dashboard`);
      else if (userData.role === 'VENDOR') router.push('/vendor/dashboard');
      else router.push('/');
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err);
    }

    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    if (token) await fetchUserData(token);
  };

  const hasPermission = (permissionString: string) => {
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true;
    if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
      const permissions = user.admin?.permissions || [];
      const moduleName = permissionString.split('_')[0];
      return permissions.includes(permissionString) ||
        permissions.includes(`${moduleName}_all`) ||
        permissions.includes('all');
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
