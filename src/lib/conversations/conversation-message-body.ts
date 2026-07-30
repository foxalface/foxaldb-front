/**
 * Keep in sync with backend `App\Support\ConversationMessageBody`.
 * Maximum length is measured in Unicode characters (mb_strlen), not bytes.
 */
export const CONVERSATION_MESSAGE_MAX_LENGTH = 2000;

/**
 * Count Unicode code points (matches Laravel mb_strlen), not UTF-16 code units.
 */
export const countUnicodeCharacters = (value: string): number =>
    Array.from(value).length;

export const normalizeConversationMessageBody = (body: string): string =>
    body.trim();
