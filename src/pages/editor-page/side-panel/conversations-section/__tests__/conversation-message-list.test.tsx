import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { initI18n } from '@/i18n/i18n';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { aliceWonderAuthor } from '@/test/user-identity-fixtures';
import { ConversationMessageList } from '../conversation-message-list';

vi.mock('@/hooks/use-user-time-zone', () => ({
    useUserTimeZone: () => 'Europe/Paris',
}));

const buildMessage = (
    overrides: Partial<DiagramConversationMessage> = {}
): DiagramConversationMessage => ({
    id: overrides.id ?? 100,
    conversationId: 10,
    body: overrides.body ?? 'Hello team',
    user: overrides.user ?? aliceWonderAuthor,
    createdAt: overrides.createdAt ?? '2026-08-07T14:45:00.000Z',
    updatedAt:
        overrides.updatedAt ??
        overrides.createdAt ??
        '2026-08-07T14:45:00.000Z',
    reactions: [],
    ...overrides,
});

const defaultProps = {
    conversationId: 10,
    conversationStatus: 'active' as ConversationStatus,
    editingMessageId: null,
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    listLabelId: 'messages-heading',
    isInitialLoading: false,
    isLoadError: false,
    isRetrying: false,
    isLoadingMore: false,
    hasMore: false,
    onLoadOlder: vi.fn(),
    onRetry: vi.fn(),
};

beforeAll(async () => {
    await initI18n();
});

describe('ConversationMessageList day groups', () => {
    it('renders day separators for messages on different local days', () => {
        render(
            <ConversationMessageList
                {...defaultProps}
                messages={[
                    buildMessage({
                        id: 1,
                        createdAt: '2026-08-06T10:00:00.000Z',
                    }),
                    buildMessage({
                        id: 2,
                        createdAt: '2026-08-07T14:45:00.000Z',
                    }),
                ]}
            />
        );

        const separators = screen.getAllByRole('separator');
        expect(separators).toHaveLength(2);
    });
});
