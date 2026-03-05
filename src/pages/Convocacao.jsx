import React, { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard, Users, Settings,
    ArrowLeft, AlertTriangle, School, GraduationCap,
    Building2, TrendingUp, PieChart as PieChartIcon, BookOpen, Upload, Target, MapPin, Trophy, CheckCircle, XCircle
} from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

import GestaoTab from '../components/convocacao/GestaoTab';
import MotorRegraTab from '../components/convocacao/MotorRegraTab';
import { fetchRegraAtiva, fetchEscolasBase } from '../services/psicologoService';
import { read, utils } from 'xlsx';
import { toast } from 'sonner';

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

// ─── Visão Geral (Dashboards de KPIs) ────────────────────────────────────────
function VisaoGeralTab({ summary, dreData, isMock, onGoToAnalise }) {
    const r = summary;
    const portePieData = [
        { name: 'Pequeno Porte', value: r.qPequeno },
        { name: 'Médio Porte (Tipo A)', value: r.qMedioA },
        { name: 'Médio Porte (Tipo B)', value: r.qMedioB },
        { name: 'Grande Porte', value: r.qGrande },
    ].filter(v => v.value > 0);

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border rounded-2xl px-5 py-4 shadow-sm ${isMock ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start sm:items-center gap-3">
                    {isMock ? (
                        <>
                            <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-1 sm:mt-0" />
                            <div>
                                <p className="text-sm text-amber-800 font-bold">Dashboards com dados demonstrativos.</p>
                                <p className="text-xs text-amber-700 mt-0.5">Para visualizar o painel real de escolas, faça a importação da base na guia de Análise.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <CheckCircle size={24} className="text-emerald-500 shrink-0 mt-1 sm:mt-0" />
                            <div>
                                <p className="text-sm text-slate-800 font-bold">Dashboards atualizados com sucesso.</p>
                                <p className="text-xs text-slate-500 mt-0.5">Os indicadores de demanda estão operando com os dados da última importação.</p>
                            </div>
                        </>
                    )}
                </div>
                <div>
                    <button onClick={onGoToAnalise} className={`cursor-pointer whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm ${isMock ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                        <Target size={16} /> {isMock ? 'Ir para Análise / Upload' : 'Ver Ranking / Atualizar Base'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total de Escolas', value: r.totalEscolas.toLocaleString('pt-BR'), icon: School, color: 'indigo' },
                    { label: 'Total de Alunos', value: r.totalAlunos.toLocaleString('pt-BR'), icon: GraduationCap, color: 'violet' },
                    { label: 'Pequenas/Médias (Comp.)', value: (r.qPequeno + r.qMedioA + r.qMedioB).toLocaleString('pt-BR'), icon: Building2, color: 'emerald' },
                    { label: 'Grandes (Fixos)', value: r.qGrande.toLocaleString('pt-BR'), icon: TrendingUp, color: 'rose' },
                ].map((c, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${c.color}-500/10 rounded-full group-hover:scale-150 transition-transform duration-500`} />
                        <div><p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{c.label}</p><h3 className={`text-3xl font-black text-${c.color}-600`}>{c.value}</h3></div>
                        <div className={`p-3 bg-${c.color}-50 text-${c.color}-600 rounded-xl relative z-10`}><c.icon size={24} /></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:col-span-2 flex flex-col h-[420px]">
                    <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2"><PieChartIcon className="text-indigo-500" size={18} />Distribuição por Porte</h3>
                    <p className="text-sm text-slate-400 mb-6">Classificação das unidades escolares (Filtros aplicados)</p>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={portePieData} innerRadius={80} outerRadius={120} paddingAngle={4} dataKey="value" stroke="none">
                                    {portePieData.map((e, i) => <Cell key={i} fill={COLORS_PORTE[e.name] || '#CBD5E1'} />)}
                                </Pie>
                                <RechartsTooltip formatter={(v, n) => [`${v} escolas`, n]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={50} iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#475569' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:col-span-3 flex flex-col h-[420px]">
                    <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2"><TrendingUp className="text-violet-500" size={18} />Top Regiões/DRE (por Alunos)</h3>
                    <p className="text-sm text-slate-400 mb-6">Volume de matrículas por Diretoria</p>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dreData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f8fafc" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                                <YAxis type="category" dataKey="dre" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} width={80} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} formatter={v => [v.toLocaleString('pt-BR'), 'Alunos']} contentStyle={{ borderRadius: '12px', border: 'none', fontStyle: 'normal', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="alunos" fill="url(#barGrad)" radius={[0, 8, 8, 0]} barSize={24} />
                                <defs><linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Aba Análise (Upload e Ranking) ──────────────────────────────────────────
function AnaliseTab({ summary, escolas, isMock, onGoToETL }) {
    const r = summary;
    const [pesquisa, setPesquisa] = useState('');

    const rankingEscolas = useMemo(() => {
        if (!escolas || escolas.length === 0) return [];

        return escolas.map(esc => {
            let nivel = esc.nivel || 2;
            let statusTexto = 'Prioridade Alta (Interior)';
            let corBadge = 'bg-amber-100 text-amber-700 border-amber-200';
            let icone = <Target size={14} className="text-amber-500" />;

            const area = (esc.area_localizacao || esc.localizacao || '').toLowerCase();
            const mun = (esc.municipio || '').toLowerCase();

            const excluidas = ['belém', 'belem', 'ananindeua', 'santarém', 'santarem', 'marabá', 'maraba', 'abaetetuba', 'barcarena', 'benevides'];
            const isExcluida = excluidas.some(ex => mun === ex);

            if (esc.status_alocacao === 'Sem vagas (Corte)') {
                statusTexto = 'Sem vagas (Corte por Limite)';
                corBadge = 'bg-red-100 text-red-700 border-red-200';
                icone = <XCircle size={14} className="text-red-500" />;
            } else if (isExcluida) {
                nivel = 3;
                statusTexto = 'Não Prioritário (Metrópole)';
                corBadge = 'bg-slate-100 text-slate-500 border-slate-200';
                icone = <XCircle size={14} className="text-slate-400" />;
            } else if (area.includes('rural')) {
                nivel = 1;
                statusTexto = 'Prioridade Máxima (Zona Rural)';
                corBadge = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                icone = <Trophy size={14} className="text-emerald-500" />;
            }

            return {
                ...esc,
                nivel,
                statusTexto,
                corBadge,
                icone,
                psicologos_display: esc.psicologos_display !== undefined ? esc.psicologos_display : (esc.porte === 'Grande Porte' ? 1 : 'Compartilhado (1/3)')
            };
        }).sort((a, b) => {
            if (a.nivel !== b.nivel) return a.nivel - b.nivel;
            return (b.total_alunos || 0) - (a.total_alunos || 0);
        });
    }, [escolas]);

    const displayLista = rankingEscolas.filter(e =>
        e.nome_escola.toLowerCase().includes(pesquisa.toLowerCase()) ||
        e.municipio.toLowerCase().includes(pesquisa.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header de Upload (Substitui o amarelo antigo) */}
            <div className={`p-6 rounded-3xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-6 ${isMock ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start gap-4">
                    {isMock ? (
                        <>
                            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 shrink-0"><AlertTriangle size={28} /></div>
                            <div>
                                <h1 className="text-xl font-black text-amber-900 mb-1">Aguardando Planilha Base (.xlsx)</h1>
                                <p className="text-sm text-amber-700 max-w-2xl leading-relaxed">
                                    Para gerar o <strong className="font-bold">Ranking de Prioridade</strong> exato por escola (Focando em Zona Rural e Interior), carregue os dados das matrículas atualizados. Os dados atuais são apenas demonstrativos.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 shrink-0"><CheckCircle size={28} /></div>
                            <div>
                                <h1 className="text-xl font-black text-slate-800 mb-1">Análise Concluída com Sucesso</h1>
                                <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                                    As regras de filtro e proporção foram aplicadas para as {r.totalEscolas.toLocaleString('pt-BR')} escolas válidas. Abaixo você vê o ranking das unidades que devem receber psicólogos prioritariamente.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="shrink-0 group w-full md:w-auto">
                    <label className={`w-full md:w-auto inline-flex items-center justify-center cursor-pointer px-6 py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 border-2 
                        ${isMock ? 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}>
                        <Upload size={20} className="mr-2" />
                        {isMock ? 'Subir Planilha Base (Excel)' : 'Atualizar Base (Excel)'}
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={onGoToETL} />
                    </label>
                </div>
            </div>

            {/* Layout Dividido Inspirado em VagasEspeciais */}
            <div className="flex flex-col xl:flex-row gap-6">

                {/* PAINEL ESQUERDO: RESUMOS E MÉTRICAS */}
                <div className="xl:w-1/3 flex flex-col gap-5">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-3xl shadow-sm border border-indigo-500/30 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <h3 className="font-bold text-indigo-100 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Target size={16} /> Demanda Calculada do Edital
                        </h3>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-6xl font-black tracking-tighter">{r.demandaFinal.toLocaleString('pt-BR')}</span>
                            <span className="text-indigo-200 font-medium">psicólogos</span>
                        </div>
                        <p className="text-xs text-indigo-200 border-t border-white/10 pt-3 mt-4">
                            Sendo <strong>{r.nGrande}</strong> fixos (escolas &gt; 1K alunos) e <strong>{r.nPequeno + r.nMedioB}</strong> compartilhados para a rede rural e interior.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                            <School size={16} className="text-slate-400" /> Resumo do Universo
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                <span className="text-slate-500 text-sm">Escolas Analisadas</span>
                                <span className="font-bold text-slate-800">{r.totalEscolas.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                <span className="text-slate-500 text-sm">Escolas de Grande Porte</span>
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{r.qGrande.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                <span className="text-slate-500 text-sm">Pequeno/Médio Porte (1 p/ cada 3)</span>
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{(r.qPequeno + r.qMedioA + r.qMedioB).toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Total de Alunos (Filtro Ativo)</span>
                                <span className="font-bold text-slate-800">{r.totalAlunos.toLocaleString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAINEL DIREITO: RANKING DE ESCOLAS */}
                <div className="xl:w-2/3 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[750px]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Trophy size={20} className="text-amber-500" /> Ranking de Prioridades Geográficas
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Escolas rurais têm prioridade 1 (cobertura total), seguidas pelas Cidades do Interior (2).</p>
                            </div>
                            <div className="w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Buscar escola ou município..."
                                    className="w-full md:w-72 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                                    value={pesquisa}
                                    onChange={(e) => setPesquisa(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-slate-50/50">
                        {displayLista.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
                                <AlertTriangle size={48} className="text-slate-400 mb-4" />
                                <p className="text-slate-600 font-bold text-lg">Nenhuma escola corresponde à busca</p>
                                <p className="text-slate-400 text-sm max-w-sm mt-2">Revise o termo digitado ou certifique-se de que a planilha possui dados.</p>
                            </div>
                        ) : (
                            displayLista.map((esc, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: esc.nivel === 1 ? '#10B981' : esc.nivel === 2 ? '#F59E0B' : '#94A3B8' }} />

                                    <div className="flex-1 min-w-0 pl-3">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h4 className="font-bold text-slate-800 text-base md:text-lg truncate">{esc.nome_escola || esc.NOME_ESCOLA}</h4>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-500 font-medium mt-1">
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {esc.municipio || esc.MUNICIPIO}</span>
                                            <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-slate-400" /> {esc.total_alunos} alunos</span>
                                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-bold">{esc.porte}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2.5 shrink-0 sm:w-auto w-full sm:mt-0 mt-3 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100">
                                        <div className={`text-sm font-black px-4 py-2 rounded-xl border flex items-center gap-2 w-full sm:w-auto justify-center shadow-sm ${esc.psicologos_display === 0 ? 'text-red-700 bg-red-50 border-red-100' : 'text-indigo-700 bg-indigo-50 border-indigo-100'}`}>
                                            <Users size={16} className={esc.psicologos_display === 0 ? 'text-red-500' : 'text-indigo-500'} />
                                            Psicólogos destinados: {esc.psicologos_display}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
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

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = evt.target.result;
                const workbook = read(data, { type: 'binary' });
                const firstSheet = workbook.SheetNames[0];
                const rows = utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });

                const normalize = (str) => String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

                const processado = [];
                for (const row of rows) {
                    const keys = Object.keys(row);
                    const getCol = (keyTags) => {
                        const k = keys.find(kl => keyTags.some(tag => normalize(kl).includes(tag)));
                        return k ? row[k] : null;
                    };

                    const nome = getCol(['escola', 'unidade', 'nome']);
                    const municipio = getCol(['municipio', 'cidade']);
                    const dre = getCol(['dre', 'diretoria', 'regional']);
                    const alunosVal = getCol(['aluno', 'matricula', 'total']);

                    if (!nome || !alunosVal) continue;

                    const nomeNorm = normalize(nome);
                    // Filtros dinâmicos definidos na regra
                    if (nomeNorm.includes('indigena') || nomeNorm.includes('quilombola') || nomeNorm.includes('ceeja') || nomeNorm.includes('some') || nomeNorm.includes('antonio carlos')) {
                        continue;
                    }

                    let alunos = Number(alunosVal);
                    if (isNaN(alunos)) alunos = 0;
                    if (alunos === 0) continue;

                    let porte = 'Pequeno Porte';
                    const maxPeq = regra?.limite_pequeno_max || 700;
                    const maxMedB = regra?.limite_medio_b_max || 999;

                    if (alunos > maxMedB) porte = 'Grande Porte';
                    else if (alunos > maxPeq) porte = 'Médio Porte (Tipo B)';

                    const area = getCol(['zona', 'localizacao', 'area', 'situação', 'situacao']);

                    processado.push({
                        nome_escola: String(nome).trim(),
                        municipio: String(municipio || '').trim(),
                        dre: String(dre || '').trim(),
                        area_localizacao: String(area || 'Urbana').trim(),
                        total_alunos: alunos,
                        porte
                    });
                }

                if (processado.length === 0) {
                    toast.error("Nenhuma escola válida encontrada. Verifique as colunas (Escola, Município, DRE, Total de Alunos).");
                    return;
                }

                setEtlEscolas(processado);

                // 1) Classificar os níveis para a distribuição
                processado.forEach(e => {
                    const area = (e.area_localizacao || '').toLowerCase();
                    const mun = (e.municipio || '').toLowerCase();
                    const excluidas = ['belém', 'belem', 'ananindeua', 'santarém', 'santarem', 'marabá', 'maraba', 'abaetetuba', 'barcarena', 'benevides'];

                    if (excluidas.some(ex => mun === ex)) {
                        e.nivel = 3;
                    } else if (area.includes('rural')) {
                        e.nivel = 1;
                    } else {
                        e.nivel = 2;
                    }
                });

                // Ordenação: Nivel (1->3), depois por alunos (maior->menor)
                processado.sort((a, b) => {
                    if (a.nivel !== b.nivel) return a.nivel - b.nivel;
                    return b.total_alunos - a.total_alunos;
                });

                // 2) Distribuição de vagas baseada no Limite
                let vagasRestantes = regra?.total_vagas_disponivel || 200;
                const regraP = regra?.psic_por_escolas_pequenas || 3;
                const psicPorAlunosGrande = regra?.psic_por_alunos_grande || 1000;

                let nGrandeFixo = 0;
                let nPeqMedio = 0;
                let contPeqMedio = 0;

                processado.forEach(e => {
                    if (e.porte === 'Grande Porte') {
                        if (vagasRestantes <= 0) {
                            e.status_alocacao = 'Sem vagas (Corte)';
                            e.psicologos_display = 0;
                            e.psicologos_alocados = 0;
                            return;
                        }
                        const psi = Math.ceil(e.total_alunos / psicPorAlunosGrande);
                        if (vagasRestantes >= psi) {
                            e.psicologos_alocados = psi;
                            e.psicologos_display = psi;
                            nGrandeFixo += psi;
                            vagasRestantes -= psi;
                            e.status_alocacao = 'Alocado';
                        } else {
                            e.psicologos_alocados = vagasRestantes;
                            e.psicologos_display = vagasRestantes;
                            nGrandeFixo += vagasRestantes;
                            vagasRestantes = 0;
                            e.status_alocacao = 'Alocação Parcial';
                        }
                    } else {
                        // Pequeno e Médio Porte
                        if (contPeqMedio === 0) {
                            if (vagasRestantes > 0) {
                                vagasRestantes -= 1;
                                nPeqMedio += 1;
                                contPeqMedio = 1;
                                e.psicologos_display = `Compartilhado (1/${regraP})`;
                                e.psicologos_alocados = 1 / regraP;
                                e.status_alocacao = 'Alocado';
                            } else {
                                e.status_alocacao = 'Sem vagas (Corte)';
                                e.psicologos_display = 0;
                                e.psicologos_alocados = 0;
                            }
                        } else {
                            contPeqMedio++;
                            e.psicologos_display = `Compartilhado (1/${regraP})`;
                            e.psicologos_alocados = 1 / regraP;
                            e.status_alocacao = 'Alocado';
                            if (contPeqMedio >= regraP) contPeqMedio = 0;
                        }
                    }
                });

                const q = (p) => processado.filter(e => e.porte === p).length;

                setEtlSummary({
                    totalEscolas: processado.length,
                    totalAlunos: processado.reduce((s, e) => s + e.total_alunos, 0),
                    qPequeno: q('Pequeno Porte'),
                    qMedioA: q('Médio Porte (Tipo A)'),
                    qMedioB: q('Médio Porte (Tipo B)'),
                    qGrande: q('Grande Porte'),
                    nPequeno: 0,
                    nMedioA: nPeqMedio, // Usando nMedioA para guardar o total agrupado por simplicidade na UI
                    nMedioB: 0,
                    nGrande: nGrandeFixo,
                    demandaFinal: nPeqMedio + nGrandeFixo
                });

                toast.success(`Planilha processada com sucesso! ${processado.length} escolas inseridas.`);
            } catch (err) {
                console.error(err);
                toast.error("Erro ao analisar o arquivo XLSX.");
            }
        };
        reader.readAsBinaryString(file);
    };

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
        { id: 'analise', label: 'Análise de Escolas', icon: Target },
        { id: 'gestao', label: 'Painel de Gestão', icon: Users },
        { id: 'regras', label: 'Motor de Regras', icon: Settings },
    ];

    const STEPS = [
        { id: 'visaoGeral', label: 'Dashboard' },
        { id: 'analise', label: 'Ranqueamento' },
        { id: 'gestao', label: 'Gestão de Vagas' },
        { id: 'regras', label: 'Motor de Regras' },
    ];

    // Gera dados de demonstração caso não tenha havido upload ainda
    const escolasParaExibicao = useMemo(() => {
        if (etlEscolas.length > 0) return etlEscolas;

        const demo = [];
        for (let i = 0; i < 30; i++) {
            demo.push({
                nome_escola: `Escola Estadual Exemplo ${i + 1}`,
                municipio: i % 3 === 0 ? 'Belém' : i % 2 === 0 ? 'Limoeiro do Ajuru' : 'Acará',
                area_localizacao: i % 4 === 0 ? 'Rural' : 'Urbana',
                porte: i % 5 === 0 ? 'Grande Porte' : 'Pequeno Porte',
                total_alunos: 300 + (i * 50)
            });
        }
        return demo;
    }, [etlEscolas]);

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
                <VisaoGeralTab summary={summary} dreData={dreData} isMock={isMock} onGoToAnalise={() => setActiveTab('analise')} />
            )}
            {activeTab === 'analise' && (
                <AnaliseTab summary={summary} escolas={escolasParaExibicao} isMock={isMock} onGoToETL={handleFileUpload} />
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
