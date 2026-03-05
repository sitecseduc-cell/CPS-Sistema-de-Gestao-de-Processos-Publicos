import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { FileText, Plus, RefreshCw, AlertCircle, Edit, List, CheckCircle, XCircle, FileSearch, HelpCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function GestaoConvocacaoEspecial() {
    const [activeTab, setActiveTab] = useState('editais'); // 'editais' | 'inscricoes'
    const [convocacoes, setConvocacoes] = useState([]);
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal para Nova Convocação
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [novoSincronismo, setNovoSincronismo] = useState({ titulo: '', descricao: '', link_edital: '', link_retificacao: '', link_resultado: '', status: 'aberta' });
    const [cpfsAptos, setCpfsAptos] = useState([]);

    // Modal para Editar Status de Inscrição
    const [inscricaoEditando, setInscricaoEditando] = useState(null);

    useEffect(() => {
        carregarDados();
    }, [activeTab]);

    const carregarDados = async () => {
        setLoading(true);
        try {
            if (activeTab === 'editais') {
                const { data, error } = await supabase.from('convocacoes_especiais').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setConvocacoes(data || []);
            } else {
                // Junta inscricoes com o titulo da convocacao
                const { data, error } = await supabase.from('inscricoes_convocacao').select('*, convocacoes_especiais(titulo)').order('created_at', { ascending: false });
                if (error) throw error;
                setInscricoes(data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados do banco de Convocação Especial.\n' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const wsname = workbook.SheetNames[0];
                const ws = workbook.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                // Extrai todos os CPFs possíveis de qualquer célula formatada como texto ou numero
                let extractedCpfs = [];
                data.forEach(row => {
                    row.forEach(cell => {
                        if (typeof cell === 'string' || typeof cell === 'number') {
                            const str = String(cell).replace(/\D/g, '');
                            if (str.length === 11) {
                                extractedCpfs.push(str);
                            }
                        }
                    });
                });

                extractedCpfs = [...new Set(extractedCpfs)]; // Remove duplicates

                if (extractedCpfs.length === 0) {
                    toast.error('Nenhum CPF válido (11 dígitos) encontrado na planilha.');
                    setCpfsAptos([]);
                } else {
                    setCpfsAptos(extractedCpfs);
                    toast.success(`${extractedCpfs.length} CPFs de candidatos aptos carregados com sucesso!`);
                }
            } catch (error) {
                console.error(error);
                toast.error('Erro ao ler a planilha de Aptos.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSalvarConvocacao = async (e) => {
        e.preventDefault();
        try {
            const { data: novaConvocacao, error } = await supabase.from('convocacoes_especiais').insert([novoSincronismo]).select();
            if (error) throw error;

            const convocacaoId = novaConvocacao[0].id;

            // Insere os CPFs na tabela auxiliar
            if (cpfsAptos.length > 0) {
                const limit = 5000; // Limite batch insert
                for (let i = 0; i < cpfsAptos.length; i += limit) {
                    const chunk = cpfsAptos.slice(i, i + limit).map(cpf => ({
                        convocacao_id: convocacaoId,
                        candidato_cpf: cpf
                    }));
                    const { error: errAptos } = await supabase.from('candidatos_aptos_convocacao').insert(chunk);
                    if (errAptos) console.error("Erro inserindo chunk de Aptos:", errAptos);
                }
            }

            toast.success('Convocação Especial salva com sucesso!');
            setIsModalOpen(false);
            setNovoSincronismo({ titulo: '', descricao: '', link_edital: '', link_retificacao: '', link_resultado: '', status: 'aberta' });
            setCpfsAptos([]);
            carregarDados();
        } catch (error) {
            toast.error('Erro ao salvar convocação.');
            console.error(error);
        }
    };

    const handleAtualizarInscricao = async () => {
        try {
            const { error } = await supabase.from('inscricoes_convocacao')
                .update({ status_inscricao: inscricaoEditando.status_inscricao, observacao_gestor: inscricaoEditando.observacao_gestor })
                .eq('id', inscricaoEditando.id);
            if (error) throw error;
            toast.success('Status da inscrição atualizado!');
            setInscricaoEditando(null);
            carregarDados();
        } catch (error) {
            toast.error('Erro ao atualizar inscrição.');
            console.error(error);
        }
    };

    const getStatusBadge = (status) => {
        const types = {
            'aberta': 'bg-emerald-100 text-emerald-700',
            'em_analise': 'bg-amber-100 text-amber-700',
            'finalizada': 'bg-indigo-100 text-indigo-700',
            'cancelada': 'bg-red-100 text-red-700',
            'inscrito': 'bg-blue-100 text-blue-700',
            'convocado': 'bg-emerald-100 text-emerald-700',
            'desclassificado': 'bg-slate-100 text-slate-700'
        };
        const label = status ? status.replace('_', ' ').toUpperCase() : 'DESCONHECIDO';
        return <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${types[status] || 'bg-slate-200 text-slate-700'}`}>{label}</span>;
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-12">

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-600 mb-2">
                            Gestão de Convocações Especiais
                        </h1>
                        <p className="text-slate-500 text-sm max-w-2xl">
                            Crie editais paralelos ao PSS para exibir na Área do Candidato, receba e avalie as inscrições.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mt-8 border-b border-slate-200">
                    <button onClick={() => setActiveTab('editais')} className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'editais' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <div className="flex items-center gap-2"><FileText size={18} /> Editais e Vagas</div>
                        {activeTab === 'editais' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                    </button>
                    <button onClick={() => setActiveTab('inscricoes')} className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'inscricoes' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <div className="flex items-center gap-2"><List size={18} /> Inscrições Recebidas</div>
                        {activeTab === 'inscricoes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                    </button>
                </div>
            </div>

            {/* ABA: EDITAIS */}
            {activeTab === 'editais' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition">
                            <Plus size={18} /> Nova Convocação
                        </button>
                    </div>

                    {loading ? <div className="text-center text-slate-400 py-12"><RefreshCw className="animate-spin mx-auto mb-2" />Carregando...</div> : convocacoes.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-500">
                            <FileSearch size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="font-bold">Nenhuma Convocação Especial cadastrada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {convocacoes.map(c => (
                                <div key={c.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:border-indigo-200 transition">
                                    <div className="flex justify-between items-start mb-3">
                                        {getStatusBadge(c.status)}
                                        <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 line-clamp-2 min-h-[48px]">{c.titulo}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mt-2 min-h-[40px]">{c.descricao}</p>

                                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                                        {c.link_edital && <a href={c.link_edital} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline block truncate">• Edital Anexado</a>}
                                        {c.link_retificacao && <a href={c.link_retificacao} target="_blank" rel="noreferrer" className="text-xs font-bold text-amber-600 hover:underline block truncate">• Retificação Anexada</a>}
                                        {c.link_resultado && <a href={c.link_resultado} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-600 hover:underline block truncate">• Resultado Anexado</a>}
                                        {!c.link_edital && !c.link_retificacao && !c.link_resultado && <span className="text-xs text-slate-400 block">• Nenhum edital/URL</span>}
                                        {/* Optional note: we could potentially query how many aptos this convocacao has here, but for brevity we skip it */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ABA: INSCRIÇÕES */}
            {activeTab === 'inscricoes' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-slate-100">Candidato (CPF)</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Convocação</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Data</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Contato / Dados</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Status</th>
                                    <th className="p-4 font-bold border-b border-slate-100">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {loading ? <tr><td colSpan="6" className="text-center text-slate-400 py-8">Carregando inscrições...</td></tr> : inscricoes.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center text-slate-400 py-8">Nenhuma inscrição recebida ainda.</td></tr>
                                ) : inscricoes.map(insc => (
                                    <tr key={insc.id} className="hover:bg-slate-50/50 transition">
                                        <td className="p-4 font-bold text-slate-700">{insc.candidato_cpf}</td>
                                        <td className="p-4 text-slate-600 max-w-[200px] truncate">{insc.convocacoes_especiais?.titulo}</td>
                                        <td className="p-4 text-slate-500">{new Date(insc.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-slate-500 max-w-[200px] truncate" title={JSON.stringify(insc.dados_inscricao)}>
                                            {insc.dados_inscricao?.telefone || 'Telefone não info.'}
                                        </td>
                                        <td className="p-4">{getStatusBadge(insc.status_inscricao)}</td>
                                        <td className="p-4">
                                            <button onClick={() => setInscricaoEditando(insc)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition font-bold text-xs flex items-center gap-1">
                                                <Edit size={14} /> Avaliar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL: NOVA CONVOCAÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between">
                            <h2 className="text-xl font-bold">Criar Edital (Convocação)</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500"><XCircle size={24} /></button>
                        </div>
                        <form onSubmit={handleSalvarConvocacao} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Título da Convocação *</label>
                                <input required type="text" value={novoSincronismo.titulo} onChange={e => setNovoSincronismo({ ...novoSincronismo, titulo: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="Ex: 2ª Chamada Especial - Educação Especial" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Descrição</label>
                                <textarea value={novoSincronismo.descricao} onChange={e => setNovoSincronismo({ ...novoSincronismo, descricao: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 h-24" placeholder="Detalhes do público alvo..."></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Link do Edital</label>
                                    <input type="url" value={novoSincronismo.link_edital} onChange={e => setNovoSincronismo({ ...novoSincronismo, link_edital: e.target.value })} className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500" placeholder="https://" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Link Retificação</label>
                                    <input type="url" value={novoSincronismo.link_retificacao} onChange={e => setNovoSincronismo({ ...novoSincronismo, link_retificacao: e.target.value })} className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500" placeholder="https://" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Link Resultado</label>
                                    <input type="url" value={novoSincronismo.link_resultado} onChange={e => setNovoSincronismo({ ...novoSincronismo, link_resultado: e.target.value })} className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500" placeholder="https://" />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Upload Base de Candidatos Aptos (Planilha Excel / CSV)</label>
                                <div className="flex items-center gap-3">
                                    <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                                    {cpfsAptos.length > 0 && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{cpfsAptos.length} Aptos Carregados</span>}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">O sistema lerá todo o arquivo e extrairá CPFs com 11 dígitos automaticamente para a Lista de Elegíveis a este Edital.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">Cancelar</button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700">Publicar Edital</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: AVALIAR INSCRIÇÃO */}
            {inscricaoEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle className="text-indigo-500" /> Avaliar Inscrição</h2>
                            <button onClick={() => setInscricaoEditando(null)} className="text-slate-400 hover:text-red-500"><XCircle size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4 text-sm">
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <p><strong className="text-indigo-900">CPF:</strong> {inscricaoEditando.candidato_cpf}</p>
                                <p><strong className="text-indigo-900">Editais:</strong> {inscricaoEditando.convocacoes_especiais?.titulo}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Alterar Status</label>
                                <select
                                    value={inscricaoEditando.status_inscricao}
                                    onChange={e => setInscricaoEditando({ ...inscricaoEditando, status_inscricao: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
                                >
                                    <option value="inscrito">Recém Inscrito</option>
                                    <option value="em_analise">Em Análise Técnica</option>
                                    <option value="convocado">Convocado (Aprovado)</option>
                                    <option value="desclassificado">Desclassificado (Recusado)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Parecer / Observação (O Candidato verá na tela dele)</label>
                                <textarea
                                    value={inscricaoEditando.observacao_gestor || ''}
                                    onChange={e => setInscricaoEditando({ ...inscricaoEditando, observacao_gestor: e.target.value })}
                                    placeholder="Ex: Documentos validados. Aguarde e-mail."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 h-24"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button onClick={() => setInscricaoEditando(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">Voltar</button>
                                <button onClick={handleAtualizarInscricao} className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600">Salvar Mudanças</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
