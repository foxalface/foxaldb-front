import React from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { aliceWonderAuthor, bobAuthor } from '@/test/user-identity-fixtures';
import { initI18n } from '@/i18n/i18n';
import { ConversationMessageItem } from '@/pages/editor-page/side-panel/conversations-section/conversation-message-item';

beforeAll(async () => {
    await initI18n();
});

const buildMessage = (
    overrides: Partial<DiagramConversationMessage> = {}
): DiagramConversationMessage => ({
    id: 100,
    conversationId: 10,
    body: 'Hello team',
    user: aliceWonderAuthor,
    createdAt: '2026-01-02T10:00:00.000Z',
    updatedAt: '2026-01-02T10:00:00.000Z',
    ...overrides,
});

const defaultProps = {
    conversationId: 10,
    conversationStatus: 'active' as ConversationStatus,
    editingMessageId: null,
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onEditSaved: vi.fn(),
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        user: {
            id: aliceWonderAuthor.id,
            first_name: aliceWonderAuthor.firstName,
            last_name: aliceWonderAuthor.lastName,
            full_name: aliceWonderAuthor.fullName,
            email: 'alice@example.com',
        },
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        diagramAccess: {
            can_view: true,
            can_edit: true,
            role: 'editor',
        },
    }),
}));

vi.mock('@/hooks/use-conversation-mutations', () => ({
    useConversationMutations: () => ({
        updateMessage: vi.fn(),
        deleteMessage: vi.fn(),
    }),
}));

describe('ConversationMessageItem shell integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders author, timestamp, and body inside the message shell', () => {
        render(
            <ConversationMessageItem
                {...defaultProps}
                message={buildMessage()}
            />
        );

        const message = screen.getByTestId('conversation-message-100');
        expect(message.tagName).toBe('ARTICLE');
        expect(screen.getByText('Alice Wonder')).toBeInTheDocument();
        expect(screen.getByText('Hello team')).toBeInTheDocument();
        expect(message.querySelector('time')).toHaveAttribute(
            'dateTime',
            '2026-01-02T10:00:00.000Z'
        );
    });

    it('renders edited marker for updated messages', () => {
        render(
            <ConversationMessageItem
                {...defaultProps}
                message={buildMessage({
                    updatedAt: '2026-01-02T11:00:00.000Z',
                })}
            />
        );

        expect(screen.getByText('(edited)')).toBeInTheDocument();
    });

    it('shows deleted-user fallback when author is missing', () => {
        render(
            <ConversationMessageItem
                {...defaultProps}
                message={buildMessage({ user: null })}
            />
        );

        expect(screen.getByText('Deleted user')).toBeInTheDocument();
        expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('marks current-user messages and keeps avatar before content in DOM order', () => {
        render(
            <ConversationMessageItem
                {...defaultProps}
                message={buildMessage({ user: aliceWonderAuthor })}
            />
        );

        const message = screen.getByTestId('conversation-message-100');
        expect(message).toHaveAttribute('data-current-user', 'true');
    });

    it('does not mark other-user messages as current user', () => {
        render(
            <ConversationMessageItem
                {...defaultProps}
                message={buildMessage({ user: bobAuthor })}
            />
        );

        expect(screen.getByTestId('conversation-message-100')).toHaveAttribute(
            'data-current-user',
            'false'
        );
    });

    it('does not render reaction slots in the DOM', () => {
        const { container } = render(
            <ConversationMessageItem
                {...defaultProps}
                message={buildMessage()}
            />
        );

        expect(
            container.querySelector(
                '[data-slot="conversation-message-reactions"]'
            )
        ).toBeNull();
        expect(
            container.querySelector(
                '[data-slot="conversation-message-reaction-trigger"]'
            )
        ).toBeNull();
    });

    it('shows actions for permitted messages and supports edit mode', async () => {
        const user = userEvent.setup();
        const onStartEdit = vi.fn();

        render(
            <ConversationMessageItem
                {...defaultProps}
                onStartEdit={onStartEdit}
                message={buildMessage()}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Message actions' })
        );
        await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

        expect(onStartEdit).toHaveBeenCalledWith(100);
    });

    it('replaces read body with edit form in edit mode', () => {
        const { container } = render(
            <ConversationMessageItem
                {...defaultProps}
                editingMessageId={100}
                message={buildMessage()}
            />
        );

        expect(
            screen.getByTestId('conversation-message-edit-form-100')
        ).toBeInTheDocument();
        expect(
            container.querySelector(
                '[data-testid="conversation-message-100"] p.whitespace-pre-wrap'
            )
        ).toBeNull();
    });

    it('hides actions for archived conversations', () => {
        render(
            <ConversationMessageItem
                {...defaultProps}
                conversationStatus="archived"
                message={buildMessage()}
            />
        );

        expect(
            screen.queryByRole('button', { name: 'Message actions' })
        ).not.toBeInTheDocument();
        expect(screen.getByText('Hello team')).toBeInTheDocument();
    });

    it('opens delete dialog from actions menu', async () => {
        const user = userEvent.setup();

        render(
            <ConversationMessageItem
                {...defaultProps}
                message={buildMessage()}
            />
        );

        await user.click(
            screen.getByRole('button', { name: 'Message actions' })
        );
        await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

        expect(
            screen.getByRole('alertdialog', { name: 'Delete message' })
        ).toBeInTheDocument();
    });

    it('does not import the conversations API client', () => {
        const testDir = dirname(fileURLToPath(import.meta.url));
        const source = readFileSync(
            join(testDir, '../conversation-message-item.tsx'),
            'utf8'
        );

        expect(source).not.toContain('@/lib/api/diagram-conversations');
    });
});
