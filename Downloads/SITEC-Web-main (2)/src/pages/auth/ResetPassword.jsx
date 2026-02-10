import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import InputField from '../../components/InputField';
import { supabase } from '../../supabaseClient';

const ResetPasswordComponent = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSessionValid, setIsSessionValid] = useState(true);

    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session (user clicked link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setIsSessionValid(false);
                setMessage('Link inválido ou expirado. Por favor, solicite uma nova recuperação de senha.');
            }
        });

        // Listen for auth state changes (in case session is recovered late)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsSessionValid(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setMessage('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setIsSubmitting(true);

        try {
            await resetPassword(password);
            setMessage('Senha atualizada com sucesso! Redirecionando para o login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            setMessage('Erro ao atualizar senha: ' + error.message);
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Redefinir Senha"
            description="Crie uma nova senha para sua conta"
            icon="keyRound"
            iconColor="text-emerald-500"
        >
            {!isSessionValid ? (
                <div className="text-center space-y-4">
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                        {message || 'Sessão inválida para redefinição de senha.'}
                    </div>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        Solicitar novo link
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <InputField
                        id="password"
                        label="Nova Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua nova senha"
                        required
                        disabled={isSubmitting}
                    />

                    <InputField
                        id="confirmPassword"
                        label="Confirmar Nova Senha"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        required
                        disabled={isSubmitting}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Atualizando...' : 'Atualizar Senha'}
                    </button>
                </form>
            )}
        </AuthLayout>
    );
};

export default ResetPasswordComponent;
