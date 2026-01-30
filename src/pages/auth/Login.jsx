import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import AuthLayout from '../../layouts/AuthLayout';
import InputField from '../../components/InputField';
import Icon from '../../components/Icon';

const LoginComponent = ({ darkMode, toggleDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    const email = username;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // O redirecionamento acontece automaticamente pelo AuthContext/Routes
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.message && (error.message.includes("Email not confirmed") || error.message.includes("not confirmed"))) {
        setMessage('Por favor, verifique seu e-mail para confirmar sua conta.');
      } else {
        setMessage('E-mail ou senha inválidos.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      description="Acesse sua conta SITEC"
      icon="user"
      iconColor="text-indigo-600 bg-indigo-100"
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        {message && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm flex items-center gap-2">
            <Icon name="x" className="w-4 h-4" />
            <p>{message}</p>
          </div>
        )}

        <InputField
          id="username"
          label="E-mail"
          type="email"
          placeholder="seu.email@exemplo.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isSubmitting}
        />

        <div className="space-y-1">
          <InputField
            id="password"
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none transition-colors"
              disabled={isSubmitting}
            >
              Esqueceu sua senha?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Entrando...
            </span>
          ) : 'Entrar'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <button
            onClick={() => navigate('/register')}
            type="button"
            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            disabled={isSubmitting}
          >
            Cadastre-se aqui
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginComponent;
