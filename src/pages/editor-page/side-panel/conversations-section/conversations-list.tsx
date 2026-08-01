import React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/spinner/spinner';
import { Button } from '@/components/button/button';
import { ConversationsEmptyState } from './conversations-empty-state';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { ConversationSummaryItem } from './conversation-summary-item';
import { ConversationsErrorState } from './conversations-error-state';

export interface ConversationsListProps {
    conversations: ReadonlyArray<DiagramConversation>;
    isArchived: boolean;
    isInitialLoading: boolean;
    isLoadError: boolean;
    isRetrying: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    isMutationPending: (conversationId: number) => boolean;
    onSelect?: (conversationId: number) => void;
    onArchive?: (conversationId: number) => void;
    onReopen?: (conversationId: number) => void;
    onLoadMore: () => void;
    onRetry: () => void;
    listLabelId: string;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
    conversations,
    isArchived,
    isInitialLoading,
    isLoadError,
    isRetrying,
    isLoadingMore,
    hasMore,
    isMutationPending,
    onSelect,
    onArchive,
    onReopen,
    onLoadMore,
    onRetry,
    listLabelId,
}) => {
    const { t } = useTranslation();

    if (isInitialLoading) {
        return (
            <div
                className="flex flex-1 flex-col items-center justify-center gap-2 py-8"
                aria-busy="true"
                role="status"
            >
                <Spinner size="small" />
                <span className="text-sm text-muted-foreground">
                    {t('side_panel.conversations_section.loading')}
                </span>
            </div>
        );
    }

    if (isLoadError) {
        return (
            <ConversationsErrorState
                onRetry={onRetry}
                isRetrying={isRetrying}
            />
        );
    }

    if (conversations.length === 0) {
        return <ConversationsEmptyState isArchived={isArchived} />;
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto py-1">
            <ul
                className="flex flex-col gap-2"
                aria-labelledby={listLabelId}
                role="list"
            >
                {conversations.map((conversation) => (
                    <li key={conversation.id}>
                        <ConversationSummaryItem
                            conversation={conversation}
                            isArchived={isArchived}
                            isMutationPending={isMutationPending(
                                conversation.id
                            )}
                            onSelect={onSelect}
                            onArchive={onArchive}
                            onReopen={onReopen}
                        />
                    </li>
                ))}
            </ul>

            {hasMore ? (
                <div className="flex justify-center py-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        aria-busy={isLoadingMore}
                    >
                        {isLoadingMore ? (
                            <>
                                <Spinner size="small" className="mr-2 size-4" />
                                {t(
                                    'side_panel.conversations_section.loading_more'
                                )}
                            </>
                        ) : (
                            t('side_panel.conversations_section.load_more')
                        )}
                    </Button>
                </div>
            ) : null}
        </div>
    );
};
