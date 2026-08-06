import { useContext } from 'react';
import {
    ConversationsContext,
    INACTIVE_CONVERSATIONS_CONTEXT,
} from '@/context/conversations-context/conversations-context';
import type { ConversationsStatus } from '@/lib/conversations/conversation-reducer';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';

export interface UseDiagramConversationsResult {
    activeConversations: ReadonlyArray<DiagramConversation>;
    archivedConversations: ReadonlyArray<DiagramConversation>;
    status: ConversationsStatus;
    error: unknown;
    isActive: boolean;
    diagramId: string | null;
    activeSummariesNextCursor: string | null;
    archivedSummariesNextCursor: string | null;
    totalUnreadCount: number;
    reload: () => Promise<void>;
    loadArchivedSummaries: (options?: { append?: boolean }) => Promise<void>;
    loadMoreActiveSummaries: () => Promise<void>;
    loadMoreArchivedSummaries: () => Promise<void>;
}

export const useDiagramConversations = (): UseDiagramConversationsResult => {
    const context = useContext(ConversationsContext);
    const value = context ?? INACTIVE_CONVERSATIONS_CONTEXT;

    return {
        activeConversations: value.activeConversations,
        archivedConversations: value.archivedConversations,
        status: value.status,
        error: value.error,
        isActive: value.isActive,
        diagramId: value.diagramId,
        activeSummariesNextCursor: value.activeSummariesNextCursor,
        archivedSummariesNextCursor: value.archivedSummariesNextCursor,
        totalUnreadCount: value.totalUnreadCount,
        reload: value.reload,
        loadArchivedSummaries: value.loadArchivedSummaries,
        loadMoreActiveSummaries: value.loadMoreActiveSummaries,
        loadMoreArchivedSummaries: value.loadMoreArchivedSummaries,
    };
};
