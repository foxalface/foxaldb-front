import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { EMPTY_COMMENTS } from '@/lib/comments/comment-selectors';
import { INACTIVE_COMMENTS_CONTEXT } from '@/context/comments-context/comments-context';

interface AuthValue {
    user: { id: number; name: string; email: string } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

let authValue: AuthValue;
let currentDiagram: { id: string } | null;

const { listDiagramComments } = vi.hoisted(() => ({
    listDiagramComments: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authValue,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram }),
}));

vi.mock('@/lib/api/diagram-comments', () => ({
    listDiagramComments,
    createDiagramComment: vi.fn(),
    updateDiagramComment: vi.fn(),
    deleteDiagramComment: vi.fn(),
}));

import { CommentsProvider } from '@/context/comments-context/comments-provider';
import { useDiagramComments } from '../use-diagram-comments';

const comment = (
    overrides: Partial<DiagramComment> & Pick<DiagramComment, 'id'>
): DiagramComment => ({
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: `body-${overrides.id}`,
    user: { id: 1, name: 'Alice' },
    createdAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    updatedAt: `2026-01-0${overrides.id}T10:00:00.000Z`,
    ...overrides,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CommentsProvider>{children}</CommentsProvider>
);

describe('useDiagramComments', () => {
    beforeEach(() => {
        authValue = {
            user: { id: 1, name: 'Alice', email: 'a@example.com' },
            isAuthenticated: true,
            isLoading: false,
        };
        currentDiagram = { id: '42' };
        listDiagramComments.mockReset();
        listDiagramComments.mockResolvedValue([
            comment({ id: 2 }),
            comment({ id: 1 }),
        ]);
    });

    it('returns provider values with ordered comments', async () => {
        const { result } = renderHook(() => useDiagramComments(), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        expect(result.current.isActive).toBe(true);
        expect(result.current.diagramId).toBe('42');
        expect(result.current.comments.map((c) => c.id)).toEqual([1, 2]);
        expect(result.current.error).toBeNull();
        expect(typeof result.current.reload).toBe('function');
    });

    it('outside Provider returns stable inactive fallback', () => {
        const first = renderHook(() => useDiagramComments());
        const second = renderHook(() => useDiagramComments());

        expect(first.result.current.isActive).toBe(false);
        expect(first.result.current.status).toBe('idle');
        expect(first.result.current.diagramId).toBeNull();
        expect(first.result.current.comments).toBe(EMPTY_COMMENTS);
        expect(first.result.current.error).toBeNull();

        expect(first.result.current.comments).toBe(
            second.result.current.comments
        );
        expect(first.result.current.reload).toBe(
            INACTIVE_COMMENTS_CONTEXT.reload
        );
        expect(first.result.current.reload).toBe(second.result.current.reload);
    });

    it('reload reference is stable across renders when practical', async () => {
        const { result, rerender } = renderHook(() => useDiagramComments(), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('ready');
        });

        const firstReload = result.current.reload;
        rerender();
        expect(result.current.reload).toBe(firstReload);
    });
});
