import type { DiagramAccess } from '@/lib/api/diagrams';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';

export interface ConversationMessageCapabilitiesInput {
    message: Pick<DiagramConversationMessage, 'user'>;
    currentUserId: number | null | undefined;
    diagramAccess: DiagramAccess | null | undefined;
    conversationStatus: ConversationStatus;
}

export interface ConversationMessageCapabilities {
    canEdit: boolean;
    canDelete: boolean;
    hasActions: boolean;
}

/**
 * Author-only message actions for the conversations UI.
 * The API remains authoritative.
 */
export const getConversationMessageCapabilities = (
    input: ConversationMessageCapabilitiesInput
): ConversationMessageCapabilities => {
    const { message, currentUserId, diagramAccess, conversationStatus } = input;

    if (
        conversationStatus !== 'active' ||
        currentUserId == null ||
        diagramAccess == null
    ) {
        return { canEdit: false, canDelete: false, hasActions: false };
    }

    const canEditDiagram = diagramAccess.can_edit === true;
    const authorId = message.user?.id ?? null;
    const isAuthor = authorId !== null && authorId === currentUserId;

    const canEdit = isAuthor && canEditDiagram;
    const canDelete = isAuthor && canEditDiagram;

    return {
        canEdit,
        canDelete,
        hasActions: canEdit || canDelete,
    };
};

export const canCreateConversationMessage = (
    diagramAccess: DiagramAccess | null | undefined,
    conversationStatus: ConversationStatus
): boolean => {
    if (conversationStatus !== 'active') {
        return false;
    }

    return diagramAccess?.can_edit === true;
};
