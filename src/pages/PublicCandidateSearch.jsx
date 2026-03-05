import React, { useState } from 'react';
import { Search, Loader2, UserCheck, AlertCircle, ArrowLeft, ShieldCheck, MapPin, Award } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function PublicCandidateSearch() {
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);

    // Resultados
    const [resultPss, setResultPss] = useState(null);
    const [resultConv, setResultConv] = useState([]);

    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!cpf || cpf.length < 11) {
            toast.error("Por favor, digite um CPF válido.");
            return;
        }

        setLoading(true);
        setResultPss(null);
        setResultConv([]);
        setSearched(false);

        try {
            const cleanCpf = cpf.replace(/\D/g, '');

            // 1. Busca no PSS Base
            const { data: dataPss } = await supabase
                .from('candidatos')
                .select('*')
                .ilike('cpf', `%${cleanCpf}%`)
                .limit(1);

            // 2. Busca nas Convocações Especiais
            const { data: dataConv } = await supabase
                .from('inscricoes_convocacao')
                .select('*, convocacoes_especiais(titulo)')
                .eq('candidato_cpf', cleanCpf)
                .order('created_at', { ascending: false });

            if (dataPss && dataPss.length > 0) {
                setResultPss(dataPss[0]);
            }
            if (dataConv && dataConv.length > 0) {
                setResultConv(dataConv);
            }

            setSearched(true);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao buscar informações. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'bg-slate-100 text-slate-700 border-slate-200';
        switch (String(status).toLowerCase()) {
            case 'aprovado':
            case 'convocado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'classificado': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'em análise':
            case 'em analise':
            case 'em_analise': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'cadastro reserva': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'reprovado':
            case 'desclassificado': return 'bg-red-100 text-red-700 border-red-200';
            case 'inscrito': return 'bg-sky-100 text-sky-700 border-sky-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return 'Em Análise';
        const labels = {
            'em_analise': 'Em Análise Técnica',
            'desclassificado': 'Desclassificado',
            'convocado': 'Convocado',
            'inscrito': 'Inscrição Confirmada'
        };
        return labels[status.toLowerCase()] || status;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center p-6 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px] animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>

            {/* Header */}
            <div className="w-full max-w-3xl flex justify-between items-center mb-10 mt-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center">
                        <span className="text-xl">🏛️</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Portal do Candidato</h1>
                        <p className="text-xs text-slate-500">Consulta de Situação Processual</p>
                    </div>
                </div>
                <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors">
                    <ArrowLeft size={16} /> Voltar para Acesso
                </Link>
            </div>

            {/* Main Search Card */}
            <div className="w-full max-w-lg glass-card p-8 relative border border-white/60 dark:border-white/10 shadow-2xl z-10 animate-scaleIn">

                <div className="text-center mb-8">
                    <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10 mb-4 group hover:scale-105 transition-all duration-300">
                        <UserCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Consulte sua Situação</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Informe seu CPF para verificar o status de sua inscrição.</p>
                </div>

                <form onSubmit={handleSearch} className="space-y-5">
                    <div className="relative group">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">CPF DO CANDIDATO</label>
                        <div className="absolute top-[28px] inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <ShieldCheck className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Somente números"
                            className="input-glass w-full pl-12 py-3"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary-glass w-full py-3.5 flex items-center justify-center text-base mt-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <span className="flex items-center gap-2">
                                <Search size={18} /> Consultar Agora
                            </span>
                        )}
                    </button>
                </form>

                {/* Results Section */}
                {searched && (
                    <div className="mt-8 animate-fadeIn">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Resultado da Busca</span>
                            </div>
                        </div>

                        {/* 1. RESULTADO PSS BASE */}
                        <div className="mb-4">
                            <h3 className="text-slate-500 font-bold uppercase text-[11px] tracking-wider mb-2 text-center">Processo Seletivo Base</h3>
                            {resultPss ? (
                                <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group shadow-inner">
                                    <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs font-bold border-b border-l uppercase tracking-wider ${getStatusColor(resultPss.status)}`}>
                                        {resultPss.status || 'Em Análise'}
                                    </div>

                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-600 shadow-sm shrink-0">
                                            <span className="text-2xl">👤</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">{resultPss.nome}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5">
                                                <MapPin size={14} /> {resultPss.municipio} / {resultPss.dre}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">Cargo PSS</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">{resultPss.cargo || resultPss.vaga}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">Nota Final PSS</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg flex items-center gap-1">
                                                <Award size={16} /> {resultPss.pontuacao || '0.0'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-center text-slate-400">
                                            Última atualização: {new Date(resultPss.created_at || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-sm text-slate-500 font-bold">
                                    Não encontrado na base original do PSS.
                                </div>
                            )}
                        </div>

                        {/* 2. RESULTADOS CONVOCAÇÕES ESPECIAIS */}
                        <div className="mt-8">
                            <h3 className="text-slate-500 font-bold uppercase text-[11px] tracking-wider mb-2 text-center text-emerald-600/70">Linha do Tempo - Convocações Especiais</h3>

                            {resultConv.length > 0 ? (
                                <div className="space-y-4">
                                    {resultConv.map((conv, idx) => (
                                        <div key={conv.id} className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-5 relative shadow-sm">
                                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(conv.status_inscricao)}`}>
                                                {getStatusLabel(conv.status_inscricao)}
                                            </div>

                                            <div className="pr-24">
                                                <h4 className="font-bold text-slate-800 dark:text-emerald-400 text-sm mb-1">{conv.convocacoes_especiais?.titulo || 'Edital Desconhecido'}</h4>
                                                <p className="text-xs text-slate-500 flex items-center gap-1"><AlertCircle size={12} /> Inscrito em: {new Date(conv.created_at).toLocaleDateString()}</p>
                                            </div>

                                            {conv.observacao_gestor && (
                                                <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1"><ShieldCheck size={12} /> Parecer da Gestão</span>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">"{conv.observacao_gestor}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 text-xs text-emerald-600/70 font-bold">
                                    Você não realizou nenhuma Inscrição Especial.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto py-6 text-center">
                <p className="text-xs text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} CPS - Governo do Estado do Pará. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
