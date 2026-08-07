import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/spinner/spinner';
import { Button } from '@/components/button/button';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import { EmptyState } from '@/components/empty-state/empty-state';
import type {
    ConversationStatus,
    DiagramConversationMessage,
} from '@/lib/conversations/conversation-types';
import { ConversationMessageItem } from './conversation-message-item';
import { ConversationsErrorState } from './conversations-error-state';
import { ConversationMessageDaySeparator } from '@/components/conversation-message/conversation-message-day-separator';
import { useConversationMessageDayGroups } from '@/hooks/use-conversation-message-day-groups';
import { useConversationMessageListInitialScroll } from './use-conversation-message-list-initial-scroll';

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
    const dayGroups = useConversationMessageDayGroups(messages);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useConversationMessageListInitialScroll({
        conversationId,
        messagesLength: messages.length,
        isInitialLoading,
        isLoadError,
        scrollAreaRef,
    });

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
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full">
                <div className="px-1.5 pb-2">
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
                                        <Spinner
                                            size="small"
                                            className="mr-2 size-4"
                                        />
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
                        className="flex list-none flex-col"
                        aria-labelledby={listLabelId}
                        role="list"
                    >
                        {dayGroups.flatMap((group) => [
                            <li key={`day-${group.dayKey}`}>
                                <ConversationMessageDaySeparator
                                    label={group.label}
                                />
                            </li>,
                            ...group.messages.map((message) => (
                                <li key={message.id}>
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
                            )),
                        ])}
                    </ul>
                </div>
            </ScrollArea>
        </div>
    );
};
