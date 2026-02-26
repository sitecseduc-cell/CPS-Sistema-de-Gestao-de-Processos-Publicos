import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Login from './Login';

// Mock do Supabase para evitar chamadas reais
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({ select: vi.fn().mockResolvedValue({ data: [], error: null }) })),
        auth: { signInWithPassword: vi.fn(), signUp: vi.fn() },
        functions: { invoke: vi.fn() },
        channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn() })),
        removeChannel: vi.fn(),
    },
}));

// Mock do ImmersiveLoader (evita animações pesadas no JSDOM)
vi.mock('../components/ImmersiveLoader', () => ({
    default: () => <div data-testid="immersive-loader">Loading...</div>,
}));

// Mock do AuthContext
const mocks = vi.hoisted(() => {
    return {
        signIn: vi.fn((...args) => console.log('MOCK SIGNIN CALLED:', args)),
        signUp: vi.fn(),
        resetPassword: vi.fn()
    };
});

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        signIn: mocks.signIn,
        signUp: mocks.signUp,
        resetPassword: mocks.resetPassword,
        loading: false
    })
}));

const renderLogin = () => {
    return render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );
};

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders login form by default', async () => {
        renderLogin();
        expect(await screen.findByText('Bem-vindo de volta', {}, { timeout: 5000 })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('nome@exemplo.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /acessar/i })).toBeInTheDocument();
    }, 15000);

    test('validates incorrect email', async () => {
        const user = userEvent.setup();
        renderLogin();
        const emailInput = screen.getByPlaceholderText('nome@exemplo.com');
        const form = emailInput.closest('form');

        // Digita um email inválido e força o submit do formulário diretamente
        // (evita o bloqueio nativo do browser para input type=email)
        await user.type(emailInput, 'invalid-email');
        fireEvent.submit(form);

        expect(await screen.findByText(/E-mail inv/i)).toBeInTheDocument();
    });

    test('calls signIn on valid submit', async () => {
        const user = userEvent.setup();
        renderLogin();
        const emailInput = screen.getByPlaceholderText('nome@exemplo.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitBtn = screen.getByRole('button', { name: /acessar/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mocks.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    test('switches to register view', async () => {
        const user = userEvent.setup();
        renderLogin();
        const registerLink = screen.getByRole('button', { name: /cadastre-se/i });
        await user.click(registerLink);

        // 'Criar Conta' aparece no <h1> e no botão submit — usamos getAllByText
        // e verificamos que pelo menos um elemento está presente
        const criarContaEls = await screen.findAllByText('Criar Conta');
        expect(criarContaEls.length).toBeGreaterThan(0);
        expect(screen.getByPlaceholderText('Digite seu nome')).toBeInTheDocument();
    });
});
