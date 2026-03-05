import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Lock, Mail, User, AlertCircle, ArrowRight, ArrowLeft, Loader2, Hexagon, FlaskConical,
  GraduationCap, Briefcase, FileText, Bell, CheckCircle, Search
} from 'lucide-react';
import ImmersiveLoader from '../components/ImmersiveLoader';
import { DEMO_CREDENTIALS } from '../demo/demoData';

// --- VALIDATION AND FORMS ---
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schemas Zod
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

// Schema simples para candidato logar/buscar
const candidatoSearchSchema = z.object({
  cpf: z.string().min(11, 'CPF inválido'),
});


export default function Login() {
  const [portalMode, setPortalMode] = useState('gestao'); // 'gestao' | 'candidato'

  // States of Gestão Portal
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'

  // States of Candidato Portal
  const [candidateTab, setCandidateTab] = useState('convocacao'); // 'convocacao' | 'pss'

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const currentSchema = portalMode === 'gestao'
    ? (view === 'login' ? loginSchema : (view === 'register' ? registerSchema : forgotSchema))
    : candidatoSearchSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    setValue
  } = useForm({
    resolver: zodResolver(currentSchema),
    mode: 'onSubmit'
  });

  const fillDemoCredentials = () => {
    setValue('email', DEMO_CREDENTIALS.email);
    setValue('password', DEMO_CREDENTIALS.password);
  };

  const changeView = (newView) => {
    setView(newView);
    setGlobalError(null);
    setSuccessMsg('');
    reset();
    clearErrors();
  };

  const changePortalMode = (mode) => {
    setPortalMode(mode);
    setGlobalError(null);
    setSuccessMsg('');
    reset();
    clearErrors();
  };

  const onSubmitGestao = async (data) => {
    setLoading(true);
    setGlobalError(null);
    setSuccessMsg('');

    try {
      if (view === 'register') {
        await signUp(data.email, data.password, data.name);
        setSuccessMsg('Conta criada! Verifique seu e-mail ou faça login.');
        setTimeout(() => changeView('login'), 3000);
      }
      else if (view === 'forgot') {
        await resetPassword(data.email);
        setSuccessMsg('Link de recuperação enviado! Verifique sua caixa de entrada.');
      }
      else {
        await signIn(data.email, data.password);
        navigate('/');
      }
    } catch (err) {
      let msg = err.message;
      if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
      if (msg.includes('Email not confirmed')) msg = 'Verifique seu e-mail antes de entrar.';
      setGlobalError(msg || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCandidato = async (data) => {
    // Simular busca de CPF para candidato
    setLoading(true);
    setGlobalError(null);

    setTimeout(() => {
      setLoading(false);
      setGlobalError('Integração com o banco de dados de candidatos pendente de desenvolvimento.');
    }, 1500);
  };

  const onSubmit = portalMode === 'gestao' ? onSubmitGestao : onSubmitCandidato;

  if (loading) {
    return <ImmersiveLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50 dark:bg-slate-900">

      {/* Animated Background Decor */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-float transition-colors duration-700 ${portalMode === 'gestao' ? 'bg-indigo-500/20' : 'bg-emerald-500/20'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-float transition-colors duration-700 ${portalMode === 'gestao' ? 'bg-fuchsia-500/20' : 'bg-teal-500/20'}`} style={{ animationDelay: '2s' }}></div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 w-full z-10 mt-4 mb-4">
        <div className={`w-full max-w-md ${portalMode === 'candidato' ? 'max-w-xl' : ''} glass-card p-6 md:p-8 relative border shadow-2xl transition-all duration-500 ${portalMode === 'gestao' ? 'border-indigo-200/50 dark:border-indigo-500/20' : 'border-emerald-200/50 dark:border-emerald-500/20'}`}>

          {/* Portal Switcher Toggle */}
          <div className="flex p-1 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl mb-8 border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden shadow-inner">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-2px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-all duration-300 ease-out`}
              style={{ left: portalMode === 'gestao' ? '4px' : 'calc(50% - 2px)' }}
            />
            <button
              onClick={() => changePortalMode('gestao')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold relative z-10 transition-colors ${portalMode === 'gestao' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Briefcase size={16} />
              Gestão (Servidor)
            </button>
            <button
              onClick={() => changePortalMode('candidato')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold relative z-10 transition-colors ${portalMode === 'candidato' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <GraduationCap size={16} />
              Área do Candidato
            </button>
          </div>

          {/* ============================================================ */}
          {/* ===================== ÁREA DE GESTÃO ======================= */}
          {/* ============================================================ */}
          {portalMode === 'gestao' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-2xl bg-white/50 dark:bg-white/10 shadow-lg shadow-indigo-500/10 mb-5 group hover:scale-105 transition-all duration-300">
                  <Hexagon className="h-10 w-10 text-indigo-600 dark:text-indigo-400 fill-indigo-500/10" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
                  {view === 'register' ? 'Criar Conta' : view === 'forgot' ? 'Recuperação' : 'Bem-vindo de volta'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
                  {view === 'register' ? 'Junte-se à nossa plataforma' : view === 'forgot' ? 'Redefina sua senha de acesso' : 'Acesse o portal do servidor'}
                </p>
              </div>

              {globalError && (
                <div className="mb-6 p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                  <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                  {globalError}
                </div>
              )}

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center animate-fadeIn">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fadeIn">
                {/* Nome (Register Only) */}
                {view === 'register' && (
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        {...register('name')}
                        type="text"
                        className={`input-glass w-full pl-11 py-2.5 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                        placeholder="Digite seu nome"
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.name.message}</p>}
                  </div>
                )}

                {/* Email (All) */}
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      {...register('email')}
                      type="email"
                      className={`input-glass w-full pl-11 py-2.5 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                      placeholder="nome@exemplo.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.email.message}</p>}
                </div>

                {/* Password (Login & Register) */}
                {view !== 'forgot' && (
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        {...register('password')}
                        type="password"
                        className={`input-glass w-full pl-11 py-2.5 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.password.message}</p>}
                  </div>
                )}

                {/* Confirm Password (Register Only) */}
                {view === 'register' && (
                  <div className="group animate-fadeIn">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        {...register('confirmPassword')}
                        type="password"
                        className={`input-glass w-full pl-11 py-2.5 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.confirmPassword.message}</p>}
                  </div>
                )}

                {/* Forgot Password Link */}
                {view === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => changeView('forgot')} className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold hover:underline transition-all">
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-glass w-full py-3 flex items-center justify-center text-base mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center gap-2">
                    {view === 'login' ? 'Acessar Gestão' : view === 'register' ? 'Criar Conta' : 'Enviar Link'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </form>

              {/* Demo/Homologação Access */}
              {view === 'login' && (
                <div className="mt-6 pt-5 border-t border-amber-200/60 dark:border-amber-800/30">
                  <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-amber-400 p-1 rounded-md">
                        <FlaskConical size={14} className="text-white" />
                      </span>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        Acesso de Homologação
                      </p>
                    </div>
                    <div className="text-xs font-mono bg-white/70 dark:bg-black/20 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 mb-3 space-y-1">
                      <div><span className="text-slate-400">e-mail: </span>{DEMO_CREDENTIALS.email}</div>
                      <div><span className="text-slate-400">senha: </span>{DEMO_CREDENTIALS.password}</div>
                    </div>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <FlaskConical size={13} />
                      Preencher Credenciais Demo
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Navigation */}
              <div className="mt-8 pt-5 border-t border-slate-200/60 dark:border-white/10 text-center">
                {view === 'login' ? (
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Ainda não tem conta?{' '}
                    <button onClick={() => changeView('register')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                      Cadastre-se
                    </button>
                  </p>
                ) : (
                  <button onClick={() => changeView('login')} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold flex items-center justify-center mx-auto gap-2 text-sm transition-colors">
                    <ArrowLeft size={16} /> Voltar para Acesso
                  </button>
                )}
              </div>
            </div>
          )}


          {/* ============================================================ */}
          {/* ===================== ÁREA DO CANDIDATO ======================= */}
          {/* ============================================================ */}
          {portalMode === 'candidato' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10 mb-3 group hover:scale-105 transition-all duration-300">
                  <GraduationCap className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  Serviços ao Candidato
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Acompanhe seus processos e convocações especiais
                </p>
              </div>

              {/* Candidate Tabs */}
              <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setCandidateTab('convocacao')}
                  className={`pb-2 px-2 text-sm font-semibold transition-all border-b-2 ${candidateTab === 'convocacao' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                  Convocação Especial
                </button>
                <button
                  onClick={() => setCandidateTab('pss')}
                  disabled
                  className="pb-2 px-2 text-sm font-semibold transition-all border-b-2 border-transparent text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                  title="Em breve"
                >
                  Processo Seletivo (PSS)
                </button>
              </div>

              {candidateTab === 'convocacao' && (
                <div className="animate-fadeIn">

                  {/* Alerta Crítico */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 shadow-sm">
                    <div className="flex gap-3">
                      <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">Aviso Importante</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed font-medium">
                          Só poderão ser inscritos candidatos que já constam no processo seletivo em vigor (ex: PSS SEDUC).
                          <strong> Caso seus dados não sejam encontrados em nosso banco de dados, você não conseguirá concluir a inscrição.</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Links Rápidos do Edital */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group shadow-sm">
                      <FileText size={18} className="text-slate-400 group-hover:text-emerald-500 mb-1.5" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Ver Edital</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group shadow-sm">
                      <Bell size={18} className="text-slate-400 group-hover:text-emerald-500 mb-1.5" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 text-center">Retificações</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group shadow-sm">
                      <CheckCircle size={18} className="text-slate-400 group-hover:text-emerald-500 mb-1.5" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Resultados</span>
                    </button>
                  </div>

                  {globalError && (
                    <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center text-red-600 dark:text-red-400 text-sm animate-fadeIn">
                      <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                      {globalError}
                    </div>
                  )}

                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-inner">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <Hexagon size={14} className="text-emerald-500 fill-emerald-500/20" />
                      Inscrição em Convocação Especial
                    </h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">CPF</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            {...register('cpf')}
                            type="text"
                            placeholder="Somente números"
                            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm shadow-sm"
                          />
                        </div>
                        {errors.cpf && <p className="text-red-500 text-xs mt-1.5 ml-1 font-semibold">{errors.cpf.message}</p>}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                      >
                        Iniciar Inscrição
                      </button>
                    </form>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => navigate('/consulta-publica')}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    >
                      <Search size={16} className="text-emerald-500" />
                      Consultar Processo / Situação
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer System Info & Credits */}
      <div className="w-full pb-6 pt-2 text-center flex flex-col items-center justify-center gap-1.5 relative z-20">
        <span className="text-[10px] text-slate-400/80 font-semibold">
          &copy; {new Date().getFullYear()} Sistema de Gestão de Processos Seletivos &bull; Gov. Pará
        </span>
        <span className="text-[10px] text-slate-500/70 tracking-widest uppercase font-bold drop-shadow-sm">
          Desenvolvido por Luiz Henrique Barbosa & Luan Giulliano
        </span>
      </div>
    </div>
  );
}