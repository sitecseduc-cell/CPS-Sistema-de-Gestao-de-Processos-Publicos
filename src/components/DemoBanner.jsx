import React from 'react';
import { FlaskConical, X, LogOut } from 'lucide-react';
import { useDemo } from '../contexts/DemoContext';
import { useNavigate } from 'react-router-dom';

export default function DemoBanner() {
    const { isDemoMode, exitDemoMode } = useDemo();
    const navigate = useNavigate();

    if (!isDemoMode) return null;

    const handleExit = () => {
        exitDemoMode();
        navigate('/login');
    };

    return (
        <div className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 text-white py-2.5 px-4 flex items-center justify-between gap-3 z-[999] shadow-lg shadow-amber-400/30 animate-fadeIn">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="flex-shrink-0 bg-white/20 rounded-full p-1">
                    <FlaskConical size={14} className="text-white" />
                </span>
                <p className="text-xs font-bold uppercase tracking-wider truncate">
                    ⚠️ Ambiente de Homologação — Dados fictícios para revisão técnica. Nenhuma alteração real é salva.
                </p>
            </div>
            <button
                onClick={handleExit}
                title="Sair do modo demo"
                className="flex-shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
            >
                <LogOut size={12} />
                Sair do Demo
            </button>
        </div>
    );
}
