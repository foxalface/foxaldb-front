import { describe, expect, it } from 'vitest';
import type { DiagramConversationDto } from '../diagram-conversations';
import { normalizeDiagramConversationFromApi } from '../normalize-diagram-conversation';
import { buildUserIdentity } from '@/lib/user';

const baseDto = (
    overrides: Partial<DiagramConversationDto> = {}
): DiagramConversationDto => ({
    id: 10,
    diagram_id: 42,
    target_type: 'diagram',
    target_id: null,
    status: 'active',
    archived_at: null,
    message_count: 2,
    unread_count: 0,
    last_message_at: '2026-07-19T10:00:00.000000Z',
    last_message_body: 'Latest full message body',
    last_message_author: {
        id: 7,
        first_name: 'Alex',
        last_name: 'Renart',
        full_name: 'Alex Renart',
    },
    created_at: '2026-07-19T10:00:00.000000Z',
    updated_at: '2026-07-19T11:00:00.000000Z',
    ...overrides,
});

describe('normalizeDiagramConversationFromApi', () => {
    it('maps a full snake_case DTO to the camelCase domain model', () => {
        const normalized = normalizeDiagramConversationFromApi(baseDto());

        expect(normalized).toEqual({
            id: 10,
            diagramId: 42,
            targetType: 'diagram',
            targetId: null,
            status: 'active',
            archivedAt: null,
            messageCount: 2,
            lastMessageAt: '2026-07-19T10:00:00.000000Z',
            lastMessageBody: 'Latest full message body',
            lastMessageAuthor: buildUserIdentity(7, 'Alex', 'Renart'),
            unreadCount: 0,
            createdAt: '2026-07-19T10:00:00.000000Z',
            updatedAt: '2026-07-19T11:00:00.000000Z',
        });
    });

    it('preserves archived status and timestamp', () => {
        const normalized = normalizeDiagramConversationFromApi(
            baseDto({
                status: 'archived',
                archived_at: '2026-07-20T12:00:00.000000Z',
            })
        );

        expect(normalized.status).toBe('archived');
        expect(normalized.archivedAt).toBe('2026-07-20T12:00:00.000000Z');
    });

    it('preserves a null last_message_author', () => {
        expect(
            normalizeDiagramConversationFromApi(
                baseDto({ last_message_author: null })
            ).lastMessageAuthor
        ).toBeNull();
    });

    it('throws on invalid unread_count', () => {
        expect(() =>
            normalizeDiagramConversationFromApi(baseDto({ unread_count: -1 }))
        ).toThrow(/unread_count must be non-negative/);
    });

    it('throws on invalid target_type', () => {
        expect(() =>
            normalizeDiagramConversationFromApi(
                baseDto({
                    target_type:
                        'invalid' as DiagramConversationDto['target_type'],
                })
            )
        ).toThrow(/target_type is invalid/);
    });
});
