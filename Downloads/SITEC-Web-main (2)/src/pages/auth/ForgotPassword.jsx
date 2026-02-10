import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import InputField from '../../components/InputField';

const ForgotPasswordComponent = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sendPasswordResetEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await sendPasswordResetEmail(email);

      setIsSubmitting(false);

      setIsSubmitting(false);
      setMessage({ type: 'success', text: 'Link de recuperação enviado! Verifique seu e-mail (e a caixa de spam).' });
      setEmail('');
    } catch (error) {
      setIsSubmitting(false);
      setMessage({ type: 'success', text: 'Se um e-mail correspondente for encontrado, um link de recuperação será enviado.' });
      console.error("Erro ao enviar email de recuperação:", error);
    }
  };

  return (
    <AuthLayout title="Recuperar Senha" description="Insira seu e-mail para receber o link" icon="keyRound" iconColor="text-amber-500">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message.text && (
          <div role="alert" className={`${message.type === 'success' ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 rounded-md text-sm text-center`}>
            <p>{message.text}</p>
          </div>
        )}
        <InputField
          id="email"
          label="Email Cadastrado"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          placeholder="seu.email@exemplo.com"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Lembrou sua senha?{' '}
        <button
          onClick={() => navigate('/login')}
          type="button"
          className="text-indigo-600 hover:text-indigo-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
          disabled={isSubmitting}
        >
          Voltar para o Login
        </button>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordComponent;
