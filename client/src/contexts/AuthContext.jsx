import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Checking auth status, token exists:', !!token);
    
    if (token) {
      // Set user as authenticated if token exists
      setUser({ token });
      console.log('✅ User authenticated from localStorage');
    } else {
      console.log('❌ No token found, user not authenticated');
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
  try {
    setError(null);
    setLoading(true);
    
    const response = await api.post('/users/login', credentials);
    const { token, message } = response.data;
    console.log(token);
    // Store token first
    localStorage.setItem('token', token);
    
    // Then set user state
    setUser({ token });
    
    // Add a small delay to ensure token is properly stored
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, message };
  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Login failed';
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const register = async (userData) => {
    try {
      setError(null);
      console.log('📝 Attempting registration...');
      const response = await api.post('/users/register', userData);
      const { message, userId } = response.data;
      
      console.log('✅ Registration successful:', message);
      return { success: true, message, userId };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      console.error('❌ Registration failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
