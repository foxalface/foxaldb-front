import { describe, expect, it } from 'vitest';
import { aliceWonderAuthor, bobAuthor } from '@/test/user-identity-fixtures';
import { reconcileConversationReactionAggregates } from '../conversation-reaction-reconcile';
import type { ConversationReactionAggregate } from '../conversation-types';

const aggregate = (
    overrides: Partial<ConversationReactionAggregate>
): ConversationReactionAggregate => ({
    emoji: '👍',
    count: 2,
    reactedByMe: false,
    previewUsers: [bobAuthor],
    previewTruncated: true,
    ...overrides,
});

describe('reconcileConversationReactionAggregates', () => {
    it('derives reactedByMe from previewUsers when current user is visible', () => {
        const reconciled = reconcileConversationReactionAggregates(
            [
                {
                    emoji: '👍',
                    count: 2,
                    previewUsers: [aliceWonderAuthor],
                    previewTruncated: true,
                },
            ],
            [],
            aliceWonderAuthor.id
        );

        expect(reconciled[0]?.reactedByMe).toBe(true);
    });

    it('preserves existing reactedByMe when preview is truncated', () => {
        const reconciled = reconcileConversationReactionAggregates(
            [
                {
                    emoji: '👍',
                    count: 12,
                    previewUsers: [bobAuthor],
                    previewTruncated: true,
                },
            ],
            [aggregate({ reactedByMe: true })],
            aliceWonderAuthor.id
        );

        expect(reconciled[0]?.reactedByMe).toBe(true);
    });

    it('does not clear ownership when preview is truncated and user is absent', () => {
        const reconciled = reconcileConversationReactionAggregates(
            [
                {
                    emoji: '👍',
                    count: 12,
                    previewUsers: [],
                    previewTruncated: true,
                },
            ],
            [aggregate({ reactedByMe: true })],
            aliceWonderAuthor.id
        );

        expect(reconciled[0]?.reactedByMe).toBe(true);
    });
});
