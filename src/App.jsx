import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importe o Contexto de Autenticação
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Importe o Layout e as Páginas
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Processos from './pages/Processos';
import Inscritos from './pages/Inscritos';

export default function App() {
  return (
    <BrowserRouter>
      {/* O AuthProvider envolve tudo para gerenciar o login */}
      <AuthProvider>
        <Routes>
          
          {/* Rota Pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas (Só acessa se estiver logado) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="processos" element={<Processos />} />
              <Route path="inscritos" element={<Inscritos />} />
              <Route path="*" element={
                <div className="flex items-center justify-center h-full text-slate-400">
                  Página em construção
                </div>
              } />
            </Route>
          </Route>

          {/* Redireciona qualquer rota desconhecida para o login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}