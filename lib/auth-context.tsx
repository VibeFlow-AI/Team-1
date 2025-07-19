"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'MENTOR';
  hasProfile: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, role: 'STUDENT' | 'MENTOR') => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Ensure cookies are sent
      });
      
      console.log('📡 Auth response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User authenticated:', data.user);
        setUser(data.user);
      } else {
        console.log('❌ Authentication failed:', response.status);
        setUser(null);
      }
    } catch (error) {
      console.error('🚨 Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Ensure cookies are sent
      });

      const data = await response.json();
      console.log('📡 Login response:', response.status, data);

      if (response.ok) {
        setUser(data.user);
        console.log('✅ Login successful');
        return { success: true };
      } else {
        console.log('❌ Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (email: string, password: string, role: 'STUDENT' | 'MENTOR') => {
    try {
      console.log('📝 Attempting registration for:', email, role);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
        credentials: 'include', // Ensure cookies are sent
      });

      const data = await response.json();
      console.log('📡 Registration response:', response.status, data);

      if (response.ok) {
        // Set user state after successful registration
        setUser(data.user);
        console.log('✅ Registration successful');
        return { success: true, user: data.user };
      } else {
        console.log('❌ Registration failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('🚨 Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Attempting logout');
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
      });
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('🚨 Logout error:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider mounted, checking auth...');
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 