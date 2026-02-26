import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Relatorios from './Relatorios';

vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        ResponsiveContainer: ({ children }) => <div className="recharts-responsive-container" style={{ width: 800, height: 600 }}>{children}</div>,
    };
});

// Mock xlsx
vi.mock('xlsx', () => ({
    utils: {
        json_to_sheet: vi.fn(),
        book_new: vi.fn(),
        book_append_sheet: vi.fn(),
    },
    write: vi.fn(() => new ArrayBuffer(8)), // Retorna dummy buffer
}));

// Mock Supabase
const mockSelect = vi.fn();
const mockCsv = vi.fn();
const mockFrom = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: (table) => {
            mockFrom(table);
            return {
                select: (cols) => {
                    mockSelect(cols);
                    return {
                        csv: mockCsv,
                        // For PDF which just awaits select()
                        then: (resolve) => resolve({ data: [{ col: 'val' }], error: null })
                    }
                }
            }
        },
    },
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Relatorios Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        mockFrom.mockReturnValue({
            select: mockSelect
        });
        mockSelect.mockReturnValue({
            csv: mockCsv
        });
        // mockCsv behavior
        mockCsv.mockResolvedValue({ data: 'col1,col2\nval1,val2', error: null });
    });

    it('renders export buttons', () => {
        render(<Relatorios />);
        expect(screen.getByText('Central de Relatórios')).toBeInTheDocument();
        // Check for specific buttons
        expect(screen.getAllByText(/CSV/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Excel/i).length).toBeGreaterThan(0);
    });

    it('triggers CSV export when clicked', async () => {
        render(<Relatorios />);

        // Click the first CSV button (Candidatos)
        const csvButtons = screen.getAllByText(/CSV/i);
        fireEvent.click(csvButtons[0]);

        await waitFor(() => {
            expect(mockFrom).toHaveBeenCalledWith('candidatos');
            expect(mockCsv).toHaveBeenCalled();
        });
    });

    it('triggers Excel export when clicked', async () => {
        render(<Relatorios />);

        // Click the first Excel button (Candidatos)
        const excelButtons = screen.getAllByText(/Excel/i);
        // Botão na "Base de Candidatos" (primeiro na UI)
        fireEvent.click(excelButtons[0]);

        await waitFor(() => {
            expect(mockFrom).toHaveBeenCalledWith('candidatos');
            // Como mockamos a resposta do .then() do Supabase pra voltar "val", não há crashe e o loading = false.
            expect(mockSelect).toHaveBeenCalledWith('*');
        });
    });
});
