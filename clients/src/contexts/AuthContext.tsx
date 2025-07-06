import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { showConfirmDialog, showSuccessAlert } from '../utils/sweetAlert';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) => Promise<void>;
  logout: () => void;
  logoutWithConfirmation: () => Promise<void>;
  isAuthenticated: boolean;
  onLoginSuccess?: (userId: string) => void;
  setOnLoginSuccess: (callback: (userId: string) => void) => void;
  onRegisterSuccess?: (userId: string) => void;
  setOnRegisterSuccess: (callback: (userId: string) => void) => void;
}

interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onLoginSuccess, setOnLoginSuccess] = useState<((userId: string) => void) | undefined>(undefined);
  const [onRegisterSuccess, setOnRegisterSuccess] = useState<((userId: string) => void) | undefined>(undefined);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Preserve cart for existing logged-in user
        localStorage.setItem('edulms_cart_preserve', 'true');
        // Call login success callback if set
        if (onLoginSuccess) {
          onLoginSuccess(userData.id);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [onLoginSuccess]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = (response.data as LoginResponse).data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      // Preserve cart for logged-in user
      localStorage.setItem('edulms_cart_preserve', 'true');
      // Call login success callback if set
      if (onLoginSuccess) {
        onLoginSuccess(userData.id);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string; role: string }) => {
    try {
      await authAPI.register(userData);
      // Registration successful - call register success callback if set
      if (onRegisterSuccess) {
        // Note: We don't have the user ID yet since registration doesn't return it
        // We'll need to handle this differently - maybe by storing a flag to merge cart on first login
        localStorage.setItem('edulms_merge_cart_on_login', 'true');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    // Preserve cart for guest users
    localStorage.setItem('edulms_cart_preserve', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const logoutWithConfirmation = async () => {
    const result = await showConfirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      'Yes, Logout',
      'Cancel'
    );

    if (result.isConfirmed) {
      logout();
      showSuccessAlert('Logged Out', 'You have been successfully logged out.');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    logoutWithConfirmation,
    isAuthenticated: !!user,
    onLoginSuccess,
    setOnLoginSuccess,
    onRegisterSuccess,
    setOnRegisterSuccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 