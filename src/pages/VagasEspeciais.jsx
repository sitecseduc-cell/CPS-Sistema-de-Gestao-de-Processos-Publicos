import React, { useState } from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { executarAnalise } from '../utils/algoritmoConvocacao';
import {
  Upload, FileUp, CheckCircle, Search, FileDown, Eye, X, AlertTriangle, ExternalLink
} from 'lucide-react';

export default function VagasEspeciais() {
  // ... (estados anteriores)
  const [linkForms, setLinkForms] = useState(''); // Estado para o link

  // ... (funções handleUpload, processar, etc. mantidas)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* NOVO: Cabeçalho com Link do Forms */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Convocação Especial 🎯</h1>
          <p className="text-slate-500">Análise de vagas remanescentes (PSS 03/2024)</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cole o link do Google Forms aqui..."
            className="px-4 py-2 border rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-purple-500 outline-none"
            value={linkForms}
            onChange={(e) => setLinkForms(e.target.value)}
          />
          <a
            href={linkForms || "#"}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-colors ${linkForms ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            <ExternalLink size={18} /> Abrir Form
          </a>
        </div>
      </div>

      {/* ... (restante do código: Uploads, Botão Processar, Tabela) ... */}
    </div>
  );
}