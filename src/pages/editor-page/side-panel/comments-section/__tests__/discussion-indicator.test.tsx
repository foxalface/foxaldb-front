import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    EMPTY_DISCUSSION_INDICATOR,
    type DiscussionIndicator as DiscussionIndicatorValue,
} from '@/lib/comments/discussion-indicators';
import { DiscussionIndicator } from '../discussion-indicator';

const withDiscussion = (commentCount: number): DiscussionIndicatorValue => ({
    commentCount,
    hasDiscussion: commentCount > 0,
});

describe('DiscussionIndicator', () => {
    it('returns null when the indicator has no discussion', () => {
        const { container } = render(
            <DiscussionIndicator indicator={EMPTY_DISCUSSION_INDICATOR} />
        );

        expect(container).toBeEmptyDOMElement();
        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('returns null when hasDiscussion is false even if count is positive', () => {
        const { container } = render(
            <DiscussionIndicator
                indicator={{ commentCount: 3, hasDiscussion: false }}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders a decorative MessageCircle when hasDiscussion is true', () => {
        render(<DiscussionIndicator indicator={withDiscussion(1)} />);

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
        expect(indicator.querySelector('svg')).not.toBeNull();
    });

    it('does not display a numeric comment count', () => {
        render(<DiscussionIndicator indicator={withDiscussion(7)} />);

        expect(screen.queryByText('7')).not.toBeInTheDocument();
        expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it('is not a button, link, or keyboard tab stop', () => {
        render(<DiscussionIndicator indicator={withDiscussion(1)} />);

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator.tagName).toBe('SPAN');
        expect(indicator).not.toHaveAttribute('tabindex');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('forwards className onto the visible indicator', () => {
        render(
            <DiscussionIndicator
                indicator={withDiscussion(1)}
                className="mr-1"
            />
        );

        expect(screen.getByTestId('discussion-indicator')).toHaveClass(
            'mr-1',
            'pointer-events-none',
            'shrink-0'
        );
    });

    it('exposes no click handler and uses pointer-events-none', () => {
        render(<DiscussionIndicator indicator={withDiscussion(1)} />);

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toHaveClass('pointer-events-none');
        expect(indicator.onclick).toBeNull();
        expect(indicator).not.toHaveAttribute('role');
        expect(indicator).not.toHaveAttribute('href');
    });
});
