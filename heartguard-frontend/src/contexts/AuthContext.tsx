/**
 * AuthContext - Global authentication state
 * Manages user session, login, logout, and registration
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser, verifySession, RegisterData, LoginData } from '@/api/auth';

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        verifySession(storedToken).catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setToken(null);
          setUser(null);
        });
      } catch (err) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    const response = await loginUser(data);
    
    if (response.success && response.session_token) {
      const userData: User = {
        id: response.user_id!,
        email: response.email!
      };
      
      setToken(response.session_token);
      setUser(userData);
      
      localStorage.setItem('auth_token', response.session_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    const response = await registerUser(data);
    
    if (!response.success) {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutUser(token);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        loading
      }}
    >
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
