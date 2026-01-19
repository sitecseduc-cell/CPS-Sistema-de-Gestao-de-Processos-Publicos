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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md overflow-hidden font-sans transition-all duration-500">

            {/* Subtle Gradient Backdrops */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center gap-8">

                {/* Modern Minimal Loader */}
                <div className="relative flex items-center justify-center p-6">
                    {/* Ring 1 */}
                    <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                    {/* Ring 2 (Spinner) */}
                    <div className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-600 dark:border-indigo-400/20 dark:border-t-indigo-400 rounded-full animate-spin"></div>

                    {/* Icon */}
                    <div className="relative z-10 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800">
                        <Hexagon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-900/30 animate-pulse" strokeWidth={2} />
                    </div>
                </div>

                {/* Typography */}
                <div className="text-center space-y-3">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                        Sistema de Gestão
                    </h2>

                    <div className="flex flex-col items-center gap-2">
                        <div className="h-5 overflow-hidden flex flex-col items-center w-64">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider animate-fadeIn key={message}">
                                {message}
                            </span>
                        </div>
                        {/* Minimal Progress Bar */}
                        <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 animate-[loading_1.5s_ease-in-out_infinite] w-full origin-left-right"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
