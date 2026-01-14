import React from 'react';

export default function ChartSkeleton() {
    return (
        <div className="lg:col-span-2 glass-card p-8 border border-white/40 dark:border-white/5 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8 animate-pulse">
                <div className="space-y-2">
                    <div className="w-40 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="w-60 h-4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
                <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            </div>
        </div>
    );
}
