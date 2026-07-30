import React, { useCallback, useId, useState } from 'react';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { canCreateConversationMessage } from '@/lib/conversations/conversation-message-capabilities';
import { ConversationArchiveBanner } from './conversation-archive-banner';
import { ConversationDetailHeader } from './conversation-detail-header';
import { ConversationMessageComposer } from './conversation-message-composer';
import { ConversationMessageList } from './conversation-message-list';
import { useConversationDetail } from './use-conversation-detail';

export interface ConversationDetailProps {
    conversation: DiagramConversation;
    onBack: () => void;
    regionRef?: React.Ref<HTMLDivElement>;
}

export const ConversationDetail: React.FC<ConversationDetailProps> = ({
    conversation,
    onBack,
    regionRef,
}) => {
    const messagesHeadingId = useId();
    const { diagramAccess } = useDiagramAccess();
    const [editingMessageId, setEditingMessageId] = useState<number | null>(
        null
    );

    const {
        messages,
        status,
        isInitialLoading,
        isLoadingMore,
        isRetrying,
        hasMore,
        handleLoadOlder,
        handleRetry,
    } = useConversationDetail(conversation);

    const isArchived = conversation.status === 'archived';
    const hasLoadError = status === 'error' && messages.length === 0;
    const canCreate = canCreateConversationMessage(
        diagramAccess,
        conversation.status
    );

    const handleStartEdit = useCallback((messageId: number) => {
        setEditingMessageId(messageId);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingMessageId(null);
    }, []);

    const handleEditSaved = useCallback(() => {
        setEditingMessageId(null);
    }, []);

    return (
        <div
            ref={regionRef}
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none"
            data-testid={`conversation-detail-${conversation.id}`}
        >
            <ConversationDetailHeader
                conversation={conversation}
                onBack={onBack}
                messagesHeadingId={messagesHeadingId}
            />

            {isArchived ? <ConversationArchiveBanner /> : null}

            <ConversationMessageList
                messages={messages}
                conversationId={conversation.id}
                conversationStatus={conversation.status}
                editingMessageId={editingMessageId}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onEditSaved={handleEditSaved}
                listLabelId={messagesHeadingId}
                isInitialLoading={isInitialLoading}
                isLoadError={hasLoadError}
                isRetrying={isRetrying}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadOlder={() => {
                    void handleLoadOlder();
                }}
                onRetry={() => {
                    void handleRetry();
                }}
            />

            <ConversationMessageComposer
                conversationId={conversation.id}
                conversationStatus={conversation.status}
                canCreate={canCreate}
            />
        </div>
    );
};
