import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSharePanel } from '../use-share-panel';

const listDiagramMembers = vi.fn();

vi.mock('@/lib/api/diagram-members', () => ({
    listDiagramMembers: (...args: unknown[]) => listDiagramMembers(...args),
}));

describe('useSharePanel session end', () => {
    beforeEach(() => {
        listDiagramMembers.mockReset();
    });

    it('clears share members when the online route is left', async () => {
        listDiagramMembers.mockResolvedValue([
            {
                id: 1,
                email: 'a@example.com',
                role: 'editor',
            },
        ]);

        const { result, rerender } = renderHook(
            ({ diagramId }: { diagramId: string | undefined }) =>
                useSharePanel(diagramId),
            { initialProps: { diagramId: '42' as string | undefined } }
        );

        await waitFor(() => {
            expect(result.current.status).toBe('success');
        });
        expect(result.current.members).toHaveLength(1);

        rerender({ diagramId: undefined });

        await waitFor(() => {
            expect(result.current.status).toBe('idle');
        });
        expect(result.current.members).toEqual([]);
    });
});
