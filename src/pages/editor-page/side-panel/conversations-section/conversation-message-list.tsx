import React from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/spinner/spinner';
import { Button } from '@/components/button/button';
import { EmptyState } from '@/components/empty-state/empty-state';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { ConversationMessageItem } from './conversation-message-item';
import { ConversationsErrorState } from './conversations-error-state';

export interface ConversationMessageListProps {
    messages: ReadonlyArray<DiagramConversationMessage>;
    conversationId: number;
    conversationStatus: ConversationStatus;
    editingMessageId: number | null;
    onStartEdit: (messageId: number) => void;
    onCancelEdit: () => void;
    onEditSaved: () => void;
    listLabelId: string;
    isInitialLoading: boolean;
    isLoadError: boolean;
    isRetrying: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadOlder: () => void;
    onRetry: () => void;
}

export const ConversationMessageList: React.FC<
    ConversationMessageListProps
> = ({
    messages,
    conversationId,
    conversationStatus,
    editingMessageId,
    onStartEdit,
    onCancelEdit,
    onEditSaved,
    listLabelId,
    isInitialLoading,
    isLoadError,
    isRetrying,
    isLoadingMore,
    hasMore,
    onLoadOlder,
    onRetry,
}) => {
    const { t } = useTranslation();

    if (isInitialLoading) {
        return (
            <div
                className="flex flex-1 flex-col items-center justify-center gap-2 py-8"
                aria-busy="true"
                role="status"
                aria-live="polite"
            >
                <Spinner size="small" />
                <span className="text-sm text-muted-foreground">
                    {t('side_panel.conversations_section.detail.loading')}
                </span>
            </div>
        );
    }

    if (isLoadError) {
        return (
            <ConversationsErrorState
                onRetry={onRetry}
                isRetrying={isRetrying}
                titleKey="side_panel.conversations_section.detail.errors.load_title"
                descriptionKey="side_panel.conversations_section.detail.errors.load_description"
            />
        );
    }

    if (messages.length === 0) {
        return (
            <EmptyState
                title={t('side_panel.conversations_section.detail.empty.title')}
                description={t(
                    'side_panel.conversations_section.detail.empty.description'
                )}
                className="mt-12 px-2"
            />
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-1">
            {hasMore ? (
                <div className="flex justify-center py-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onLoadOlder}
                        disabled={isLoadingMore}
                        aria-busy={isLoadingMore}
                    >
                        {isLoadingMore ? (
                            <>
                                <Spinner size="small" className="mr-2 size-4" />
                                {t(
                                    'side_panel.conversations_section.detail.loading_more'
                                )}
                            </>
                        ) : (
                            t(
                                'side_panel.conversations_section.detail.load_older'
                            )
                        )}
                    </Button>
                </div>
            ) : null}

            <ul
                className="flex list-none flex-col px-1 pb-2"
                aria-labelledby={listLabelId}
                role="list"
            >
                {messages.map((message) => (
                    <li
                        key={message.id}
                        className="border-b border-border/60 last:border-b-0"
                    >
                        <ConversationMessageItem
                            message={message}
                            conversationId={conversationId}
                            conversationStatus={conversationStatus}
                            editingMessageId={editingMessageId}
                            onStartEdit={onStartEdit}
                            onCancelEdit={onCancelEdit}
                            onEditSaved={onEditSaved}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};
