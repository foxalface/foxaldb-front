import React, { useId } from 'react';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { ConversationArchiveBanner } from './conversation-archive-banner';
import { ConversationDetailHeader } from './conversation-detail-header';
import { ConversationMessageList } from './conversation-message-list';
import { useConversationDetail } from './use-conversation-detail';

export interface ConversationDetailProps {
    conversation: DiagramConversation;
    onBack: () => void;
}

export const ConversationDetail: React.FC<ConversationDetailProps> = ({
    conversation,
    onBack,
}) => {
    const messagesHeadingId = useId();
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

    return (
        <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
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
        </div>
    );
};
