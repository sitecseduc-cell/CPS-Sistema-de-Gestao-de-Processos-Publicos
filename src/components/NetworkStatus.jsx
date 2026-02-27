import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export default function NetworkStatus() {
    const [stats, setStats] = useState({
        status: navigator.onLine ? 'online' : 'offline',
        quality: 'unknown', // good, medium, bad
        rtt: 0,
        downlink: 0
    });

    useEffect(() => {
        const updateNetworkStatus = () => {
            const isOnline = navigator.onLine;
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            const rtt = connection ? connection.rtt : 0;
            const downlink = connection ? connection.downlink : 0;

            // Determine Quality
            let quality = 'unknown';
            if (!isOnline) {
                quality = 'bad';
            } else if (rtt === 0 && downlink === 0) {
                // API not fully supported or unknown, assume good if online
                quality = 'good';
            } else if (rtt < 150 && downlink > 4) {
                quality = 'good';
            } else if (rtt < 300 && downlink > 1) {
                quality = 'medium';
            } else {
                quality = 'bad';
            }

            setStats({
                status: isOnline ? 'online' : 'offline',
                quality,
                rtt,
                downlink
            });
        };

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        navigator.connection?.addEventListener('change', updateNetworkStatus);

        // Initial check
        updateNetworkStatus();

        // Polling fallback
        const interval = setInterval(updateNetworkStatus, 5000);

        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
            navigator.connection?.removeEventListener('change', updateNetworkStatus);
            clearInterval(interval);
        };
    }, []);

    const getStatusColor = () => {
        switch (stats.quality) {
            case 'good': return 'text-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
            case 'medium': return 'text-amber-500 bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
            case 'bad': return 'text-red-500 bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
            default: return 'text-slate-400 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';
        }
    };

    const getStatusText = () => {
        if (stats.status === 'offline') return 'Sem Conexão';
        switch (stats.quality) {
            case 'good': return 'Conexão Boa';
            case 'medium': return 'Conexão Instável';
            case 'bad': return 'Conexão Ruim';
            default: return 'Conectado';
        }
    };

    const Icon = stats.status === 'offline' ? WifiOff : Wifi;

    return (
        <div className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-help ${getStatusColor()}`}>
            <Icon size={14} className={stats.quality === 'medium' || stats.quality === 'bad' ? 'animate-pulse' : ''} />
            <span className="text-xs font-bold hidden sm:block whitespace-nowrap">
                {getStatusText()}
            </span>

            {/* Hover Tooltip for Technical Details */}
            <div className="absolute top-full mt-2 right-0 w-48 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 transform translate-y-2 group-hover:translate-y-0">
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 space-y-1">
                    <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{stats.status.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Ping (RTT):</span>
                        <span className={stats.rtt > 300 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}>{stats.rtt}ms</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Downlink:</span>
                        <span className={stats.downlink < 1 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}>{stats.downlink} Mbps</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
