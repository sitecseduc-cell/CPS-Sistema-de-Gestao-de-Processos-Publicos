import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginComponent from './pages/auth/Login';
import RegisterComponent from './pages/auth/Register';
import ForgotPasswordComponent from './pages/auth/ForgotPassword';
import DashboardPage from './pages/dashboard/DashboardPage'; // Importe o Wrapper corrigido
import ProtectedRoute from './router/ProtectedRoute';

// PublicRoute Component
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const { isLoadingAuth } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  if (isLoadingAuth) return null;

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
            <LoginComponent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
            <RegisterComponent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
            <ForgotPasswordComponent darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </PublicRoute>
      } />

      {/* Rota Protegida Principal */}
      <Route path="/dashboard/*" element={<ProtectedRoute />}>
        {/* Aqui chamamos o DashboardPage, que contém as sub-rotas e os DADOS */}
        <Route path="*" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
