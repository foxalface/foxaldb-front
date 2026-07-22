import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { en } from '@/i18n/locales/en';

const { updateCommentMock } = vi.hoisted(() => ({
    updateCommentMock: vi.fn(),
}));

vi.mock('@/hooks/use-comment-mutations', () => ({
    useCommentMutations: () => ({
        createComment: vi.fn(),
        updateComment: updateCommentMock,
        deleteComment: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }
            return typeof current === 'string' ? current : key;
        },
    }),
}));

import { useCommentEditSession } from '../use-comment-edit-session';

const deferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const baseComment = (
    overrides: Partial<DiagramComment> = {}
): DiagramComment => ({
    id: 7,
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: 'Original body',
    user: { id: 1, name: 'Alice' },
    createdAt: '2026-07-22T10:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
    ...overrides,
});

describe('useCommentEditSession', () => {
    beforeEach(() => {
        updateCommentMock.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('initializes from the persisted body without a remote warning', () => {
        const { result } = renderHook(() =>
            useCommentEditSession({
                comment: baseComment(),
                diagramId: '42',
                onCancel: vi.fn(),
                onSaved: vi.fn(),
                onRequestFocus: vi.fn(),
            })
        );

        expect(result.current.body).toBe('Original body');
        expect(result.current.characterCount).toBe(13);
        expect(result.current.showRemoteWarning).toBe(false);
        expect(result.current.canSave).toBe(true);
    });

    it('resets draft on identity change but preserves draft on same-identity remote update', () => {
        let comment = baseComment({ body: 'Local base' });
        const { result, rerender } = renderHook(
            ({ comment: next, diagramId }) =>
                useCommentEditSession({
                    comment: next,
                    diagramId,
                    onCancel: vi.fn(),
                    onSaved: vi.fn(),
                    onRequestFocus: vi.fn(),
                }),
            { initialProps: { comment, diagramId: '42' } }
        );

        act(() => {
            result.current.setBodyFromInput('My local draft');
        });
        expect(result.current.body).toBe('My local draft');

        comment = baseComment({
            body: 'Remote body',
            updatedAt: '2026-07-22T11:00:00.000Z',
        });
        rerender({ comment, diagramId: '42' });

        expect(result.current.body).toBe('My local draft');
        expect(result.current.showRemoteWarning).toBe(true);

        comment = baseComment({
            id: 8,
            body: 'Other comment',
            updatedAt: '2026-07-22T12:00:00.000Z',
        });
        rerender({ comment, diagramId: '42' });

        expect(result.current.body).toBe('Other comment');
        expect(result.current.showRemoteWarning).toBe(false);
    });

    it('shows the remote warning after a pending save fails across a remote update', async () => {
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const onRequestFocus = vi.fn();

        let comment = baseComment({
            body: 'Base',
            updatedAt: '2026-07-22T10:00:00.000Z',
        });
        const { result, rerender } = renderHook(
            ({ comment: next }) =>
                useCommentEditSession({
                    comment: next,
                    diagramId: '42',
                    onCancel: vi.fn(),
                    onSaved: vi.fn(),
                    onRequestFocus,
                }),
            { initialProps: { comment } }
        );

        act(() => {
            result.current.setBodyFromInput('Draft during remote');
        });
        await act(async () => {
            void result.current.save();
        });
        expect(result.current.isSubmitting).toBe(true);

        comment = baseComment({
            body: 'Remote body',
            updatedAt: '2026-07-22T11:00:00.000Z',
        });
        rerender({ comment });
        expect(result.current.body).toBe('Draft during remote');
        expect(result.current.showRemoteWarning).toBe(false);

        await act(async () => {
            pending.reject(new Error('secret failure'));
        });

        await waitFor(() => {
            expect(result.current.isSubmitting).toBe(false);
        });
        expect(result.current.body).toBe('Draft during remote');
        expect(result.current.errorMessage).toBe(
            'Could not update the message. Please try again.'
        );
        expect(result.current.showRemoteWarning).toBe(true);
        expect(result.current.canSave).toBe(true);
        expect(onRequestFocus).toHaveBeenCalled();
    });

    it('exits through onSaved when a pending save succeeds after a remote update', async () => {
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const onSaved = vi.fn();

        let comment = baseComment({
            updatedAt: '2026-07-22T10:00:00.000Z',
        });
        const { result, rerender } = renderHook(
            ({ comment: next }) =>
                useCommentEditSession({
                    comment: next,
                    diagramId: '42',
                    onCancel: vi.fn(),
                    onSaved,
                    onRequestFocus: vi.fn(),
                }),
            { initialProps: { comment } }
        );

        await act(async () => {
            void result.current.save();
        });

        comment = baseComment({
            updatedAt: '2026-07-22T11:00:00.000Z',
        });
        rerender({ comment });

        await act(async () => {
            pending.resolve(
                baseComment({
                    body: 'Original body',
                    updatedAt: '2026-07-22T12:00:00.000Z',
                })
            );
        });

        await waitFor(() => {
            expect(onSaved).toHaveBeenCalledTimes(1);
        });
    });

    it('ignores stale session completion after identity change', async () => {
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const onSaved = vi.fn();
        const onRequestFocus = vi.fn();

        let comment = baseComment({ id: 7, body: 'old session' });
        const { result, rerender } = renderHook(
            ({ comment: next }) =>
                useCommentEditSession({
                    comment: next,
                    diagramId: '42',
                    onCancel: vi.fn(),
                    onSaved,
                    onRequestFocus,
                }),
            { initialProps: { comment } }
        );

        await act(async () => {
            void result.current.save();
        });

        comment = baseComment({ id: 8, body: 'new session' });
        rerender({ comment });
        expect(result.current.body).toBe('new session');
        expect(result.current.isSubmitting).toBe(false);

        await act(async () => {
            pending.resolve(baseComment({ id: 7, body: 'old session' }));
        });

        expect(onSaved).not.toHaveBeenCalled();
        expect(result.current.errorMessage).toBeNull();
        expect(result.current.body).toBe('new session');
    });

    it('does not warn about state updates when unmounted during pending failure', async () => {
        const pending = deferred<DiagramComment>();
        updateCommentMock.mockReturnValue(pending.promise);
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        const { result, unmount } = renderHook(() =>
            useCommentEditSession({
                comment: baseComment({ body: 'pending' }),
                diagramId: '42',
                onCancel: vi.fn(),
                onSaved: vi.fn(),
                onRequestFocus: vi.fn(),
            })
        );

        await act(async () => {
            void result.current.save();
        });
        unmount();

        await act(async () => {
            pending.reject(new Error('network'));
        });

        const messages = consoleError.mock.calls
            .map((args) => args.map(String).join(' '))
            .join('\n');
        expect(messages).not.toMatch(/unmounted component/i);
        consoleError.mockRestore();
    });
});
