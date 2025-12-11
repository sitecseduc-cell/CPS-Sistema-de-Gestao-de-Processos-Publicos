import React from 'react';
import { Eye } from 'lucide-react';

export default function CandidateTable({ candidates, onSelect }) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        Nenhum candidato encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidato / CPF</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Processo Seletivo</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo / Localidade</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {candidates.map((cand) => (
            <tr key={cand.id} className="hover:bg-blue-50/40 transition-colors group cursor-pointer" onClick={() => onSelect(cand)}>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs mr-3 border border-slate-200">
                    {cand.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{cand.nome}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{cand.cpf}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 font-medium">{cand.processo}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                <span className="block font-medium text-slate-800">{cand.cargo}</span>
                <span className="text-xs text-slate-400 flex items-center mt-0.5">{cand.localidade}</span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  cand.status === 'Classificado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                  cand.status === 'Desclassificado' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {cand.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  <Eye size={16}/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}