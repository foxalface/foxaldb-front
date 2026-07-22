import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { EMPTY_DISCUSSION_INDICATOR } from '@/lib/comments/discussion-indicators';
import { useCommentMutations } from '../use-comment-mutations';
import { useDiagramComments } from '../use-diagram-comments';
import {
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
    useTableDiscussionIndicator,
} from '../use-discussion-indicators';

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

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => ({
        currentDiagramId: null,
        getDiagramPrivateChannel: () => null,
        onReconnect: () => () => undefined,
    }),
}));

vi.mock('@/lib/api/diagram-comments', () => ({
    listDiagramComments,
    createDiagramComment,
    updateDiagramComment,
    deleteDiagramComment,
}));

import { CommentsProvider } from '@/context/comments-context/comments-provider';

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

describe('use*DiscussionIndicator hooks', () => {
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

    it('outside provider returns the stable empty indicator', () => {
        const { result } = renderHook(() => useTableDiscussionIndicator('t1'));

        expect(result.current).toBe(EMPTY_DISCUSSION_INDICATOR);
        expect(result.current).toEqual({
            commentCount: 0,
            hasDiscussion: false,
        });
    });

    it('inactive provider returns the stable empty indicator', async () => {
        authValue = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
        };
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);

        const { result } = renderHook(() => useTableDiscussionIndicator('t1'), {
            wrapper,
        });

        await waitFor(() => {
            expect(listDiagramComments).not.toHaveBeenCalled();
        });

        expect(result.current).toBe(EMPTY_DISCUSSION_INDICATOR);
    });

    it('active provider with a table comment returns the table indicator', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);

        const { result } = renderHook(() => useTableDiscussionIndicator('t1'), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.hasDiscussion).toBe(true);
        });

        expect(result.current).toEqual({
            commentCount: 1,
            hasDiscussion: true,
        });
    });

    it('field hook does not see a table comment with the same ID', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 'shared' }),
        ]);

        const { result } = renderHook(
            () => ({
                table: useTableDiscussionIndicator('shared'),
                field: useFieldDiscussionIndicator('shared'),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.table.hasDiscussion).toBe(true);
        });

        expect(result.current.table.commentCount).toBe(1);
        expect(result.current.field).toBe(EMPTY_DISCUSSION_INDICATOR);
    });

    it('relationship hook remains isolated from other partitions', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 'x' }),
            comment({ id: 2, targetType: 'field', targetId: 'x' }),
            comment({ id: 3, targetType: 'relationship', targetId: 'x' }),
        ]);

        const { result } = renderHook(
            () => ({
                table: useTableDiscussionIndicator('x'),
                field: useFieldDiscussionIndicator('x'),
                relationship: useRelationshipDiscussionIndicator('x'),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.relationship.hasDiscussion).toBe(true);
        });

        expect(result.current.table.commentCount).toBe(1);
        expect(result.current.field.commentCount).toBe(1);
        expect(result.current.relationship.commentCount).toBe(1);
    });

    it('missing target returns the stable empty indicator', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);

        const { result } = renderHook(
            () => useTableDiscussionIndicator('missing'),
            { wrapper }
        );

        await waitFor(() => {
            expect(listDiagramComments).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(result.current).toBe(EMPTY_DISCUSSION_INDICATOR);
        });
    });

    it('two missing-target calls share the empty indicator reference', () => {
        const first = renderHook(() => useTableDiscussionIndicator('a'));
        const second = renderHook(() => useFieldDiscussionIndicator('b'));

        expect(first.result.current).toBe(EMPTY_DISCUSSION_INDICATOR);
        expect(second.result.current).toBe(EMPTY_DISCUSSION_INDICATOR);
        expect(first.result.current).toBe(second.result.current);
    });

    it('same target returns the exact stored indicator object', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);

        const { result } = renderHook(
            () => ({
                first: useTableDiscussionIndicator('t1'),
                second: useTableDiscussionIndicator('t1'),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.first.hasDiscussion).toBe(true);
        });

        expect(result.current.first).toEqual({
            commentCount: 1,
            hasDiscussion: true,
        });
        expect(result.current.first).toBe(result.current.second);
    });

    it('create/upsert increments the count', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);
        const created = comment({
            id: 2,
            targetType: 'table',
            targetId: 't1',
            body: 'new',
        });
        createDiagramComment.mockResolvedValue(created);

        const { result } = renderHook(
            () => ({
                indicator: useTableDiscussionIndicator('t1'),
                mutations: useCommentMutations(),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.indicator.commentCount).toBe(1);
        });

        await act(async () => {
            await result.current.mutations.createComment({
                targetType: 'table',
                targetId: 't1',
                body: 'new',
            });
        });

        expect(result.current.indicator.commentCount).toBe(2);
        expect(result.current.indicator.hasDiscussion).toBe(true);
    });

    it('delete decrements the count', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
            comment({ id: 2, targetType: 'table', targetId: 't1' }),
        ]);
        deleteDiagramComment.mockResolvedValue(undefined);

        const { result } = renderHook(
            () => ({
                indicator: useTableDiscussionIndicator('t1'),
                mutations: useCommentMutations(),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.indicator.commentCount).toBe(2);
        });

        await act(async () => {
            await result.current.mutations.deleteComment(1);
        });

        expect(result.current.indicator.commentCount).toBe(1);
        expect(result.current.indicator.hasDiscussion).toBe(true);
    });

    it('deleting the last comment returns the empty indicator', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'field', targetId: 'f1' }),
        ]);
        deleteDiagramComment.mockResolvedValue(undefined);

        const { result } = renderHook(
            () => ({
                indicator: useFieldDiscussionIndicator('f1'),
                mutations: useCommentMutations(),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.indicator.hasDiscussion).toBe(true);
        });

        await act(async () => {
            await result.current.mutations.deleteComment(1);
        });

        expect(result.current.indicator).toBe(EMPTY_DISCUSSION_INDICATOR);
    });

    it('body update leaves count and hasDiscussion unchanged', async () => {
        listDiagramComments.mockResolvedValue([
            comment({
                id: 1,
                targetType: 'relationship',
                targetId: 'r1',
                body: 'before',
            }),
        ]);
        const updated = comment({
            id: 1,
            targetType: 'relationship',
            targetId: 'r1',
            body: 'after',
        });
        updateDiagramComment.mockResolvedValue(updated);

        const { result } = renderHook(
            () => ({
                indicator: useRelationshipDiscussionIndicator('r1'),
                mutations: useCommentMutations(),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.indicator.commentCount).toBe(1);
        });

        const before = result.current.indicator;

        await act(async () => {
            await result.current.mutations.updateComment(1, {
                body: 'after',
            });
        });

        expect(result.current.indicator.commentCount).toBe(1);
        expect(result.current.indicator.hasDiscussion).toBe(true);
        // Upsert replaces byId, so a rebuild is expected; values stay equal.
        expect(result.current.indicator).toEqual(before);
    });

    it('status-only provider change does not replace the indicator result', async () => {
        let resolveReload!: (value: DiagramComment[]) => void;
        const reloadPending = new Promise<DiagramComment[]>((resolve) => {
            resolveReload = resolve;
        });

        listDiagramComments
            .mockResolvedValueOnce([
                comment({ id: 1, targetType: 'table', targetId: 't1' }),
            ])
            .mockReturnValueOnce(reloadPending);

        const { result } = renderHook(
            () => ({
                indicator: useTableDiscussionIndicator('t1'),
                comments: useDiagramComments(),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.comments.status).toBe('ready');
        });

        const readyIndicator = result.current.indicator;
        expect(readyIndicator.hasDiscussion).toBe(true);

        let reloadPromise!: Promise<void>;
        act(() => {
            reloadPromise = result.current.comments.reload();
        });

        await waitFor(() => {
            expect(result.current.comments.status).toBe('loading');
        });
        expect(result.current.indicator).toBe(readyIndicator);

        await act(async () => {
            resolveReload([
                comment({ id: 1, targetType: 'table', targetId: 't1' }),
            ]);
            await reloadPromise;
        });

        await waitFor(() => {
            expect(result.current.comments.status).toBe('ready');
        });
    });

    it('reset/inactive clears indicators', async () => {
        listDiagramComments.mockResolvedValue([
            comment({ id: 1, targetType: 'table', targetId: 't1' }),
        ]);

        const { result, rerender } = renderHook(
            () => useTableDiscussionIndicator('t1'),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.hasDiscussion).toBe(true);
        });

        authValue = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
        };
        rerender();

        await waitFor(() => {
            expect(result.current).toBe(EMPTY_DISCUSSION_INDICATOR);
        });
    });

    it('does not cause network calls by itself', () => {
        listDiagramComments.mockClear();

        renderHook(() => useTableDiscussionIndicator('t1'));
        renderHook(() => useFieldDiscussionIndicator('f1'));
        renderHook(() => useRelationshipDiscussionIndicator('r1'));

        expect(listDiagramComments).not.toHaveBeenCalled();
        expect(createDiagramComment).not.toHaveBeenCalled();
        expect(updateDiagramComment).not.toHaveBeenCalled();
        expect(deleteDiagramComment).not.toHaveBeenCalled();
    });

    it('specialized hooks share the same core lookup behavior', async () => {
        listDiagramComments.mockResolvedValue([]);

        const { result } = renderHook(
            () => ({
                table: useTableDiscussionIndicator('missing'),
                field: useFieldDiscussionIndicator('missing'),
                relationship: useRelationshipDiscussionIndicator('missing'),
            }),
            { wrapper }
        );

        await waitFor(() => {
            expect(listDiagramComments).toHaveBeenCalledTimes(1);
        });

        expect(result.current.table).toBe(EMPTY_DISCUSSION_INDICATOR);
        expect(result.current.field).toBe(EMPTY_DISCUSSION_INDICATOR);
        expect(result.current.relationship).toBe(EMPTY_DISCUSSION_INDICATOR);
        expect(result.current.table).toBe(result.current.field);
        expect(result.current.field).toBe(result.current.relationship);
    });
});
