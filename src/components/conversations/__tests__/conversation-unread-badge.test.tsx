import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConversationUnreadBadge } from '../conversation-unread-badge';
import { formatConversationUnreadCount } from '../conversation-unread-count';

describe('formatConversationUnreadCount', () => {
    it('returns the count as a string for values up to 99', () => {
        expect(formatConversationUnreadCount(1)).toBe('1');
        expect(formatConversationUnreadCount(99)).toBe('99');
    });

    it('caps display at 99+', () => {
        expect(formatConversationUnreadCount(100)).toBe('99+');
        expect(formatConversationUnreadCount(500)).toBe('99+');
    });
});

describe('ConversationUnreadBadge', () => {
    it('is hidden when count is zero', () => {
        render(
            <ConversationUnreadBadge count={0} ariaLabel="No unread messages" />
        );

        expect(
            screen.queryByTestId('conversation-unread-badge')
        ).not.toBeInTheDocument();
    });

    it('renders an overlay badge with aria-label for positive counts', () => {
        render(
            <ConversationUnreadBadge count={3} ariaLabel="3 unread messages" />
        );

        const badge = screen.getByTestId('conversation-unread-badge');
        expect(badge).toHaveAttribute('aria-label', '3 unread messages');
        expect(badge).toHaveAttribute('role', 'status');
        expect(badge).toHaveTextContent('3');
        expect(badge.className).toContain('absolute');
    });

    it('shows 99+ for large counts', () => {
        render(
            <ConversationUnreadBadge
                count={120}
                ariaLabel="120 unread messages"
            />
        );

        expect(
            screen.getByTestId('conversation-unread-badge')
        ).toHaveTextContent('99+');
    });
});
