import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, logout } from '../services/auth';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // State for auth data
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        // Use getCurrentUser to check auth status
        const response = await getCurrentUser();
        
        if (response && response.data) {
          handleLoginSuccess(response.data, response.data.type);
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Helper to clear auth state
  const clearAuthState = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserType(null);
  };

  // Handle successful login
  const handleLoginSuccess = (userData, type) => {
    setCurrentUser(userData);
    setUserType(type);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      clearAuthState();
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      
      // Even if API fails, clear session on client-side
      clearAuthState();
    }
  };

  // Check if user is a customer
  const isCustomer = userType === 'customer';
  
  // Check if user is a restaurant
  const isRestaurant = userType === 'restaurant';

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    userType,
    isCustomer,
    isRestaurant,
    handleLoginSuccess,
    handleLogout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};