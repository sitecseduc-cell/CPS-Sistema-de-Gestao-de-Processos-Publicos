import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider } from './contexts/AuthContext';
import { DemoProvider } from './contexts/DemoContext';
import ProtectedRoute from './components/ProtectedRoute';

const Layout = React.lazy(() => import('./components/Layout'));
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Processos = React.lazy(() => import('./pages/Processos'));
const Inscritos = React.lazy(() => import('./pages/Inscritos'));
const Kanban = React.lazy(() => import('./pages/Kanban'));
const Convocacao = React.lazy(() => import('./pages/Convocacao'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const ControleVagas = React.lazy(() => import('./pages/ControleVagas'));
const Auditoria = React.lazy(() => import('./pages/Auditoria'));
const PesquisaCandidatos = React.lazy(() => import('./pages/PesquisaCandidatos'));
const QuantidadeInscritos = React.lazy(() => import('./pages/QuantidadeInscritos'));
const PreAvaliacao = React.lazy(() => import('./pages/PreAvaliacao'));
const Relatorios = React.lazy(() => import('./pages/Relatorios'));
const Seguranca = React.lazy(() => import('./pages/Seguranca'));

// --- IMPORTANTES ROTAS DE CONVOCAÇÃO ---
const VagasEspeciais = React.lazy(() => import('./pages/VagasEspeciais'));
const GestaoConvocacaoEspecial = React.lazy(() => import('./pages/GestaoConvocacaoEspecial'));
const Planejamento = React.lazy(() => import('./pages/Planejamento'));
const Lotacao = React.lazy(() => import('./pages/Lotacao'));
const UpdatePassword = React.lazy(() => import('./pages/UpdatePassword'));
const AdminPerfis = React.lazy(() => import('./pages/AdminPerfis'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const PublicCandidateSearch = React.lazy(() => import('./pages/PublicCandidateSearch'));

import TryBoundary from './components/TryBoundary';
import ImmersiveLoader from './components/ImmersiveLoader';


export default function App() {
    return (
        <TryBoundary>
            <DemoProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <React.Suspense fallback={
                            <ImmersiveLoader />
                        }>
                            <Routes>

                                <Route path="/login" element={<Login />} />
                                <Route path="/consulta-publica" element={<PublicCandidateSearch />} />
                                <Route path="/update-password" element={<UpdatePassword />} />

                                <Route element={<ProtectedRoute />}>
                                    <Route path="/" element={<Layout />}>
                                        <Route index element={<Dashboard />} />
                                        <Route path="planejamento" element={<Planejamento />} />
                                        <Route path="processos" element={<Processos />} />
                                        <Route path="lotacao" element={<Lotacao />} />
                                        <Route path="vagas" element={<ControleVagas />} />
                                        <Route path="inscritos" element={<Inscritos />} />
                                        <Route path="convocacao" element={<Convocacao />} />

                                        {/* --- ROTAS DE VAGAS/CONVOCAÇÕES --- */}
                                        <Route path="vagas-especiais" element={<VagasEspeciais />} />
                                        <Route path="convocacoes-especiais" element={<GestaoConvocacaoEspecial />} />
                                        <Route path="notificacoes" element={<Notifications />} />

                                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                            <Route path="admin/perfis" element={<AdminPerfis />} />
                                        </Route>
                                        {/* ------------------------------------ */}

                                        <Route path="pesquisa" element={<PesquisaCandidatos />} />
                                        <Route path="qtd" element={<QuantidadeInscritos />} />
                                        <Route path="pre" element={<PreAvaliacao />} />

                                        <Route path="workflow" element={<Kanban />} />
                                        <Route path="auditoria" element={<Auditoria />} />
                                        <Route path="relatorios" element={<Relatorios />} />
                                        <Route path="seguranca" element={<Seguranca />} />

                                        <Route path="*" element={<NotFound />} />
                                    </Route>
                                </Route>

                                <Route path="*" element={<Navigate to="/login" replace />} />

                            </Routes>
                            <Toaster richColors position="top-right" />
                        </React.Suspense>
                    </AuthProvider>
                </BrowserRouter>
            </DemoProvider>
        </TryBoundary>
    );
}
