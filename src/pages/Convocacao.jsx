import React, { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard, Users, Settings,
    ArrowLeft, AlertTriangle, School, GraduationCap,
    Building2, TrendingUp, PieChart as PieChartIcon, BookOpen
} from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

import GestaoTab from '../components/convocacao/GestaoTab';
import MotorRegraTab from '../components/convocacao/MotorRegraTab';
import { fetchRegraAtiva, fetchEscolasBase } from '../services/psicologoService';

// ─── Dados mock (exibidos enquanto não há ETL real) ───────────────────────────
const MOCK_SUMMARY = {
    totalEscolas: 847, totalAlunos: 612480,
    qPequeno: 491, qMedioA: 178, qMedioB: 103, qGrande: 75,
    nPequeno: 164, nMedioA: 178, nMedioB: 206, nGrande: 189, demandaFinal: 737
};
const MOCK_DRE = [
    { dre: 'Interior', alunos: 162890 }, { dre: 'Capital', alunos: 98340 },
    { dre: 'Leste 1', alunos: 72110 }, { dre: 'Leste 2', alunos: 68940 },
    { dre: 'Sul 1', alunos: 61200 }, { dre: 'Sul 2', alunos: 55870 },
    { dre: 'Norte', alunos: 48900 }, { dre: 'Oeste', alunos: 44230 },
];
const COLORS_PORTE = {
    'Pequeno Porte': '#10B981', 'Médio Porte (Tipo A)': '#F59E0B',
    'Médio Porte (Tipo B)': '#F97316', 'Grande Porte': '#6366F1'
};

// ─── Visão Geral ─────────────────────────────────────────────────────────────
function VisaoGeralTab({ summary, dreData, isMock, onGoToETL }) {
    const r = summary;
    const portePieData = [
        { name: 'Pequeno Porte', value: r.qPequeno },
        { name: 'Médio Porte (Tipo A)', value: r.qMedioA },
        { name: 'Médio Porte (Tipo B)', value: r.qMedioB },
        { name: 'Grande Porte', value: r.qGrande },
    ].filter(v => v.value > 0);

    const tableData = [
        { porte: 'Pequeno Porte', cor: 'emerald', n: r.qPequeno, psic: r.nPequeno },
        { porte: 'Médio Porte (Tipo A)', cor: 'amber', n: r.qMedioA, psic: r.nMedioA },
        { porte: 'Médio Porte (Tipo B)', cor: 'orange', n: r.qMedioB, psic: r.nMedioB },
        { porte: 'Grande Porte', cor: 'indigo', n: r.qGrande, psic: r.nGrande },
    ];
    const corMap = { emerald: 'text-emerald-600 bg-emerald-50', amber: 'text-amber-600 bg-amber-50', orange: 'text-orange-600 bg-orange-50', indigo: 'text-indigo-600 bg-indigo-50' };

    return (
        <div className="space-y-5 animate-fadeIn">
            {isMock && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-700 font-medium">
                        Exibindo <strong>dados demonstrativos</strong>. Para ver dados reais, importe uma planilha na aba{' '}
                        <button onClick={onGoToETL} className="underline font-bold hover:text-amber-900">Motor de Alocação (ETL)</button>.
                    </p>
                </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total de Escolas', value: r.totalEscolas.toLocaleString('pt-BR'), icon: School, color: 'indigo' },
                    { label: 'Total de Alunos', value: r.totalAlunos.toLocaleString('pt-BR'), icon: GraduationCap, color: 'violet' },
                    { label: 'Pequeno/Médio Porte', value: (r.qPequeno + r.qMedioA + r.qMedioB).toLocaleString('pt-BR'), icon: Building2, color: 'emerald' },
                    { label: 'Grande Porte', value: r.qGrande.toLocaleString('pt-BR'), icon: TrendingUp, color: 'rose' },
                ].map((c, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${c.color}-500/10 rounded-full group-hover:scale-150 transition-transform duration-500`} />
                        <div><p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{c.label}</p><h3 className={`text-3xl font-black text-${c.color}-600`}>{c.value}</h3></div>
                        <div className={`p-3 bg-${c.color}-50 text-${c.color}-600 rounded-xl relative z-10`}><c.icon size={24} /></div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-2 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2"><PieChartIcon className="text-indigo-500" size={16} />Distribuição por Porte</h3>
                    <p className="text-xs text-slate-400 mb-3">Classificação das unidades escolares</p>
                    <div className="flex-1 min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={portePieData} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                                    {portePieData.map((e, i) => <Cell key={i} fill={COLORS_PORTE[e.name] || '#CBD5E1'} />)}
                                </Pie>
                                <RechartsTooltip formatter={(v, n) => [`${v} escolas`, n]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={50} iconType="circle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-3 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2"><TrendingUp className="text-violet-500" size={16} />Alunos por Diretoria (DRE)</h3>
                    <p className="text-xs text-slate-400 mb-3">Volume de matrículas por regional</p>
                    <div className="flex-1 min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dreData} layout="vertical" margin={{ left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                <YAxis type="category" dataKey="dre" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} width={58} axisLine={false} tickLine={false} />
                                <RechartsTooltip formatter={v => [v.toLocaleString('pt-BR'), 'Alunos']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="alunos" fill="url(#barGrad)" radius={[0, 6, 6, 0]} />
                                <defs><linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                    <BookOpen className="text-indigo-500" size={16} />
                    <h3 className="text-sm font-bold text-slate-800">Resumo de Demanda por Porte</h3>
                    <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-semibold">demanda total: {r.demandaFinal} psicólogos</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold"><tr><th className="px-5 py-3 text-left">Classificação</th><th className="px-5 py-3 text-center">Nº de Escolas</th><th className="px-5 py-3 text-right">Psicólogos Destinados</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                        {tableData.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${corMap[row.cor]}`}>{row.porte}</span></td>
                                <td className="px-5 py-3 text-center font-bold text-slate-700">{row.n.toLocaleString('pt-BR')}</td>
                                <td className="px-5 py-3 text-right font-black text-indigo-700">{row.psic.toLocaleString('pt-BR')}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-200 bg-slate-50"><tr><td className="px-5 py-3 font-bold text-slate-800" colSpan={2}>TOTAL GERAL</td><td className="px-5 py-3 text-right font-black text-indigo-700 text-base">{r.demandaFinal.toLocaleString('pt-BR')}</td></tr></tfoot>
                </table>
            </div>
        </div>
    );
}

// ─── PsicologoConvocacao — Orchestrador ──────────────────────────────────────
function PsicologoConvocacao({ onBack }) {
    const [activeTab, setActiveTab] = useState('visaoGeral');
    const [etlSummary, setEtlSummary] = useState(null);
    const [etlEscolas, setEtlEscolas] = useState([]);
    const [regra, setRegra] = useState(null);

    // Carrega regra ao montar
    useEffect(() => {
        fetchRegraAtiva().then(setRegra).catch(() => { });
        // Tenta carregar último ETL do banco
        fetchEscolasBase().then(data => {
            if (data.length > 0) {
                const q = (porte) => data.filter(e => e.porte === porte).length;
                setEtlEscolas(data);
                setEtlSummary({
                    totalEscolas: data.length,
                    totalAlunos: data.reduce((s, e) => s + (e.total_alunos || 0), 0),
                    qPequeno: q('Pequeno Porte'), qMedioA: q('Médio Porte (Tipo A)'),
                    qMedioB: q('Médio Porte (Tipo B)'), qGrande: q('Grande Porte'),
                    nPequeno: Math.ceil(q('Pequeno Porte') / (regra?.psic_por_escolas_pequenas || 3)),
                    nMedioA: q('Médio Porte (Tipo A)'), nMedioB: q('Médio Porte (Tipo B)') * 2,
                    nGrande: data.filter(e => e.porte === 'Grande Porte').reduce((s, e) => s + (e.psicologos_alocados || 0), 0),
                    demandaFinal: data.reduce((s, e) => s + (e.psicologos_alocados || 0), 0) + Math.ceil(q('Pequeno Porte') / (regra?.psic_por_escolas_pequenas || 3))
                });
            }
        }).catch(() => { });
    }, []);

    const summary = etlSummary || MOCK_SUMMARY;
    const isMock = !etlSummary;

    const dreData = useMemo(() => {
        if (etlEscolas.length === 0) return MOCK_DRE;
        const agg = etlEscolas.reduce((acc, e) => {
            const dre = e.dre || 'Sem DRE';
            if (!acc[dre]) acc[dre] = { dre, alunos: 0 };
            acc[dre].alunos += e.total_alunos || 0;
            return acc;
        }, {});
        return Object.values(agg).sort((a, b) => b.alunos - a.alunos).slice(0, 8);
    }, [etlEscolas]);

    const TABS = [
        { id: 'visaoGeral', label: 'Visão Geral', icon: LayoutDashboard },
        { id: 'gestao', label: 'Painel de Gestão', icon: Users },
        { id: 'regras', label: 'Motor de Regras', icon: Settings },
    ];

    const STEPS = [
        { id: 'visaoGeral', label: '1. Diagnóstico' },
        { id: 'gestao', label: '2. Gestão de Convocados' },
        { id: 'regras', label: '3. Motor de Regras' },
    ];

    return (
        <div className="animate-fadeIn space-y-5 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-white/20">
                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 bg-white text-slate-500 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-600">
                                Central de Convocação & Alocação — Psicólogo
                            </h2>
                            <p className="text-slate-500 font-medium mt-1 text-sm">Acompanhe a demanda, gerencie convocações, processe o ETL e configure as regras.</p>
                        </div>
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-0.5 flex-wrap">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
                                <tab.icon size={15} />
                                <span className="hidden md:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {/* Progress indicator */}
                <div className="flex items-center gap-2 text-xs flex-wrap">
                    {STEPS.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <button onClick={() => setActiveTab(step.id)} className={`px-3 py-1 rounded-full font-bold transition-all ${activeTab === step.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                {step.label}
                            </button>
                            {idx < STEPS.length - 1 && <span className="text-slate-300">→</span>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Conteúdo das abas */}
            {activeTab === 'visaoGeral' && (
                <VisaoGeralTab summary={summary} dreData={dreData} isMock={isMock} onGoToETL={() => setActiveTab('analise')} />
            )}
            {activeTab === 'gestao' && (
                <GestaoTab metaVagas={regra?.total_vagas_disponivel || 200} />
            )}
            {activeTab === 'regras' && (
                <MotorRegraTab onRegraChanged={setRegra} />
            )}
        </div>
    );
}

// ─── Raiz: Seleção de Cargo ───────────────────────────────────────────────────
export default function Convocacao() {
    const [selectedRole, setSelectedRole] = useState(null);
    const roles = [
        { id: 'psicologo', title: 'Psicólogo', description: 'Gestão de convocações e alocação de psicólogos nas unidades escolares.', icon: Users, color: 'from-indigo-500 to-violet-600', bgIcon: 'bg-indigo-50 text-indigo-600', enabled: true },
        { id: 'outros', title: 'Outros Cargos', description: 'Módulos para demais cargos estarão disponíveis em breve.', icon: AlertTriangle, color: 'from-slate-400 to-slate-500', bgIcon: 'bg-slate-50 text-slate-500', enabled: false },
    ];

    if (selectedRole === 'psicologo') return <PsicologoConvocacao onBack={() => setSelectedRole(null)} />;

    return (
        <div className="animate-fadeIn space-y-6 pb-10">
            <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/20 text-center max-w-3xl mx-auto mt-10">
                <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-600 mb-4">Seleção de Cargo para Convocação</h2>
                <p className="text-slate-500 font-medium mb-8 text-lg">Escolha o cargo desejado para acessar o módulo de gestão de convocações e alocação.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {roles.map(role => (
                        <div key={role.id} onClick={() => role.enabled && setSelectedRole(role.id)}
                            className={`relative overflow-hidden group p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${role.enabled ? 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'}`}>
                            {role.enabled && <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${role.color} opacity-5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500`} />}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${role.bgIcon}`}><role.icon size={32} /></div>
                            <h3 className={`text-xl font-bold mb-2 ${role.enabled ? 'text-slate-800' : 'text-slate-500'}`}>{role.title}</h3>
                            <p className="text-sm text-slate-500">{role.description}</p>
                            {!role.enabled && <span className="mt-4 px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">Em Breve</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
