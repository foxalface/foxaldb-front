/**
 * Formats the last message body for conversation summary cards.
 * Whitespace is collapsed so multi-line messages clamp predictably.
 */
export const resolveConversationSummaryDisplayText = (
    lastMessageBody: string | null | undefined,
    emptyFallback: string
): string => {
    const trimmed = lastMessageBody?.trim() ?? '';

    if (trimmed.length === 0) {
        return emptyFallback;
    }

    return trimmed.replace(/\s+/gu, ' ');
};
