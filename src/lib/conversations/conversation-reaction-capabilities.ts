import type { DiagramAccess } from '@/lib/api/diagrams';
import type { ConversationStatus } from './conversation-types';

export interface ConversationReactionCapabilitiesInput {
    isConversationsActive: boolean;
    conversationStatus: ConversationStatus;
    diagramAccess: DiagramAccess | null | undefined;
}

/**
 * Mirrors backend DiagramConversationMessageReactionPolicy for UX only.
 * Viewers may react; the API remains authoritative.
 */
export const canReactToConversationMessage = (
    input: ConversationReactionCapabilitiesInput
): boolean => {
    const { isConversationsActive, conversationStatus, diagramAccess } = input;

    if (!isConversationsActive || conversationStatus !== 'active') {
        return false;
    }

    return diagramAccess != null;
};
