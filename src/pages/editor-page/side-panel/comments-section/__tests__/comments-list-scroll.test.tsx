import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import { CommentsList } from '../comments-list';

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
        vi.restoreAllMocks();
    });

    it('wires viewport and item refs without owning scroll state', () => {
        const scrollAreaRef = vi.fn();
        const setCommentItemRef = vi.fn();
        const comments = [comment({ id: 1 }), comment({ id: 2 })];

        render(
            <CommentsList
                comments={comments}
                labelledBy="heading"
                scrollAreaRef={scrollAreaRef}
                setCommentItemRef={setCommentItemRef}
            />
        );

        expect(scrollAreaRef).toHaveBeenCalled();
        expect(setCommentItemRef).toHaveBeenCalledWith(
            1,
            expect.any(HTMLElement)
        );
        expect(setCommentItemRef).toHaveBeenCalledWith(
            2,
            expect.any(HTMLElement)
        );
    });

    it('keeps a stable ScrollArea DOM node when only comment bodies change', () => {
        const scrollAreaRef = vi.fn();
        const setCommentItemRef = vi.fn();

        const { getByTestId, rerender } = render(
            <CommentsList
                comments={[comment({ id: 1 })]}
                labelledBy="heading"
                scrollAreaRef={scrollAreaRef}
                setCommentItemRef={setCommentItemRef}
            />
        );

        const first = getByTestId('comments-scroll-area');

        rerender(
            <CommentsList
                comments={[comment({ id: 1, body: 'updated' })]}
                labelledBy="heading"
                scrollAreaRef={scrollAreaRef}
                setCommentItemRef={setCommentItemRef}
            />
        );

        expect(getByTestId('comments-scroll-area')).toBe(first);
    });

    it('renders comment items without scroll mutation callbacks', () => {
        const { getByTestId, queryByText } = render(
            <CommentsList
                comments={[comment({ id: 7 })]}
                labelledBy="heading"
                scrollAreaRef={vi.fn()}
                setCommentItemRef={vi.fn()}
            />
        );

        expect(getByTestId('comment-item-7')).toBeInTheDocument();
        expect(queryByText(/edit-/)).not.toBeInTheDocument();
        expect(queryByText(/delete-/)).not.toBeInTheDocument();
    });
});
