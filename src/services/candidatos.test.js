import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCandidatos, createCandidato, updateCandidatoStatus } from './candidatos';

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: (table) => {
            mockFrom(table);
            return {
                select: mockSelect,
                insert: mockInsert,
                update: mockUpdate,
            }
        },
    },
}));

// Setup chainable mocks
const mockOrder = vi.fn();
const mockRange = vi.fn();

describe('Candidatos Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // fetchCandidatos chain: from().select().order().range()
        mockRange.mockResolvedValue({ data: [], error: null });
        mockOrder.mockReturnValue({ range: mockRange });
        mockSelect.mockReturnValue({ order: mockOrder });

        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
        });

        mockUpdate.mockReturnValue({ eq: mockEq });
        mockInsert.mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [{}], error: null })
        });
        mockEq.mockResolvedValue({ error: null });
    });

    it('fetchCandidatos should call supabase with order and pagination', async () => {
        const mockData = [{ id: 1, nome: 'Test' }];
        mockRange.mockResolvedValue({ data: mockData, error: null });

        const result = await fetchCandidatos();

        expect(mockFrom).toHaveBeenCalledWith('candidatos');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
        expect(mockRange).toHaveBeenCalledWith(0, 499); // limit=500, offset=0 => range(0, 499)
        expect(result).toEqual(mockData);
    });

    it('createCandidato should insert data', async () => {
        const newCandidate = { nome: 'New User' };
        const createdCandidate = { id: 1, ...newCandidate };

        mockInsert.mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [createdCandidate], error: null })
        });

        const result = await createCandidato(newCandidate);

        const expectedInsert = {
            nome: 'New User',
            cpf: undefined,
            email: undefined,
            telefone: undefined,
            cargo_pretendido: undefined,
            status: 'Inscrito'
        };

        expect(mockFrom).toHaveBeenCalledWith('candidatos');
        expect(mockInsert).toHaveBeenCalledWith([expectedInsert]);
        expect(result).toEqual(createdCandidate);
    });

    it('updateCandidatoStatus should update status', async () => {
        const id = 123;
        const newStatus = 'Aprovado';

        await updateCandidatoStatus(id, newStatus);

        expect(mockFrom).toHaveBeenCalledWith('candidatos');
        expect(mockUpdate).toHaveBeenCalledWith({ status: newStatus });
        expect(mockEq).toHaveBeenCalledWith('id', id);
    });
});
