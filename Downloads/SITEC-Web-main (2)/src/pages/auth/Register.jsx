import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import AuthLayout from '../../layouts/AuthLayout';
import InputField from '../../components/InputField';
import SelectField from '../../components/SelectField';
import Icon from '../../components/Icon';

const RegisterComponent = ({ darkMode, toggleDarkMode }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    registration: '',
    email: '',
    password: '',
    confirmPassword: '',
    sector: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const sectors = ["TI", "Recursos Humanos", "Financeiro", "Administrativo", "Pedagógico"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar usuário no Supabase Auth com metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'Analista',
            sector: formData.sector,
            registration: formData.registration,
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        // Tentar criar o perfil manualmente caso a trigger falhe ou demore
        console.log("Tentando criar perfil manual...");
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            full_name: formData.fullName,
            email: formData.email,
            role: 'Analista',
            sector: formData.sector,
            // avatar: '', // Opcional
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileError) {
          console.warn("Aviso: Falha ao criar perfil manual (pode ter sido criado pela trigger):", profileError);
          // Não lançamos erro aqui para não interromper o fluxo se a trigger tiver funcionado
        } else {
          console.log("Perfil criado/atualizado manualmente com sucesso.");
        }
      }

      setIsSubmitting(false);
      setMessage({ type: 'success', text: 'Conta criada! Verifique seu e-mail para ativar sua conta.' });

      setTimeout(() => navigate('/login'), 2000);

    } catch (error) {
      setIsSubmitting(false);
      if (error.message?.includes('already registered')) {
        setMessage({ type: 'error', text: 'Este e-mail já está em uso.' });
      } else {
        setMessage({ type: 'error', text: `Erro: ${error.message || 'Falha desconhecida'}` });
      }
      console.error('Erro no registro:', error);
    }
  };

  return (
    <AuthLayout
      title="Criar Conta"
      description="Junte-se à plataforma SITEC"
      icon="userPlus"
      iconColor="text-emerald-600 bg-emerald-100"
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        {message.text && (
          <div role="alert" className={`border-l-4 p-4 rounded-md text-sm flex items-center gap-2 ${message.type === 'error'
            ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            }`}>
            <Icon name={message.type === 'error' ? 'x' : 'shieldCheck'} className="w-4 h-4" />
            <p>{message.text}</p>
          </div>
        )}

        <InputField id="fullName" name="fullName" label="Nome Completo" type="text" value={formData.fullName} onChange={handleChange} disabled={isSubmitting} required />
        <InputField id="registration" name="registration" label="Matrícula" type="text" value={formData.registration} onChange={handleChange} disabled={isSubmitting} required />

        <SelectField id="sector" name="sector" label="Setor" value={formData.sector} onChange={handleChange} disabled={isSubmitting} required>
          <option value="">Selecione seu setor</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </SelectField>

        <InputField id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} disabled={isSubmitting} required />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField id="password" name="password" label="Senha" type="password" value={formData.password} onChange={handleChange} disabled={isSubmitting} required />
          <InputField id="confirmPassword" name="confirmPassword" label="Confirmar" type="password" value={formData.confirmPassword} onChange={handleChange} disabled={isSubmitting} required />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-2"
        >
          {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <button
            onClick={() => navigate('/login')}
            type="button"
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            disabled={isSubmitting}
          >
            Faça login
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterComponent;
