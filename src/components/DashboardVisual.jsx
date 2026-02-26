import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Target, TrendingUp, Users, AlertCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#10b981'];
// Indigo, Violet, Fuchsia, Emerald

export default function DashboardVisual({ stats, funnelData }) {

    // Mock data for Areas (Hiring trend)
    const trendData = [
        { name: 'Jan', convocados: 40 },
        { name: 'Fev', convocados: 30 },
        { name: 'Mar', convocados: 20 },
        { name: 'Abr', convocados: 27 },
        { name: 'Mai', convocados: 18 },
        { name: 'Jun', convocados: 23 },
        { name: 'Jul', convocados: 34 },
    ];

    // Data for Pie Chart (Occupancy)
    // Assuming we have total spots vs filled. using mock if mostly empty
    const occupancyData = [
        { name: 'Preenchidas', value: stats.vagasPreenchidas || 342, color: '#10b981' },
        { name: 'Livres', value: (stats.candidatos > 0 ? Math.floor(stats.candidatos * 0.2) : 120), color: '#e2e8f0' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">

            {/* Esquerda: Funil de Conversão (Bar Chart) */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Target size={20} className="text-indigo-500" />
                            Funil de Seleção
                        </h3>
                        <p className="text-sm text-slate-500">Conversão de inscritos até convocação</p>
                    </div>
                </div>

                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Direita: Ocupação e Tendência */}
            <div className="space-y-8">

                {/* Ocupação (Pie) */}
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                            <Users size={20} className="text-emerald-500" />
                            Taxa de Ocupação
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Vagas preenchidas vs disponíveis.</p>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                <span className="text-sm font-medium text-slate-700">Preenchidas ({occupancyData[0].value})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                                <span className="text-sm font-medium text-slate-700">Disponíveis ({occupancyData[1].value})</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: 160, height: 160, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={occupancyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {occupancyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centered Percentage */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-slate-700">
                                {Math.round((occupancyData[0].value / (occupancyData[0].value + occupancyData[1].value)) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tendência (Area) */}
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-500" />
                            Ritmo de Contratação
                        </h3>
                    </div>
                    <div style={{ width: '100%', height: 150 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorConvocados" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                <Area type="monotone" dataKey="convocados" stroke="#3b82f6" fillOpacity={1} fill="url(#colorConvocados)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
