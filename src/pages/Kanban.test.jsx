import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Kanban from './Kanban';
import { supabase } from '../lib/supabaseClient';

// --- MOCKS ---

// Mock React Router
const mockLocation = { state: null };
vi.mock('react-router-dom', () => ({
    useLocation: () => mockLocation,
    useNavigate: () => vi.fn(),
    Link: ({ children }) => <div>{children}</div>
}));

// Mock Supabase Builder to support chaining
const createMockBuilder = (data = []) => {
    const builder = {};
    builder.select = vi.fn().mockReturnValue(builder);
    builder.order = vi.fn().mockReturnValue(builder);
    builder.ilike = vi.fn().mockReturnValue(builder);
    builder.eq = vi.fn().mockReturnValue(builder);
    builder.insert = vi.fn().mockReturnValue(builder);
    builder.update = vi.fn().mockReturnValue(builder);
    // To make it awaitable
    builder.then = (resolve, reject) => Promise.resolve({ data, error: null }).then(resolve, reject);
    return builder;
};

// Mock Supabase
const mockBuilder = createMockBuilder();
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => mockBuilder),
    },
}));

// Mock Sonner Toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn()
    }
}));

// Mock DND Kit (simplified)
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }) => <div>{children}</div>,
    DragOverlay: ({ children }) => <div>{children}</div>,
    closestCorners: vi.fn(),
    useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
    useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null, isDragging: false }),
}));

// Mock Components
vi.mock('../components/NewProcessModal', () => ({
    default: ({ isOpen, onClose }) => isOpen ? <div data-testid="modal">Modal Aberto <button onClick={onClose}>Fechar</button></div> : null
}));

describe('Kanban Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocation.state = null; // Reset location state
        // Reset mockBuilder implementation to default for shared tests
        // But since we might override "then" per test, we should be careful.
        // Easier to just override the implementation of 'from' in each test if needed.
    });

    it('renders Process Mode by default (Fluxo de Processos)', async () => {
        // Setup Mock Data
        const mockProcessos = [
            { id: 1, nome: 'PSS Professores 2025', fase_atual: 'Planejamento', created_at: '2025-01-01' },
            { id: 2, nome: 'PSS Merendeiras', fase_atual: 'Inscrições Abertas', created_at: '2025-01-02' }
        ];

        // Create a new builder for this test
        const testBuilder = createMockBuilder(mockProcessos);
        supabase.from.mockReturnValue(testBuilder);

        render(<Kanban />);

        await waitFor(() => {
            expect(screen.getByText('Fluxo de Processos Seletivos')).toBeInTheDocument();
        });

        // Check Columns
        expect(screen.getByText('Planejamento')).toBeInTheDocument();
        expect(screen.getByText('Inscrições Abertas')).toBeInTheDocument();

        // Check Cards
        expect(screen.getByText('PSS Professores 2025')).toBeInTheDocument();
        expect(screen.getByText('PSS Merendeiras')).toBeInTheDocument();

        // Check Button
        expect(screen.getByText('Novo PSS')).toBeInTheDocument();
    });

    it('opens Modal when clicking "Novo PSS"', async () => {
        const testBuilder = createMockBuilder([]);
        supabase.from.mockReturnValue(testBuilder);

        render(<Kanban />);

        await waitFor(() => screen.getByText('Fluxo de Processos Seletivos'));

        fireEvent.click(screen.getByText('Novo PSS'));
        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('renders Candidate Mode when processId is present', async () => {
        // Setup Location State
        mockLocation.state = { processId: 123, processName: 'PSS Teste' };

        const mockCandidatos = [
            { id: 10, nome: 'Ana Silva', status: 'Classificado', processo: 'PSS Teste' },
            { id: 11, nome: 'Bruno Souza', status: 'Homologado', processo: 'PSS Teste' }
        ];

        const testBuilder = createMockBuilder(mockCandidatos);
        supabase.from.mockReturnValue(testBuilder);

        render(<Kanban />);

        await waitFor(() => {
            // Verifica se mudou o título
            expect(screen.getByText(/Fluxo de Convocação/i)).toBeInTheDocument();
            expect(screen.getByText('PSS Teste')).toBeInTheDocument();
        });

        // Check Columns (Candidatos)
        expect(screen.getByText('Classificados')).toBeInTheDocument();
        expect(screen.getByText('Homologado')).toBeInTheDocument();

        // Check Cards
        expect(screen.getByText('Ana Silva')).toBeInTheDocument();
        expect(screen.getByText('Bruno Souza')).toBeInTheDocument();

        // Ensure "Novo PSS" button is NOT present
        expect(screen.queryByText('Novo PSS')).not.toBeInTheDocument();
    });
});
