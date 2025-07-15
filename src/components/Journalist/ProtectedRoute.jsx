import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check for authentication token and journalist role
  const hasToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const isJournalist = userRole === 'journalist';
  
  if (!hasToken || !isJournalist) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 