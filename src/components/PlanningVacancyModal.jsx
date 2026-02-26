import React, { useState } from 'react';
import { X, Save, MapPin, School, Briefcase, Hash, Building2, AlertCircle, Layers } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export default function PlanningVacancyModal({ isOpen, onClose, onSuccess, initialData }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        municipio: '',
        dre: '',
        escola: '',
        cargo: '',
        qtd: 0
    });

    React.useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else if (isOpen) {
            setFormData({ municipio: '', dre: '', escola: '', cargo: '', qtd: 0 });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'qtd' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData?.id) {
                // Update
                const { error } = await supabase.from('vagas')
                    .update({
                        municipio: formData.municipio,
                        dre: formData.dre,
                        escola: formData.escola,
                        cargo: formData.cargo,
                        qtd: formData.qtd
                    })
                    .eq('id', initialData.id);
                if (error) throw error;
                toast.success("Vaga de planejamento atualizada!");
            } else {
                // Insert
                const { error } = await supabase.from('vagas').insert([
                    {
                        municipio: formData.municipio,
                        dre: formData.dre,
                        escola: formData.escola,
                        cargo: formData.cargo,
                        qtd: formData.qtd
                    }
                ]);
                if (error) throw error;
                toast.success("Nova vaga planejada criada!");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fadeIn p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">

                {/* Header Style matched to NewVacancyModal */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Layers size={20} className="text-blue-600" />
                        {initialData ? 'Editar Vaga (Planejamento)' : 'Nova Vaga (Planejamento)'}
                    </h3>
                    <button onClick={onClose} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Município</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="text" name="municipio" required placeholder="Ex: Belém"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.municipio} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 block">DRE (Regional)</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="text" name="dre" placeholder="Ex: USE 01"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.dre} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Escola / Unidade</label>
                                <div className="relative">
                                    <School className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="text" name="escola" required placeholder="Nome da Escola"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.escola} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Cargo</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="text" name="cargo" placeholder="Professor"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.cargo} onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Qtd. Vagas</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input
                                        type="number" name="qtd" min="1" required
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.qtd} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? 'Salvando...' : <><Save size={18} /> Salvar Planejamento</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
