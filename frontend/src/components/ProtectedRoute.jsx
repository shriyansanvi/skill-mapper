import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { token } = useAuth();

  // If there's a token, show the nested page (Outlet)
  // Otherwise, redirect to the /login page
  return token ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;