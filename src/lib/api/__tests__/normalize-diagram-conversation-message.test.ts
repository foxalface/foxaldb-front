import { describe, expect, it } from 'vitest';
import type { DiagramConversationMessageDto } from '../diagram-conversations';
import { normalizeDiagramConversationMessageFromApi } from '../normalize-diagram-conversation-message';

const baseDto = (
    overrides: Partial<DiagramConversationMessageDto> = {}
): DiagramConversationMessageDto => ({
    id: 100,
    conversation_id: 10,
    body: 'Hello',
    user: {
        id: 1,
        first_name: 'Alice',
        last_name: 'Wonder',
        full_name: 'Alice Wonder',
    },
    created_at: '2026-01-02T10:00:00.000Z',
    updated_at: '2026-01-02T10:00:00.000Z',
    reactions: [],
    ...overrides,
});

describe('normalizeDiagramConversationMessageFromApi', () => {
    it('normalizes reactions from message payloads', () => {
        const normalized = normalizeDiagramConversationMessageFromApi(
            baseDto({
                reactions: [
                    {
                        emoji: '👍',
                        count: 1,
                        reacted_by_me: false,
                        preview_users: [],
                        preview_truncated: false,
                    },
                ],
            })
        );

        expect(normalized.reactions).toEqual([
            {
                emoji: '👍',
                count: 1,
                reactedByMe: false,
                previewUsers: [],
                previewTruncated: false,
            },
        ]);
    });

    it('defaults to an empty reactions array', () => {
        expect(
            normalizeDiagramConversationMessageFromApi(baseDto()).reactions
        ).toEqual([]);
    });

    it('rejects malformed reaction payloads', () => {
        expect(() =>
            normalizeDiagramConversationMessageFromApi(
                baseDto({
                    reactions: [
                        {
                            emoji: '👍',
                            count: '1' as unknown as number,
                            reacted_by_me: false,
                            preview_users: [],
                            preview_truncated: false,
                        },
                    ],
                })
            )
        ).toThrow();
    });
});
