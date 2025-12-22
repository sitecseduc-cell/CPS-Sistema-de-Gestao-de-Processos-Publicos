import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();

  // Se não tem usuário, manda pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se tem usuário, deixa passar (renderiza as rotas filhas)
  return <Outlet />;
}