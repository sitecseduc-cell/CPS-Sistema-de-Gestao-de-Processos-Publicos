import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Layout e Páginas
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Processos from './pages/Processos';
import Inscritos from './pages/Inscritos';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          <Route index element={<Dashboard />} />
          <Route path="processos" element={<Processos />} />
          <Route path="inscritos" element={<Inscritos />} />
          
          {/* Rota para páginas não implementadas ainda */}
          <Route path="*" element={<div className="flex items-center justify-center h-full text-slate-400">Página em construção</div>} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}