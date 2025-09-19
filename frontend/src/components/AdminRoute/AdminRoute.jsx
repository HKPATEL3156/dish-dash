// src/components/AdminRoute/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const isAuthenticated = Boolean(localStorage.getItem('authToken'));
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.role === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;