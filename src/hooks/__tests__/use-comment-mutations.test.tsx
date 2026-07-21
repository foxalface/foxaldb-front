import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { INACTIVE_COMMENTS_CONTEXT } from '@/context/comments-context/comments-context';

interface AuthValue {
    user: { id: number; name: string; email: string } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

let authValue: AuthValue;
let currentDiagram: { id: string } | null;

const {
    listDiagramComments,
    createDiagramComment,
    updateDiagramComment,
    deleteDiagramComment,
} = vi.hoisted(() => ({
    listDiagramComments: vi.fn(),
    createDiagramComment: vi.fn(),
    updateDiagramComment: vi.fn(),
    deleteDiagramComment: vi.fn(),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authValue,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram }),
}));

vi.mock('@/lib/api/diagram-comments', () => ({
    listDiagramComments,
    createDiagramComment,
    updateDiagramComment,
    deleteDiagramComment,
}));

import { CommentsProvider } from '@/context/comments-context/comments-provider';
import { useCommentMutations } from '../use-comment-mutations';
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

describe('useCommentMutations', () => {
    beforeEach(() => {
        authValue = {
            user: { id: 1, name: 'Alice', email: 'a@example.com' },
            isAuthenticated: true,
            isLoading: false,
        };
        currentDiagram = { id: '42' };
        listDiagramComments.mockReset();
        createDiagramComment.mockReset();
        updateDiagramComment.mockReset();
        deleteDiagramComment.mockReset();
        listDiagramComments.mockResolvedValue([]);
    });

    it('exposes provider mutation callbacks', async () => {
        const created = comment({ id: 3, body: 'hi' });
        createDiagramComment.mockResolvedValue(created);

        const { result } = renderHook(
            () => ({
                mutations: useCommentMutations(),
                comments: useDiagramComments(),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.comments.status).toBe('ready');
        });

        let returned!: DiagramComment;
        await act(async () => {
            returned = await result.current.mutations.createComment({
                targetType: 'diagram',
                targetId: null,
                body: 'hi',
            });
        });

        expect(returned).toBe(created);
        expect(typeof result.current.mutations.updateComment).toBe('function');
        expect(typeof result.current.mutations.deleteComment).toBe('function');
    });

    it('outside Provider rejects with fresh inactive Errors', async () => {
        const { result } = renderHook(() => useCommentMutations());

        expect(result.current.createComment).toBe(
            INACTIVE_COMMENTS_CONTEXT.createComment
        );
        expect(result.current.updateComment).toBe(
            INACTIVE_COMMENTS_CONTEXT.updateComment
        );
        expect(result.current.deleteComment).toBe(
            INACTIVE_COMMENTS_CONTEXT.deleteComment
        );

        let createErrorA!: unknown;
        let createErrorB!: unknown;
        let updateError!: unknown;
        let deleteError!: unknown;

        try {
            await result.current.createComment({
                targetType: 'diagram',
                targetId: null,
                body: 'x',
            });
        } catch (error) {
            createErrorA = error;
        }

        try {
            await result.current.createComment({
                targetType: 'diagram',
                targetId: null,
                body: 'y',
            });
        } catch (error) {
            createErrorB = error;
        }

        try {
            await result.current.updateComment(1, { body: 'x' });
        } catch (error) {
            updateError = error;
        }

        try {
            await result.current.deleteComment(1);
        } catch (error) {
            deleteError = error;
        }

        expect(createErrorA).toBeInstanceOf(Error);
        expect(createErrorB).toBeInstanceOf(Error);
        expect(updateError).toBeInstanceOf(Error);
        expect(deleteError).toBeInstanceOf(Error);

        expect((createErrorA as Error).message).toBe(
            'Diagram comments are not active'
        );
        expect((createErrorB as Error).message).toBe(
            'Diagram comments are not active'
        );
        expect((updateError as Error).message).toBe(
            'Diagram comments are not active'
        );
        expect((deleteError as Error).message).toBe(
            'Diagram comments are not active'
        );

        expect(createErrorA).not.toBe(createErrorB);
        expect(createErrorA).not.toBe(updateError);
        expect(createErrorA).not.toBe(deleteError);
        expect(updateError).not.toBe(deleteError);
    });

    it('propagates the same error object from the API', async () => {
        const apiError = new Error('mutation boom');
        createDiagramComment.mockRejectedValue(apiError);

        const { result } = renderHook(
            () => ({
                mutations: useCommentMutations(),
                comments: useDiagramComments(),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.comments.status).toBe('ready');
        });

        await expect(
            result.current.mutations.createComment({
                targetType: 'diagram',
                targetId: null,
                body: 'x',
            })
        ).rejects.toBe(apiError);
    });
});
