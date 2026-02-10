import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Sincronizando threads...",
    "Otimizando queries...",
    "Carregando módulos...",
    "Preparando interface...",
    "Quase lá..."
];

const ImmersiveLoader = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-violet-950/30">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Loader Container */}
            <div className="relative glass-card p-12 max-w-md text-center">
                {/* Hexagonal Spinner */}
                <div className="relative mx-auto mb-8 w-24 h-24">
                    <div className="absolute inset-0 animate-spin">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                                <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                                    <stop offset="50%" stopColor="rgb(139, 92, 246)" />
                                    <stop offset="100%" stopColor="rgb(16, 185, 129)" />
                                </linearGradient>
                            </defs>
                            <polygon
                                points="50,5 90,25 90,75 50,95 10,75 10,25"
                                fill="none"
                                stroke="url(#hexGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse"></div>
                    </div>
                </div>

                {/* Loading Message */}
                <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Carregando SITEC
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 animate-fadeIn" key={messageIndex}>
                        {loadingMessages[messageIndex]}
                    </p>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-indigo-500/50 animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImmersiveLoader;
