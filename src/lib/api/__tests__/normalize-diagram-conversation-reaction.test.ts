import { describe, expect, it } from 'vitest';
import {
    normalizeConversationReactionAggregateFromHttp,
    normalizeConversationReactionAggregatesFromHttp,
    normalizeConversationReactionAggregatesFromWebSocket,
} from '../normalize-diagram-conversation-reaction';

describe('normalizeConversationReactionAggregatesFromHttp', () => {
    it('normalizes valid HTTP aggregates', () => {
        const reactions = normalizeConversationReactionAggregatesFromHttp([
            {
                emoji: '👍',
                count: 2,
                reacted_by_me: true,
                preview_users: [
                    {
                        id: 1,
                        first_name: 'Alice',
                        last_name: 'Wonder',
                        full_name: 'Alice Wonder',
                    },
                    null,
                ],
                preview_truncated: true,
            },
        ]);

        expect(reactions).toEqual([
            {
                emoji: '👍',
                count: 2,
                reactedByMe: true,
                previewUsers: [
                    {
                        id: 1,
                        firstName: 'Alice',
                        lastName: 'Wonder',
                        fullName: 'Alice Wonder',
                    },
                    null,
                ],
                previewTruncated: true,
            },
        ]);
    });

    it('rejects malformed aggregates', () => {
        expect(() =>
            normalizeConversationReactionAggregatesFromHttp([
                {
                    emoji: '',
                    count: 1,
                    reacted_by_me: true,
                    preview_users: [],
                    preview_truncated: false,
                },
            ])
        ).toThrow();

        expect(() =>
            normalizeConversationReactionAggregateFromHttp({
                emoji: '👍',
                count: -1,
                reacted_by_me: true,
                preview_users: [],
                preview_truncated: false,
            })
        ).toThrow();
    });
});

describe('normalizeConversationReactionAggregatesFromWebSocket', () => {
    it('normalizes websocket aggregates without reactedByMe', () => {
        const reactions = normalizeConversationReactionAggregatesFromWebSocket([
            {
                emoji: '👍🏽',
                count: 3,
                previewUsers: [],
                previewTruncated: true,
            },
        ]);

        expect(reactions).toEqual([
            {
                emoji: '👍🏽',
                count: 3,
                previewUsers: [],
                previewTruncated: true,
            },
        ]);
    });
});
