import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { en } from '@/i18n/locales/en';
import { aliceWonderAuthor } from '@/test/user-identity-fixtures';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import {
    CONVERSATION_SUMMARY_CARD_HEIGHT_CLASS,
    ConversationSummaryItem,
} from '../conversation-summary-item';

const buildConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 10,
    diagramId: 42,
    targetType: 'table',
    targetId: 'table-1',
    status: 'active',
    archivedAt: null,
    messageCount: 2,
    lastMessageAt: '2026-01-02T12:00:00.000Z',
    lastMessageBody: 'Latest update',
    lastMessageAuthor: aliceWonderAuthor,
    unreadCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T12:00:00.000Z',
    ...overrides,
});

const { diagramAccessState, chartDbState } = vi.hoisted(() => ({
    diagramAccessState: {
        role: 'owner' as 'owner' | 'editor' | 'viewer',
        can_edit: true,
        can_manage_members: true,
    },
    chartDbState: {
        diagramName: 'Billing',
        tables: [
            {
                id: 'table-1',
                name: 'Clients',
                x: 0,
                y: 0,
                fields: [],
                indexes: [],
                color: '#fff',
                isView: false,
                createdAt: 0,
            },
        ],
        relationships: [],
    },
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartDbState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({ diagramAccess: diagramAccessState }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => {
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

            if (typeof current !== 'string') {
                return key;
            }

            return current.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
                const value = options?.[token];
                return value === undefined || value === null
                    ? ''
                    : String(value);
            });
        },
        i18n: { language: 'en' },
    }),
}));

describe('ConversationSummaryItem', () => {
    beforeEach(() => {
        diagramAccessState.role = 'owner';
        diagramAccessState.can_edit = true;
        diagramAccessState.can_manage_members = true;
    });

    const renderItem = (
        props: Partial<
            React.ComponentProps<typeof ConversationSummaryItem>
        > = {}
    ) => {
        const onSelect = vi.fn();
        const onArchive = vi.fn();
        const onReopen = vi.fn();
        const onDelete = vi.fn(async () => undefined);

        render(
            <TooltipProvider>
                <ConversationSummaryItem
                    conversation={buildConversation()}
                    isArchived={false}
                    isMutationPending={false}
                    onSelect={onSelect}
                    onArchive={onArchive}
                    onReopen={onReopen}
                    onDelete={onDelete}
                    {...props}
                />
            </TooltipProvider>
        );

        return { onSelect, onArchive, onReopen, onDelete };
    };

    const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(
            screen.getByRole('button', { name: 'Conversation options' })
        );
    };

    it('uses a fixed-height card layout with line-clamped preview and metadata row', () => {
        renderItem();

        const card = screen.getByTestId('conversation-summary-10');
        expect(card.className).toContain(
            CONVERSATION_SUMMARY_CARD_HEIGHT_CLASS
        );
        expect(card.className).toContain('overflow-hidden');

        const preview = screen.getByTestId('conversation-summary-preview');
        expect(preview.className).toContain('conversation-summary-preview');
        expect(preview.className).toContain('min-h-8');
        expect(preview.className).toContain('shrink-0');

        const metadata = screen.getByTestId('conversation-summary-metadata');
        expect(metadata.className).toContain('w-full');
        expect(metadata.className).toContain('whitespace-nowrap');
        expect(metadata.className).toContain('overflow-hidden');

        const timestamp = screen.getByTestId('conversation-summary-timestamp');
        expect(timestamp.className).toContain('ml-auto');
        expect(timestamp.className).toContain('shrink-0');
    });

    it('keeps the same fixed height for cards without messages', () => {
        const { rerender } = render(
            <TooltipProvider>
                <ConversationSummaryItem
                    conversation={buildConversation({
                        messageCount: 0,
                        lastMessageBody: null,
                        lastMessageAuthor: null,
                        lastMessageAt: null,
                    })}
                    isArchived={false}
                    isMutationPending={false}
                />
            </TooltipProvider>
        );

        const emptyCard = screen.getByTestId('conversation-summary-10');
        expect(emptyCard.className).toContain(
            CONVERSATION_SUMMARY_CARD_HEIGHT_CLASS
        );

        rerender(
            <TooltipProvider>
                <ConversationSummaryItem
                    conversation={buildConversation({
                        lastMessageBody:
                            'A very long preview that should clamp across two lines without changing the card height at all',
                    })}
                    isArchived={false}
                    isMutationPending={false}
                />
            </TooltipProvider>
        );

        expect(screen.getByTestId('conversation-summary-10').className).toBe(
            emptyCard.className
        );
    });

    it('shows target type, truncated title, and square ellipsis menu', () => {
        renderItem({
            conversation: buildConversation({
                targetType: 'diagram',
                targetId: null,
            }),
        });

        expect(screen.getByText('Diagram')).toBeInTheDocument();
        expect(screen.getByText('Billing')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Conversation options' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /Archive conversation/i })
        ).toBeNull();
    });

    it('shows active menu actions with icons and destructive delete styling', async () => {
        const user = userEvent.setup();
        renderItem();

        await openMenu(user);

        const menu = screen.getByRole('menu');
        expect(
            within(menu).getByRole('menuitem', { name: 'Open' })
        ).toBeInTheDocument();
        expect(
            within(menu).getByRole('menuitem', { name: 'Archive' })
        ).toBeInTheDocument();
        expect(
            within(menu).getByRole('menuitem', { name: 'Delete' })
        ).toHaveClass('!text-red-700');
        expect(
            within(menu).queryByRole('menuitem', { name: 'Reopen' })
        ).toBeNull();
    });

    it('shows reopen instead of archive for archived conversations', async () => {
        const user = userEvent.setup();
        renderItem({ isArchived: true });

        await openMenu(user);

        const menu = screen.getByRole('menu');
        expect(
            within(menu).getByRole('menuitem', { name: 'Reopen' })
        ).toBeInTheDocument();
        expect(
            within(menu).queryByRole('menuitem', { name: 'Archive' })
        ).toBeNull();
    });

    it('hides delete for non-owner viewers', async () => {
        const user = userEvent.setup();
        diagramAccessState.role = 'editor';
        diagramAccessState.can_manage_members = false;
        renderItem();

        await openMenu(user);

        expect(
            within(screen.getByRole('menu')).queryByRole('menuitem', {
                name: 'Delete',
            })
        ).toBeNull();
    });

    it('does not open the conversation when using menu actions', async () => {
        const user = userEvent.setup();
        const { onSelect } = renderItem();

        await openMenu(user);
        await user.click(screen.getByRole('menuitem', { name: 'Archive' }));

        expect(onSelect).not.toHaveBeenCalled();
    });

    it('shows numeric message count with visible author name', () => {
        renderItem();

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.queryByText('2 messages')).not.toBeInTheDocument();
        expect(
            screen.getByText(aliceWonderAuthor.fullName)
        ).toBeInTheDocument();
        expect(screen.queryByText('Author')).not.toBeInTheDocument();

        const author = screen.getByTestId('conversation-summary-author');
        expect(author.className).toContain('min-w-0');
        expect(author.className).toContain('flex-1');
        expect(author.querySelector('.truncate')).not.toBeNull();
    });

    it('shows the missing-author fallback visibly in the metadata row', () => {
        renderItem({
            conversation: buildConversation({
                lastMessageAuthor: null,
            }),
        });

        expect(screen.getByText('No author information')).toBeInTheDocument();
    });

    it('renders the full last message body in the preview area', () => {
        renderItem({
            conversation: buildConversation({
                lastMessageBody: 'Short preview',
            }),
        });

        const preview = screen.getByTestId('conversation-summary-preview');
        expect(preview).toHaveTextContent('Short preview');
        expect(
            screen.getAllByTestId('conversation-summary-preview')
        ).toHaveLength(1);
    });

    it('renders long message bodies for CSS line-clamp truncation', () => {
        const longBody = 'a'.repeat(500);

        renderItem({
            conversation: buildConversation({
                lastMessageBody: longBody,
            }),
        });

        const preview = screen.getByTestId('conversation-summary-preview');
        expect(preview).toHaveTextContent(longBody);
    });

    it('shows the no-messages fallback without changing card height', () => {
        renderItem({
            conversation: buildConversation({
                messageCount: 0,
                lastMessageBody: null,
                lastMessageAuthor: null,
            }),
        });

        expect(
            screen.getByTestId('conversation-summary-preview')
        ).toHaveTextContent('No messages yet');
        expect(
            screen.getByTestId('conversation-summary-10').className
        ).toContain(CONVERSATION_SUMMARY_CARD_HEIGHT_CLASS);
    });

    it('opens the conversation from the card and from the Open menu item', async () => {
        const user = userEvent.setup();
        const { onSelect } = renderItem();

        await user.click(screen.getByText('Latest update'));
        expect(onSelect).toHaveBeenCalledWith(10);

        onSelect.mockClear();
        await openMenu(user);
        await user.click(screen.getByRole('menuitem', { name: 'Open' }));
        expect(onSelect).toHaveBeenCalledWith(10);
    });

    it('requires confirmation before deleting a conversation', async () => {
        const user = userEvent.setup();
        const { onDelete } = renderItem();

        await openMenu(user);
        await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

        expect(
            screen.getByTestId('conversation-summary-delete-dialog-10')
        ).toBeInTheDocument();
        expect(onDelete).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(
            screen.queryByTestId('conversation-summary-delete-dialog-10')
        ).toBeNull();
        expect(onDelete).not.toHaveBeenCalled();
    });

    it('calls delete through the panel handler after confirmation', async () => {
        const user = userEvent.setup();
        const { onDelete } = renderItem();

        await openMenu(user);
        await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => {
            expect(onDelete).toHaveBeenCalledWith(10);
        });
    });

    it('shows an unread badge overlay when unreadCount is positive', () => {
        renderItem({
            conversation: buildConversation({ unreadCount: 4 }),
        });

        const badge = screen.getByTestId('conversation-unread-badge');
        expect(badge).toHaveTextContent('4');
        expect(badge).toHaveAttribute('aria-label');
    });

    it('hides the unread badge when unreadCount is zero', () => {
        renderItem({ conversation: buildConversation({ unreadCount: 0 }) });

        expect(
            screen.queryByTestId('conversation-unread-badge')
        ).not.toBeInTheDocument();
    });

    it('caps unread badge display at 99+', () => {
        renderItem({
            conversation: buildConversation({ unreadCount: 150 }),
        });

        expect(
            screen.getByTestId('conversation-unread-badge')
        ).toHaveTextContent('99+');
    });
});
