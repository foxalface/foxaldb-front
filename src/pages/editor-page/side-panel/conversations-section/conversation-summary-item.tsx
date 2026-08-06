import React, { useCallback, useMemo, useRef, useState } from 'react';
import { History, MessageSquare, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { getConversationSummaryCapabilities } from '@/lib/conversations/conversation-summary-capabilities';
import { resolveConversationSummaryDisplayText } from '@/lib/conversations/conversation-summary-body';
import { ConversationUnreadBadgeWithTranslation } from '@/components/conversations/conversation-unread-badge';
import { ConversationSummaryTimestamp } from './conversation-summary-timestamp';
import { ConversationSummaryActionsMenu } from './conversation-summary-actions-menu';
import { ConversationSummaryDeleteDialog } from './conversation-summary-delete-dialog';
import {
    resolveConversationTargetLabel,
    type ResolvedConversationTargetLabel,
} from './resolve-conversation-target-label';

export const CONVERSATION_SUMMARY_CARD_HEIGHT_CLASS = 'h-[7.75rem]';

export const CONVERSATION_SUMMARY_PREVIEW_CLASS =
    'conversation-summary-preview min-h-8 w-full min-w-0 shrink-0 text-xs leading-4 text-muted-foreground';

export interface ConversationSummaryItemProps {
    conversation: DiagramConversation;
    isArchived: boolean;
    isMutationPending: boolean;
    onSelect?: (conversationId: number) => void;
    onArchive?: (conversationId: number) => void;
    onReopen?: (conversationId: number) => void;
    onDelete?: (conversationId: number) => Promise<void>;
}

export const ConversationSummaryItem: React.FC<
    ConversationSummaryItemProps
> = ({
    conversation,
    isArchived,
    isMutationPending,
    onSelect,
    onArchive,
    onReopen,
    onDelete,
}) => {
    const { t } = useTranslation();
    const { tables, relationships, diagramName } = useChartDB();
    const { diagramAccess } = useDiagramAccess();
    const actionsTriggerRef = useRef<HTMLButtonElement>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const targetLabel: ResolvedConversationTargetLabel = useMemo(
        () =>
            resolveConversationTargetLabel(conversation, {
                diagramName,
                tables,
                relationships,
                t,
            }),
        [conversation, diagramName, tables, relationships, t]
    );

    const capabilities = useMemo(
        () => getConversationSummaryCapabilities(diagramAccess),
        [diagramAccess]
    );

    const authorName = conversation.lastMessageAuthor?.fullName?.trim()
        ? conversation.lastMessageAuthor.fullName.trim()
        : conversation.lastMessageAuthor
          ? t('side_panel.conversations_section.deleted_user')
          : null;

    const visibleAuthorLabel =
        authorName ??
        t('side_panel.conversations_section.summary.author_missing_tooltip');

    const visiblePreview = useMemo(
        () =>
            resolveConversationSummaryDisplayText(
                conversation.lastMessageBody,
                t('side_panel.conversations_section.summary.no_messages')
            ),
        [conversation.lastMessageBody, t]
    );

    const activityTimestamp =
        conversation.lastMessageAt ?? conversation.updatedAt;

    const authorTooltip =
        authorName !== null
            ? t('side_panel.conversations_section.summary.author_tooltip', {
                  name: authorName,
              })
            : t(
                  'side_panel.conversations_section.summary.author_missing_tooltip'
              );

    const messageCountTooltip = t(
        'side_panel.conversations_section.summary.message_count',
        { count: conversation.messageCount }
    );

    const handleOpen = useCallback(() => {
        onSelect?.(conversation.id);
    }, [conversation.id, onSelect]);

    const handleOpenKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpen();
            }
        },
        [handleOpen]
    );

    const openAriaLabel = t(
        'side_panel.conversations_section.summary.open_aria',
        { target: targetLabel.title }
    );

    const handleArchive = useCallback(() => {
        if (isMutationPending) {
            return;
        }

        onArchive?.(conversation.id);
    }, [conversation.id, isMutationPending, onArchive]);

    const handleReopen = useCallback(() => {
        if (isMutationPending) {
            return;
        }

        onReopen?.(conversation.id);
    }, [conversation.id, isMutationPending, onReopen]);

    const handleDeleteRequest = useCallback(() => {
        if (isMutationPending) {
            return;
        }

        setIsDeleteDialogOpen(true);
    }, [isMutationPending]);

    const restoreActionsFocus = useCallback(() => {
        actionsTriggerRef.current?.focus();
    }, []);

    const handleConfirmDelete = useCallback(
        async (conversationId: number) => {
            await onDelete?.(conversationId);
        },
        [onDelete]
    );

    const handleDeleted = useCallback(() => {
        restoreActionsFocus();
    }, [restoreActionsFocus]);

    return (
        <article
            className={cn(
                'relative flex overflow-hidden rounded-md border px-3 py-2.5',
                CONVERSATION_SUMMARY_CARD_HEIGHT_CLASS,
                isArchived
                    ? 'border-muted bg-muted/30 opacity-90'
                    : 'border-border bg-background'
            )}
            aria-label={targetLabel.title}
            data-archived={isArchived ? 'true' : 'false'}
            data-testid={`conversation-summary-${conversation.id}`}
        >
            <ConversationUnreadBadgeWithTranslation
                count={conversation.unreadCount}
                translationKey="side_panel.conversations_section.unread.badge_aria"
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
                <div
                    role="button"
                    tabIndex={0}
                    className="flex min-h-0 min-w-0 flex-1 cursor-pointer flex-col gap-2 text-left"
                    onClick={handleOpen}
                    onKeyDown={handleOpenKeyDown}
                    aria-label={openAriaLabel}
                >
                    <div className="min-w-0 shrink-0 pr-7">
                        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {targetLabel.typeLabel}
                        </p>
                        <h3
                            className={cn(
                                'truncate text-sm font-semibold',
                                targetLabel.isMissing
                                    ? 'italic text-muted-foreground'
                                    : 'text-foreground'
                            )}
                        >
                            {targetLabel.title}
                        </h3>
                    </div>

                    <div
                        className={CONVERSATION_SUMMARY_PREVIEW_CLASS}
                        data-testid="conversation-summary-preview"
                    >
                        {visiblePreview}
                    </div>
                </div>

                <TooltipProvider>
                    <div
                        className="mt-auto flex w-full min-w-0 shrink-0 items-center gap-3 overflow-hidden whitespace-nowrap text-xs text-muted-foreground"
                        data-testid="conversation-summary-metadata"
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex shrink-0 items-center gap-1">
                                    <MessageSquare
                                        className="size-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span>{conversation.messageCount}</span>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {messageCountTooltip}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className="inline-flex min-w-0 flex-1 items-center gap-1"
                                    data-testid="conversation-summary-author"
                                >
                                    <User
                                        className={cn(
                                            'size-3.5 shrink-0',
                                            authorName === null && 'opacity-50'
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">
                                        {visibleAuthorLabel}
                                    </span>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>{authorTooltip}</TooltipContent>
                        </Tooltip>

                        <span
                            className="ml-auto inline-flex shrink-0 items-center gap-1"
                            data-testid="conversation-summary-timestamp"
                        >
                            <History
                                className="size-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            <ConversationSummaryTimestamp
                                timestamp={activityTimestamp}
                            />
                        </span>
                    </div>
                </TooltipProvider>
            </div>

            <div
                className="absolute right-2 top-2.5 z-10"
                onClick={(event) => event.stopPropagation()}
            >
                <ConversationSummaryActionsMenu
                    ref={actionsTriggerRef}
                    isArchived={isArchived}
                    canDelete={capabilities.canDelete}
                    disabled={isMutationPending}
                    onOpen={handleOpen}
                    onArchive={handleArchive}
                    onReopen={handleReopen}
                    onDelete={handleDeleteRequest}
                    onCloseAutoFocus={restoreActionsFocus}
                />
            </div>

            {capabilities.canDelete ? (
                <ConversationSummaryDeleteDialog
                    conversationId={conversation.id}
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirmDelete={handleConfirmDelete}
                    onDeleted={handleDeleted}
                    onCloseAutoFocus={restoreActionsFocus}
                />
            ) : null}
        </article>
    );
};
