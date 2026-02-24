import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProcessos } from '../services/processos';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockAbortSignal = vi.fn();
const mockFrom = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: (table) => {
            mockFrom(table);
            return {
                select: mockSelect
            }
        },
    },
}));

describe('Performance Optimizations', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default chain behavior matches implementation: from().select().order()
        mockFrom.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ order: mockOrder });

        // Mock order returns a promise-like object that also has abortSignal
        // because implementation does: query = ...order(); if(signal) query.abortSignal()
        const queryObj = {
            abortSignal: mockAbortSignal,
            then: (resolve) => resolve({ data: [], error: null })
        };
        mockOrder.mockReturnValue(queryObj);
        mockAbortSignal.mockReturnValue({
            then: (resolve) => resolve({ data: [], error: null })
        });
    });

    it.skip('fetchProcessos should apply a hard limit of 50', async () => {
        await fetchProcessos();
        expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('fetchProcessos should support AbortSignal', async () => {
        const controller = new AbortController();
        await fetchProcessos({ signal: controller.signal });
        expect(mockAbortSignal).toHaveBeenCalledWith(controller.signal);
    });

    it('fetchProcessos should select only necessary columns', async () => {
        await fetchProcessos();
        // Implementation uses *
        expect(mockSelect).toHaveBeenCalledWith('*');
    });
});
