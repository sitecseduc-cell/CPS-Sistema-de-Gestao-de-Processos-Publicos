import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, WifiLow, Activity, Signal } from 'lucide-react';

// Mede latência real via fetch de um recurso pequeno
async function measureLatency() {
    try {
        const start = performance.now();
        await fetch('/favicon.ico?_=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
        return Math.round(performance.now() - start);
    } catch {
        return null; // offline
    }
}

export default function NetworkStatus() {
    const [stats, setStats] = useState({
        status: navigator.onLine ? 'online' : 'offline',
        quality: 'loading',
        rtt: null,
        downlink: null,
    });
    const intervalRef = useRef(null);

    const updateStatus = async () => {
        const isOnline = navigator.onLine;
        if (!isOnline) {
            setStats({ status: 'offline', quality: 'bad', rtt: null, downlink: null });
            return;
        }

        // Latência medida diretamente
        const measuredRtt = await measureLatency();
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const apiRtt = connection?.rtt ?? 0;
        const downlink = connection?.downlink ?? 0;

        // Usa latência medida se disponível, senão usa API
        const rtt = measuredRtt !== null ? measuredRtt : apiRtt;

        let quality;
        if (measuredRtt === null) {
            quality = 'bad';
        } else if (rtt < 120) {
            quality = 'excellent';
        } else if (rtt < 300) {
            quality = 'good';
        } else if (rtt < 700) {
            quality = 'medium';
        } else {
            quality = 'bad';
        }

        setStats({ status: 'online', quality, rtt, downlink });
    };

    useEffect(() => {
        updateStatus();
        intervalRef.current = setInterval(updateStatus, 15000); // a cada 15s

        const onOnline = () => updateStatus();
        const onOffline = () => setStats(s => ({ ...s, status: 'offline', quality: 'bad', rtt: null }));

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        navigator.connection?.addEventListener('change', updateStatus);

        return () => {
            clearInterval(intervalRef.current);
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            navigator.connection?.removeEventListener('change', updateStatus);
        };
    }, []);

    const CONFIG = {
        excellent: {
            label: 'Excelente',
            pill: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
            dot: 'bg-emerald-500',
            Icon: Wifi,
            pulse: false,
        },
        good: {
            label: 'Boa',
            pill: 'text-emerald-500 bg-emerald-50/60 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
            dot: 'bg-emerald-400',
            Icon: Wifi,
            pulse: false,
        },
        medium: {
            label: 'Instável',
            pill: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
            dot: 'bg-amber-500',
            Icon: WifiLow,
            pulse: true,
        },
        bad: {
            label: 'Ruim',
            pill: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
            dot: 'bg-red-500',
            Icon: WifiOff,
            pulse: true,
        },
        loading: {
            label: 'Verificando',
            pill: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10',
            dot: 'bg-slate-400',
            Icon: Activity,
            pulse: true,
        },
    };

    const cfg = stats.status === 'offline' ? CONFIG.bad : (CONFIG[stats.quality] || CONFIG.loading);
    const { Icon, label, pill, dot, pulse } = cfg;

    const rttLabel = stats.rtt !== null ? `${stats.rtt} ms` : '—';
    const downlinkLabel = stats.downlink ? `${stats.downlink} Mbps` : '—';

    return (
        <div className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-help transition-all select-none ${pill}`}>
            {/* Indicador de qualidade (ponto animado) */}
            <span className={`w-2 h-2 rounded-full shrink-0 ${dot} ${pulse ? 'animate-pulse' : ''}`} />
            <Icon size={13} className="shrink-0" />
            <span className="text-xs font-bold hidden sm:block whitespace-nowrap">
                {stats.status === 'offline' ? 'Sem conexão' : `Rede ${label}`}
            </span>

            {/* Tooltip hover */}
            <div className="absolute top-full mt-2.5 right-0 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none z-[99] transition-all duration-200 translate-y-1 group-hover:translate-y-0 overflow-hidden">
                {/* Header */}
                <div className={`px-4 py-2.5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 ${pill}`}>
                    <Icon size={14} />
                    <span className="text-xs font-bold">
                        {stats.status === 'offline' ? 'Sem conexão com a internet' : `Sinal de rede ${label.toLowerCase()}`}
                    </span>
                </div>
                {/* Métricas */}
                <div className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Latência (ping)</span>
                        <span className={`text-xs font-black tabular-nums ${stats.rtt !== null && stats.rtt > 500 ? 'text-red-500' : stats.rtt !== null && stats.rtt > 250 ? 'text-amber-500' : 'text-slate-700 dark:text-white'}`}>
                            {rttLabel}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Velocidade est.</span>
                        <span className="text-xs font-black tabular-nums text-slate-700 dark:text-white">{downlinkLabel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                        <span className="text-xs font-black text-slate-700 dark:text-white uppercase">{stats.status}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
