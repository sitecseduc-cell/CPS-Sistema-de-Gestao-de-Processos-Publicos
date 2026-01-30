import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Importe o hook

const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const { user } = useAuth(); // 2. Consuma o contexto

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />; // 3. Renderiza as rotas filhas
};

export default ProtectedRoute;