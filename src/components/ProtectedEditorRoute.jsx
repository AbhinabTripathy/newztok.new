import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedEditorRoute = ({ children }) => {
  // Check for authentication token and editor role
  const hasToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const isEditor = userRole === 'editor';
  
  if (!hasToken || !isEditor) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

export default ProtectedEditorRoute; 