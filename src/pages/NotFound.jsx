import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-8 text-center animate-fadeIn">
            <div className="bg-yellow-50 p-6 rounded-full mb-6 shadow-sm ring-8 ring-yellow-50/50">
                <AlertTriangle size={64} className="text-yellow-500" />
            </div>

            <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">404</h1>
            <h2 className="text-xl font-bold text-slate-700 mb-4">Página não encontrada</h2>

            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                Ops! A página que você está procurando não existe ou foi movida.
                Verifique a URL ou volte para o início.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Voltar
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-500/20"
                >
                    <Home size={18} className="mr-2" />
                    Ir para o Início
                </button>
            </div>
        </div>
    );
}
