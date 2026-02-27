import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    DEMO_USER,
    DEMO_PROFILE,
    demoCandidatos,
    demoProcessos,
    demoStats,
    demoFunnelData,
    mockControleVagas,
    demoAuditLogs,
} from '../demo/demoData';

const DemoContext = createContext(null);

const DEMO_SESSION_KEY = 'cps_demo_mode';

export function DemoProvider({ children }) {
    const [isDemoMode, setIsDemoMode] = useState(() => {
        return sessionStorage.getItem(DEMO_SESSION_KEY) === 'true';
    });

    // Dados em estado local para que CRUD demo funcione em memória
    const [candidatos, setCandidatos] = useState([...demoCandidatos]);
    const [processos, setProcessos] = useState([...demoProcessos]);

    const enterDemoMode = useCallback(() => {
        sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
        setCandidatos([...demoCandidatos]);
        setProcessos([...demoProcessos]);
        setIsDemoMode(true);
    }, []);

    const exitDemoMode = useCallback(() => {
        sessionStorage.removeItem(DEMO_SESSION_KEY);
        setIsDemoMode(false);
    }, []);

    // Operações CRUD apenas em memória (demo)
    const demoAddCandidato = useCallback((candidato) => {
        const newCand = { ...candidato, id: `cand-demo-${Date.now()}`, created_at: new Date().toISOString() };
        setCandidatos(prev => [newCand, ...prev]);
        return newCand;
    }, []);

    const demoUpdateCandidato = useCallback((id, updates) => {
        setCandidatos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }, []);

    const demoUpdateCandidatoStatus = useCallback((id, status) => {
        setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    }, []);

    const demoAddProcesso = useCallback((processo) => {
        const newProc = { ...processo, id: `proc-demo-${Date.now()}`, created_at: new Date().toISOString(), fase_atual: 'Planejamento', progresso: 0 };
        setProcessos(prev => [newProc, ...prev]);
        return newProc;
    }, []);

    const demoUpdateProcesso = useCallback((id, updates) => {
        setProcessos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const demoDeleteProcesso = useCallback((id) => {
        setProcessos(prev => prev.filter(p => p.id !== id));
    }, []);

    const demoDeleteCandidato = useCallback((id) => {
        setCandidatos(prev => prev.filter(c => c.id !== id));
    }, []);

    return (
        <DemoContext.Provider value={{
            isDemoMode,
            enterDemoMode,
            exitDemoMode,

            // Dados
            demoUser: DEMO_USER,
            demoProfile: DEMO_PROFILE,
            candidatos,
            processos,
            stats: demoStats,
            funnelData: demoFunnelData,
            vagas: mockControleVagas,
            auditLogs: demoAuditLogs,

            // CRUD
            demoAddCandidato,
            demoUpdateCandidato,
            demoUpdateCandidatoStatus,
            demoAddProcesso,
            demoUpdateProcesso,
            demoDeleteProcesso,
            demoDeleteCandidato,
        }}>
            {children}
        </DemoContext.Provider>
    );
}

export function useDemo() {
    return useContext(DemoContext);
}
