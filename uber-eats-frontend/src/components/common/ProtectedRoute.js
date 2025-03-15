import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { isAuthenticated, userType } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user types are specified and current user type is not allowed, redirect
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;