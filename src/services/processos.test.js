import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProcessos, createProcesso, updateProcesso, deleteProcesso } from './processos';

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: (table) => {
            mockFrom(table);
            return {
                select: mockSelect,
                insert: mockInsert,
                update: mockUpdate,
                delete: mockDelete,
            }
        },
    },
}));

// Setup chainable mocks
mockSelect.mockReturnThis();
mockInsert.mockReturnThis();
mockUpdate.mockReturnThis();
mockDelete.mockReturnThis();

describe('Processos Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default chain behavior
        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
            delete: mockDelete,
        });

        // Chain structure for fetch: from().select().order()
        mockSelect.mockReturnValue({ order: mockOrder });
        // Return promise from order()
        mockOrder.mockResolvedValue({ data: [{ id: 1, nome: 'Processo Test' }], error: null });

        // Chain structure for create: from().insert().select()
        mockInsert.mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{}], error: null }) });

        // Chain structure for update: from().update().eq().select()
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{}], error: null }) });

        // Chain structure for delete: from().delete().eq()
        mockDelete.mockReturnValue({ eq: mockEq });
        mockEq.mockResolvedValue({ error: null });

    });

    it('fetchProcessos should fetch all processes ordered by date', async () => {
        await fetchProcessos();

        expect(mockFrom).toHaveBeenCalledWith('processos');
        // Verifica colunas específicas (performance: evita select('*'))
        expect(mockSelect).toHaveBeenCalledWith(
            'id, nome, inicio, fim, fase_atual, progresso, ai_metadata, created_at'
        );
        expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('createProcesso should insert new process', async () => {
        const inputData = { nome: 'New Process' };
        const returnData = { id: 1, ...inputData, fase_atual: 'Planejamento' };

        const mockChainSelect = vi.fn().mockResolvedValue({ data: [returnData], error: null });
        mockInsert.mockReturnValue({ select: mockChainSelect });

        const result = await createProcesso(inputData);

        expect(mockFrom).toHaveBeenCalledWith('processos');
        expect(mockInsert).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                ...inputData,
                fase_atual: 'Planejamento',
                progresso: 0
            })
        ]));
        expect(result).toEqual(returnData);
    });

    it('updateProcesso should update existing process', async () => {
        const id = 1;
        const updateData = { nome: 'Updated' };
        const returnData = { id, ...updateData };

        const mockChainSelect = vi.fn().mockResolvedValue({ data: [returnData], error: null });
        mockUpdate.mockReturnValue({ eq: mockEq });
        mockEq.mockReturnValue({ select: mockChainSelect });

        // Note: In implementation, updateProcesso uses .eq('id', id).select()
        // My mockSetup: update().eq() returns { select: ... }

        const result = await updateProcesso(id, updateData);

        expect(mockFrom).toHaveBeenCalledWith('processos');
        expect(mockUpdate).toHaveBeenCalledWith(updateData);
        expect(mockEq).toHaveBeenCalledWith('id', id);
        expect(result).toEqual(returnData);
    });

    it('deleteProcesso should remove process', async () => {
        const id = 99;

        await deleteProcesso(id);

        expect(mockFrom).toHaveBeenCalledWith('processos');
        expect(mockDelete).toHaveBeenCalled();
        expect(mockEq).toHaveBeenCalledWith('id', id);
    });
});
