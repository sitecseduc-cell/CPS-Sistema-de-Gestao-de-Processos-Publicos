import React from 'react';

export default function HeroSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 shadow-xl bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-pulse">
                <div className="space-y-4 w-full max-w-lg">
                    <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
                <div className="hidden lg:block">
                    <div className="w-48 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
