import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { en } from '@/i18n/locales/en';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { aliceWonderAuthor } from '@/test/user-identity-fixtures';
import {
    DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES,
    filterConversations,
    hasActiveConversationFilter,
    matchesConversationFilter,
    matchesConversationTypeFilter,
} from '../filter-conversations';

const t = ((key: string): string => {
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
}) as TFunction;

const buildConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 1,
    diagramId: 42,
    targetType: 'table',
    targetId: 'table-1',
    status: 'active',
    archivedAt: null,
    messageCount: 1,
    lastMessageAt: '2026-01-02T12:00:00.000Z',
    lastMessageBody: 'Latest update',
    lastMessageAuthor: aliceWonderAuthor,
    unreadCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T12:00:00.000Z',
    ...overrides,
});

const context = {
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
    t,
};

describe('filterConversations', () => {
    it('returns all conversations when all types are selected and text is empty', () => {
        const conversations = [
            buildConversation({ id: 1 }),
            buildConversation({ id: 2, targetId: 'table-2' }),
        ];

        expect(
            filterConversations(
                conversations,
                {
                    filterText: '',
                    selectedTargetTypes:
                        DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES,
                },
                context
            )
        ).toHaveLength(2);
        expect(
            matchesConversationFilter(conversations[0], '   ', context, [])
        ).toBe(false);
    });

    it('matches by target title', () => {
        const conversation = buildConversation();

        expect(matchesConversationFilter(conversation, 'client', context)).toBe(
            true
        );
        expect(matchesConversationFilter(conversation, 'orders', context)).toBe(
            false
        );
    });

    it('matches by last message body', () => {
        const conversation = buildConversation({
            lastMessageBody: 'Needs review before deploy',
        });

        expect(matchesConversationFilter(conversation, 'deploy', context)).toBe(
            true
        );
    });

    it('matches by author name', () => {
        const conversation = buildConversation({
            lastMessageAuthor: {
                ...aliceWonderAuthor,
                fullName: 'Alice Wonder',
            },
        });

        expect(matchesConversationFilter(conversation, 'alice', context)).toBe(
            true
        );
    });

    it('excludes conversations when no target types are selected', () => {
        const conversations = [
            buildConversation({ id: 1, targetType: 'table' }),
            buildConversation({
                id: 2,
                targetType: 'diagram',
                targetId: null,
            }),
        ];

        expect(
            filterConversations(
                conversations,
                {
                    filterText: '',
                    selectedTargetTypes: [],
                },
                context
            )
        ).toHaveLength(0);
        expect(matchesConversationTypeFilter(conversations[0], [])).toBe(false);
    });

    it('filters by selected target types', () => {
        const conversations = [
            buildConversation({ id: 1, targetType: 'table' }),
            buildConversation({
                id: 2,
                targetType: 'diagram',
                targetId: null,
            }),
        ];

        expect(matchesConversationTypeFilter(conversations[0], ['table'])).toBe(
            true
        );
        expect(matchesConversationTypeFilter(conversations[1], ['table'])).toBe(
            false
        );
        expect(
            filterConversations(
                conversations,
                {
                    filterText: '',
                    selectedTargetTypes: ['diagram'],
                },
                context
            ).map((conversation) => conversation.id)
        ).toEqual([2]);
    });

    it('combines text and type filters', () => {
        const conversations = [
            buildConversation({
                id: 1,
                targetType: 'table',
                lastMessageBody: 'Deploy checklist',
            }),
            buildConversation({
                id: 2,
                targetType: 'diagram',
                targetId: null,
                lastMessageBody: 'Deploy checklist',
            }),
        ];

        expect(
            filterConversations(
                conversations,
                {
                    filterText: 'deploy',
                    selectedTargetTypes: ['table'],
                },
                context
            ).map((conversation) => conversation.id)
        ).toEqual([1]);
    });

    it('filters a conversation list by text', () => {
        const conversations = [
            buildConversation({ id: 1 }),
            buildConversation({
                id: 2,
                targetId: 'table-2',
                lastMessageBody: 'Other thread',
            }),
        ];

        expect(
            filterConversations(
                conversations,
                {
                    filterText: 'latest',
                    selectedTargetTypes:
                        DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES,
                },
                context
            ).map((conversation) => conversation.id)
        ).toEqual([1]);
    });

    it('detects active filters', () => {
        expect(
            hasActiveConversationFilter({
                filterText: '',
                selectedTargetTypes: DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES,
            })
        ).toBe(false);
        expect(
            hasActiveConversationFilter({
                filterText: 'clients',
                selectedTargetTypes: DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES,
            })
        ).toBe(true);
        expect(
            hasActiveConversationFilter({
                filterText: '',
                selectedTargetTypes: ['table'],
            })
        ).toBe(true);
        expect(
            hasActiveConversationFilter({
                filterText: '',
                selectedTargetTypes: [],
            })
        ).toBe(true);
    });
});
