import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Processos from './Processos';
import * as processosService from '../services/processos';

// Mock dependencies
vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: {},
    getDocument: vi.fn(() => ({
        promise: Promise.resolve({
            numPages: 1,
            getPage: () => Promise.resolve({
                getTextContent: () => Promise.resolve({ items: [{ str: 'test' }] }),
                getViewport: () => ({ width: 100, height: 100 })
            })
        })
    }))
}));

vi.mock('../services/GeminiService', () => ({
    GeminiService: {
        analyzeDocument: vi.fn(),
        analyzeRecurso: vi.fn(),
    }
}));

// Mock service
vi.mock('../services/processos', () => ({
    fetchProcessos: vi.fn(),
    createProcesso: vi.fn(),
    updateProcesso: vi.fn(),
    deleteProcesso: vi.fn(),
}));

// Mock dependencies
vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: {},
    getDocument: vi.fn(() => ({
        promise: Promise.resolve({
            numPages: 1,
            getPage: () => Promise.resolve({
                getTextContent: () => Promise.resolve({ items: [{ str: 'test' }] }),
                getViewport: () => ({ width: 100, height: 100 })
            })
        })
    }))
}));

vi.mock('../services/GeminiService', () => ({
    GeminiService: {
        analyzeDocument: vi.fn(),
        analyzeRecurso: vi.fn(),
    }
}));

describe('Processos Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders title and button', async () => {
        // Return empty list initially
        processosService.fetchProcessos.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <Processos />
            </BrowserRouter>
        );

        expect(screen.getByText('Gerenciamento dos Processos')).toBeInTheDocument();
        expect(screen.getByText('Cadastrar Processo')).toBeInTheDocument();
    });

    it('renders list of processes after fetch', async () => {
        const mockData = [
            { id: 1, nome: 'Processo Seletivo 2025', inicio: '2025-01-01', fim: '2025-02-01', fase_atual: 'Planejamento', progresso: 10 },
            { id: 2, nome: 'Concurso 2026', inicio: '2026-03-01', fim: '2026-04-01', fase_atual: 'Publicado', progresso: 50 }
        ];

        processosService.fetchProcessos.mockResolvedValue(mockData);

        render(
            <BrowserRouter>
                <Processos />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Processo Seletivo 2025')).toBeInTheDocument();
            expect(screen.getByText('Concurso 2026')).toBeInTheDocument();
        });

        // Check status badges
        expect(screen.getByText('Planejamento')).toBeInTheDocument();
        expect(screen.getByText('Publicado')).toBeInTheDocument();
    });
});
