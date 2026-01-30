import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../Icon';

const data = [
    { name: 'Seg', processos: 40, concluidos: 24 },
    { name: 'Ter', processos: 30, concluidos: 13 },
    { name: 'Qua', processos: 20, concluidos: 58 },
    { name: 'Qui', processos: 27, concluidos: 39 },
    { name: 'Sex', processos: 18, concluidos: 48 },
    { name: 'Sab', processos: 23, concluidos: 38 },
    { name: 'Dom', processos: 34, concluidos: 43 },
];

export const StatCard = ({ title, value, change, changeType, icon, color }) => (
    <div className="glass-card p-6 flex items-start justify-between relative overflow-hidden group">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color.replace('text-', 'bg-')} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
            <div className={`flex items-center mt-2 text-sm ${changeType === 'increase' ? 'text-emerald-500' : 'text-red-500'}`}>
                <Icon name={changeType === 'increase' ? 'trending-up' : 'trending-down'} className="w-4 h-4 mr-1" />
                <span className="font-medium">{change}</span>
                <span className="text-gray-400 ml-1">vs mês passado</span>
            </div>
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-')} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            <Icon name={icon} className={`w-6 h-6 ${color}`} />
        </div>
    </div>
);

export const ChartWidget = ({ title, type = 'area' }) => {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                <select className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm text-gray-500 focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    <option>Esta Semana</option>
                    <option>Este Mês</option>
                    <option>Este Ano</option>
                </select>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'area' ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorProcessos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                            />
                            <Area type="monotone" dataKey="processos" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorProcessos)" />
                        </AreaChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar dataKey="concluidos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};
