import React, { useState } from 'react';
import { Search, Loader2, UserCheck, AlertCircle, ArrowLeft, ShieldCheck, MapPin, Award } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function PublicCandidateSearch() {
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!cpf || cpf.length < 11) {
            toast.error("Por favor, digite um CPF válido.");
            return;
        }

        setLoading(true);
        setResult(null);
        setSearched(false);

        try {
            // Remove non-numeric characters just in case
            const cleanCpf = cpf.replace(/\D/g, '');

            // Try to match exact CPF or formatted
            // Note: In a real prod env, we should have a 'cpf' column relative to the candidate
            // Here, assuming we search in 'candidatos' table. 
            // We usually check 'cpf' column.

            const { data, error } = await supabase
                .from('candidatos')
                .select('*')
                .ilike('cpf', `%${cleanCpf}%`) // Flexible search
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                setResult(data[0]);
            } else {
                setResult(null);
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
        switch (String(status).toLowerCase()) {
            case 'aprovado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'classificado': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'em análise':
            case 'em analise': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'cadastro reserva': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'reprovado': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
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

                        {result ? (
                            <div className="mt-6 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group shadow-inner">
                                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs font-bold border-b border-l uppercase tracking-wider ${getStatusColor(result.status)}`}>
                                    {result.status || 'Em Análise'}
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-600 text-2xl shadow-sm">
                                        👤
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">{result.nome}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5">
                                            <MapPin size={14} /> {result.municipio} / {result.dre}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Cargo</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">{result.cargo || result.vaga}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Nota Final</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg flex items-center gap-1">
                                            <Award size={16} /> {result.pontuacao || '0.0'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-center text-slate-400">
                                        Última atualização: {new Date(result.created_at || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 text-center py-6 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                <div className="inline-flex p-3 bg-white dark:bg-slate-800 rounded-full text-slate-400 mb-3 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <AlertCircle size={24} />
                                </div>
                                <h3 className="text-slate-800 dark:text-white font-bold">Nenhum registro encontrado</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                                    Verifique se o CPF digitado está correto.
                                </p>
                            </div>
                        )}
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
