import type { ConversationReactionAggregate } from './conversation-types';

export type ConversationReactionAggregateWithoutOwnership = Omit<
    ConversationReactionAggregate,
    'reactedByMe'
>;

/**
 * Reconciles websocket reaction snapshots that omit reactedByMe.
 *
 * 1. reactedByMe is true when the current user appears in previewUsers.
 * 2. Otherwise, preserve the existing reactedByMe for the same emoji when known.
 * 3. Otherwise default to false.
 *
 * Truncated previews never clear an existing true reactedByMe solely because
 * the current user is absent from previewUsers.
 */
export const reconcileConversationReactionAggregates = (
    incoming: ConversationReactionAggregateWithoutOwnership[],
    existing: ConversationReactionAggregate[],
    currentUserId: number | null | undefined
): ConversationReactionAggregate[] => {
    const existingByEmoji = new Map(
        existing.map((reaction) => [reaction.emoji, reaction])
    );

    return incoming.map((reaction) => {
        const existingReaction = existingByEmoji.get(reaction.emoji);

        let reactedByMe = false;

        if (
            currentUserId != null &&
            reaction.previewUsers.some((user) => user?.id === currentUserId)
        ) {
            reactedByMe = true;
        } else if (existingReaction !== undefined) {
            reactedByMe = existingReaction.reactedByMe;
        }

        return {
            ...reaction,
            reactedByMe,
        };
    });
};
