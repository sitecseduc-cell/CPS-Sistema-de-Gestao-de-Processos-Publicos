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

        // Default chain behavior
        mockFrom.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ order: mockOrder });
        mockOrder.mockReturnValue({ limit: mockLimit });
        mockLimit.mockReturnValue({
            abortSignal: mockAbortSignal,
            then: (resolve) => resolve({ data: [], error: null }) // Allow await
        });

        // Mock implementation for abortSignal to allow await
        mockAbortSignal.mockReturnValue({
            then: (resolve) => resolve({ data: [], error: null })
        });

        // Handle case where abortSignal is not called (chain ends at limit)
        mockLimit.mockImplementation(() => {
            return {
                abortSignal: mockAbortSignal,
                then: (resolve) => resolve({ data: [], error: null })
            }
        });
    });

    it('fetchProcessos should apply a hard limit of 50', async () => {
        await fetchProcessos();
        expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('fetchProcessos should support AbortSignal', async () => {
        const controller = new AbortController();

        // Setup chain specifically for this test if needed, 
        // but the default mock implementation should handle it if structure matches

        await fetchProcessos({ signal: controller.signal });

        expect(mockAbortSignal).toHaveBeenCalledWith(controller.signal);
    });

    it('fetchProcessos should select only necessary columns', async () => {
        await fetchProcessos();
        expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('id, titulo, status'));
        expect(mockSelect).not.toHaveBeenCalledWith('*');
    });
});
