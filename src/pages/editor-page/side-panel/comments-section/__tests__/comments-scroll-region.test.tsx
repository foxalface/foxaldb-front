import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { CommentsScrollRegion } from '../comments-scroll-region';

const { useDiscussionScrollMock } = vi.hoisted(() => ({
    useDiscussionScrollMock: vi.fn(),
}));

vi.mock('@/hooks/use-discussion-scroll', () => ({
    useDiscussionScroll: (args: unknown) => useDiscussionScrollMock(args),
}));

vi.mock('../comments-list', () => ({
    CommentsList: ({
        comments,
    }: {
        comments: ReadonlyArray<DiagramComment>;
    }) => (
        <div data-testid="comments-list">
            {comments.map((comment) => (
                <div key={comment.id}>{comment.body}</div>
            ))}
        </div>
    ),
}));

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

describe('CommentsScrollRegion', () => {
    beforeEach(() => {
        useDiscussionScrollMock.mockReset();
        useDiscussionScrollMock.mockReturnValue({
            scrollAreaRef: vi.fn(),
            setCommentItemRef: vi.fn(),
        });
    });

    it('keeps the scroll hook mounted when switching to an empty scope', () => {
        const { rerender, getByTestId } = render(
            <CommentsScrollRegion
                comments={[comment({ id: 1 })]}
                emptyContent={<div data-testid="scoped-empty">Empty</div>}
                labelledBy="heading"
                scopeKey="42:all"
                scrollToLatestOnOpen={false}
                scrollIntent={null}
            />
        );

        expect(getByTestId('comments-scroll-region')).toBeInTheDocument();
        expect(useDiscussionScrollMock).toHaveBeenCalledTimes(1);

        rerender(
            <CommentsScrollRegion
                comments={[]}
                emptyContent={<div data-testid="scoped-empty">Empty</div>}
                labelledBy="heading"
                scopeKey="42:target:table:t1"
                scrollToLatestOnOpen
                scrollIntent={null}
            />
        );

        expect(getByTestId('comments-scroll-region')).toBeInTheDocument();
        expect(screen.getByTestId('scoped-empty')).toBeInTheDocument();
        expect(screen.queryByTestId('comments-list')).not.toBeInTheDocument();
        expect(useDiscussionScrollMock).toHaveBeenCalled();
        expect(useDiscussionScrollMock.mock.calls.at(-1)?.[0]).toEqual(
            expect.objectContaining({
                scopeKey: '42:target:table:t1',
                comments: [],
                scrollToLatestOnOpen: true,
            })
        );
    });

    it('does not render list semantics for an empty scope', () => {
        render(
            <CommentsScrollRegion
                comments={[]}
                emptyContent={
                    <div data-testid="scoped-empty">No discussions yet</div>
                }
                labelledBy="heading"
                scopeKey="42:diagram"
                scrollToLatestOnOpen
                scrollIntent={null}
            />
        );

        expect(screen.getByTestId('scoped-empty')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
        expect(screen.queryByTestId('comments-list')).not.toBeInTheDocument();
    });

    it('renders the list when comments appear without changing the region owner', () => {
        const { rerender, getByTestId } = render(
            <CommentsScrollRegion
                comments={[]}
                emptyContent={<div data-testid="scoped-empty">Empty</div>}
                labelledBy="heading"
                scopeKey="42:target:table:t1"
                scrollToLatestOnOpen
                scrollIntent={null}
            />
        );

        const region = getByTestId('comments-scroll-region');

        rerender(
            <CommentsScrollRegion
                comments={[comment({ id: 9 })]}
                emptyContent={<div data-testid="scoped-empty">Empty</div>}
                labelledBy="heading"
                scopeKey="42:target:table:t1"
                scrollToLatestOnOpen
                scrollIntent={{
                    targetCommentId: 9,
                    reason: 'local-create',
                    generation: 1,
                }}
            />
        );

        expect(getByTestId('comments-scroll-region')).toBe(region);
        expect(screen.getByTestId('comments-list')).toBeInTheDocument();
        expect(screen.queryByTestId('scoped-empty')).not.toBeInTheDocument();
        expect(useDiscussionScrollMock.mock.calls.at(-1)?.[0]).toEqual(
            expect.objectContaining({
                comments: [expect.objectContaining({ id: 9 })],
                scrollIntent: expect.objectContaining({
                    targetCommentId: 9,
                    generation: 1,
                }),
            })
        );
    });
});
