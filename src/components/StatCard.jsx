import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
export default function StatCard({ title, value, icon: Icon, color, subtext, alert }) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border ${alert ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : 'border-slate-100 dark:border-slate-700'} hover:shadow-md transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-3xl font-extrabold ${alert ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
          <Icon size={24} className={alert ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'} />
        </div>
      </div>
      {subtext && (
        <div className="mt-3 flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
          {alert ? <AlertTriangle size={12} className="mr-1 text-red-500" /> : <TrendingUp size={12} className="mr-1 text-emerald-500" />}
          {subtext}
        </div>
      )}
    </div>
  );
}