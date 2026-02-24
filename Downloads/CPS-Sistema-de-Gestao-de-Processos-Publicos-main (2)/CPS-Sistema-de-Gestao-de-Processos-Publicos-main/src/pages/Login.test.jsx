import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import Login from './Login';

// Mock the AuthContext module
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

    test('renders login form by default', () => {
        renderLogin();
        expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('nome@exemplo.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /acessar/i })).toBeInTheDocument();
    });

    test('validates incorrect email', async () => {
        const user = userEvent.setup();
        renderLogin();
        const emailInput = screen.getByPlaceholderText('nome@exemplo.com');
        const submitBtn = screen.getByRole('button', { name: /acessar/i });

        await user.type(emailInput, 'invalid-email');
        await user.click(submitBtn);

        expect(await screen.findByText(/E-mail inv.*lido/i)).toBeInTheDocument();
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

        expect(await screen.findByText('Criar Conta')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Digite seu nome')).toBeInTheDocument();
    });
});
