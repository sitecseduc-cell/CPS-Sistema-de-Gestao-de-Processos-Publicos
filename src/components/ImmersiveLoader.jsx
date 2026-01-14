import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Hexagon } from 'lucide-react';

const MESSAGES = [
    "Sincronizando threads assíncronas...",
    "Otimizando queries do banco de dados...",
    "Estabelecendo handshake seguro (TLS)...",
    "Compilando assets em tempo real...",
    "Verificando integridade de checksums...",
    "Hidratando árvore de componentes...",
    "Indexando metadados do sistema...",
    "Inicializando protocolos de rede..."
];

export default function ImmersiveLoader() {
    const [message, setMessage] = useState(MESSAGES[0]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Cycle messages every 2.5s
        const messsageInterval = setInterval(() => {
            setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
        }, 2500);

        // Fake progress bar
        const progressInterval = setInterval(() => {
            setProgress(old => {
                if (old >= 100) return 0;
                return old + 1; // slow increment
            });
        }, 50);

        return () => {
            clearInterval(messsageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">

            {/* Background Aurora */}
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-fuchsia-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Main Loader Container */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Animated Logo (Professional Icon) */}
                <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
                    {/* Pulsing Outer Glow */}
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>

                    {/* Rotating Rings */}
                    <div className="absolute inset-0 border border-slate-200 dark:border-slate-700/50 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 border border-slate-300 dark:border-slate-600/30 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>

                    {/* Thin Progress Ring Effect */}
                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg] p-1">
                        <circle
                            cx="50%" cy="50%" r="48%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="100 200"
                            className="text-indigo-500/30 animate-[spin_3s_linear_infinite]"
                        />
                    </svg>

                    {/* The Professional Icon */}
                    <div className="relative z-10 animate-float flex flex-col items-center justify-center">
                        <Hexagon
                            strokeWidth={1.5}
                            className="w-16 h-16 text-indigo-600 dark:text-indigo-400 drop-shadow-lg fill-indigo-500/5"
                        />
                    </div>
                </div>

                {/* Text & Message */}
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400 mb-4 tracking-tight animate-fadeIn">
                    CPS - Sistema de Gestão
                </h2>

                <div className="h-6 overflow-hidden relative w-80 text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-slideInRight key={message}">
                        {message}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]"
                        style={{ width: '100%' }} // Indeterminate for now, or use progress state
                    ></div>
                </div>

            </div>



            {/* Footer Hint */}
            <div className="absolute bottom-8 text-xs text-slate-400 animate-pulse">
                Preparando sua experiência...
            </div>

        </div>,
        document.body
    );
}
