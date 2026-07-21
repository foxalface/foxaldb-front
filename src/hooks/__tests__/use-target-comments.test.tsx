import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { EMPTY_COMMENTS } from '@/lib/comments/comment-selectors';

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
import { useTargetComments } from '../use-target-comments';

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

describe('useTargetComments', () => {
    beforeEach(() => {
        authValue = {
            user: { id: 1, name: 'Alice', email: 'a@example.com' },
            isAuthenticated: true,
            isLoading: false,
        };
        currentDiagram = { id: '42' };
        listDiagramComments.mockReset();
        listDiagramComments.mockResolvedValue([
            comment({
                id: 1,
                targetType: 'diagram',
                targetId: null,
                createdAt: '2026-01-01T10:00:00.000Z',
            }),
            comment({
                id: 2,
                targetType: 'table',
                targetId: 't1',
                createdAt: '2026-01-02T10:00:00.000Z',
            }),
            comment({
                id: 3,
                targetType: 'field',
                targetId: 'f1',
                createdAt: '2026-01-03T10:00:00.000Z',
            }),
            comment({
                id: 4,
                targetType: 'relationship',
                targetId: 'r1',
                createdAt: '2026-01-04T10:00:00.000Z',
            }),
            comment({
                id: 5,
                targetType: 'table',
                targetId: 't2',
                createdAt: '2026-01-05T10:00:00.000Z',
            }),
            comment({
                id: 6,
                targetType: 'table',
                targetId: 't1',
                createdAt: '2026-01-06T10:00:00.000Z',
            }),
        ]);
    });

    it('filters diagram comments', async () => {
        const { result } = renderHook(
            () =>
                useTargetComments({
                    targetType: 'diagram',
                    targetId: null,
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        expect(result.current.map((c) => c.id)).toEqual([1]);
    });

    it('filters table comments and excludes same type with different ID', async () => {
        const { result } = renderHook(
            () =>
                useTargetComments({
                    targetType: 'table',
                    targetId: 't1',
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current).toHaveLength(2);
        });

        expect(result.current.map((c) => c.id)).toEqual([2, 6]);
        expect(result.current.every((c) => c.targetId === 't1')).toBe(true);
    });

    it('filters field comments', async () => {
        const { result } = renderHook(
            () =>
                useTargetComments({
                    targetType: 'field',
                    targetId: 'f1',
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        expect(result.current[0]?.id).toBe(3);
    });

    it('filters relationship comments', async () => {
        const { result } = renderHook(
            () =>
                useTargetComments({
                    targetType: 'relationship',
                    targetId: 'r1',
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        expect(result.current[0]?.id).toBe(4);
    });

    it('preserves chronological order', async () => {
        const { result } = renderHook(
            () =>
                useTargetComments({
                    targetType: 'table',
                    targetId: 't1',
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current).toHaveLength(2);
        });

        expect(result.current.map((c) => c.id)).toEqual([2, 6]);
    });

    it('returns exact EMPTY_COMMENTS when no match', async () => {
        const { result } = renderHook(
            () =>
                useTargetComments({
                    targetType: 'table',
                    targetId: 'missing',
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(listDiagramComments).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(result.current).toBe(EMPTY_COMMENTS);
        });
    });

    it('memoizes result for unchanged inputs', async () => {
        const { result, rerender } = renderHook(
            () =>
                useTargetComments({
                    targetType: 'field',
                    targetId: 'f1',
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        const first = result.current;
        rerender();
        expect(result.current).toBe(first);
    });
});
