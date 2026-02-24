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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex flex-col items-center p-6 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

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
                <Link to="/login" className="text-sm font-semibold text-indigo-600 hover:bg-white/50 px-4 py-2 rounded-lg transition-all">
                    Acesso Administrativo
                </Link>
            </div>

            {/* Main Search Card */}
            <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-8 relative z-10 animate-scaleIn">

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Consulte sua Situação</h2>
                    <p className="text-slate-500">Informe seu CPF para verificar o status de sua inscrição e classificação.</p>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <ShieldCheck className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="000.000.000-00"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-lg text-slate-700 placeholder:text-slate-400"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Search size={20} /> Consultar Agora</>}
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
                            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs font-bold border-b border-l uppercase tracking-wider ${getStatusColor(result.status)}`}>
                                    {result.status || 'Em Análise'}
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 text-2xl shadow-sm">
                                        👤
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{result.nome}</h3>
                                        <p className="text-slate-500 text-sm flex items-center gap-1.5">
                                            <MapPin size={14} /> {result.municipio} / {result.dre}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-sm text-slate-500">Cargo</span>
                                        <span className="font-semibold text-slate-700">{result.cargo || result.vaga}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-sm text-slate-500">Nota Final</span>
                                        <span className="font-bold text-indigo-600 text-lg flex items-center gap-1">
                                            <Award size={16} /> {result.pontuacao || '0.0'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                                    <p className="text-xs text-center text-slate-400">
                                        Última atualização: {new Date(result.created_at || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="inline-flex p-3 bg-white rounded-full text-slate-400 mb-3 shadow-sm">
                                    <AlertCircle size={24} />
                                </div>
                                <h3 className="text-slate-800 font-bold">Nenhum registro encontrado</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                                    Verifique se o CPF foi digitado corretamente ou se sua inscrição já foi processada.
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
