const MAX_DISPLAY_COUNT = 99;

export const formatConversationUnreadCount = (count: number): string =>
    count > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : String(count);
