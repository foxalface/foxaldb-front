import type { DiagramConversation } from './conversation-types';

export const conversationHasMessages = (
    conversation: DiagramConversation
): boolean => conversation.messageCount > 0;
