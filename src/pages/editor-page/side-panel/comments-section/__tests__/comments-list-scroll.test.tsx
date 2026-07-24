import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import type { DiscussionScrollIntent } from '@/lib/comments/discussion-scroll';
import { CommentsList } from '../comments-list';

const { useDiscussionScrollMock } = vi.hoisted(() => ({
    useDiscussionScrollMock: vi.fn(),
}));

vi.mock('@/hooks/use-discussion-scroll', () => ({
    useDiscussionScroll: (args: unknown) => useDiscussionScrollMock(args),
}));

vi.mock('../comment-list-item', () => ({
    CommentListItem: ({ comment }: { comment: DiagramComment }) => (
        <div data-testid={`comment-item-${comment.id}`}>{comment.body}</div>
    ),
}));

vi.mock('@/components/scroll-area/scroll-area', () => ({
    ScrollArea: React.forwardRef<
        HTMLDivElement,
        React.HTMLAttributes<HTMLDivElement>
    >(function MockScrollArea({ children, ...props }, ref) {
        return (
            <div ref={ref} {...props}>
                <div data-radix-scroll-area-viewport="">{children}</div>
            </div>
        );
    }),
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

describe('CommentsList scroll wiring', () => {
    beforeEach(() => {
        useDiscussionScrollMock.mockReset();
        useDiscussionScrollMock.mockReturnValue({
            scrollAreaRef: vi.fn(),
            setCommentItemRef: vi.fn(),
        });
    });

    it('passes scope, open behavior, and navigation intent into the scroll hook', () => {
        const comments = [comment({ id: 1 }), comment({ id: 2 })];
        const scrollIntent: DiscussionScrollIntent = {
            targetCommentId: 2,
            reason: 'local-create',
            generation: 3,
        };

        render(
            <CommentsList
                comments={comments}
                labelledBy="heading"
                scopeKey="target:table:t1"
                scrollToLatestOnOpen
                scrollIntent={scrollIntent}
            />
        );

        expect(useDiscussionScrollMock).toHaveBeenCalledWith({
            scopeKey: 'target:table:t1',
            scrollToLatestOnOpen: true,
            comments,
            scrollIntent,
        });
    });

    it('preserves all-discussions mode by disabling open-to-latest', () => {
        render(
            <CommentsList
                comments={[comment({ id: 1 })]}
                labelledBy="heading"
                scopeKey="all"
                scrollToLatestOnOpen={false}
                scrollIntent={null}
            />
        );

        expect(useDiscussionScrollMock).toHaveBeenCalledWith(
            expect.objectContaining({
                scopeKey: 'all',
                scrollToLatestOnOpen: false,
                scrollIntent: null,
            })
        );
    });

    it('renders comment items without scroll mutation callbacks', () => {
        const { getByTestId, queryByText } = render(
            <CommentsList
                comments={[comment({ id: 7 })]}
                labelledBy="heading"
                scopeKey="diagram"
                scrollToLatestOnOpen
                scrollIntent={null}
            />
        );

        expect(getByTestId('comment-item-7')).toBeInTheDocument();
        expect(queryByText(/edit-/)).not.toBeInTheDocument();
        expect(queryByText(/delete-/)).not.toBeInTheDocument();
    });
});
