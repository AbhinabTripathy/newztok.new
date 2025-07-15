import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const isAuthenticated = localStorage.getItem('journalistAuth') === 'true' || 
                         sessionStorage.getItem('journalistAuth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

export default AuthGuard; 