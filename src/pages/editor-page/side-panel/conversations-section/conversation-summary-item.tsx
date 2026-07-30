import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/button/button';
import { useChartDB } from '@/hooks/use-chartdb';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { ConversationSummaryTimestamp } from './conversation-summary-timestamp';
import {
    resolveConversationTargetLabel,
    type ResolvedConversationTargetLabel,
} from './resolve-conversation-target-label';

export interface ConversationSummaryItemProps {
    conversation: DiagramConversation;
    isArchived: boolean;
    isMutationPending: boolean;
    onSelect?: (conversationId: number) => void;
    onArchive?: (conversationId: number) => void;
    onReopen?: (conversationId: number) => void;
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
}) => {
    const { t } = useTranslation();
    const { tables, relationships, diagramName } = useChartDB();

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

    const authorName = conversation.lastMessageAuthor?.fullName?.trim()
        ? conversation.lastMessageAuthor.fullName.trim()
        : conversation.lastMessageAuthor
          ? t('side_panel.conversations_section.deleted_user')
          : null;

    const preview =
        conversation.lastMessagePreview?.trim() ??
        (conversation.messageCount === 0
            ? t('side_panel.conversations_section.summary.no_messages')
            : null);

    const activityTimestamp =
        conversation.lastMessageAt ?? conversation.updatedAt;

    const actionLabel = isArchived
        ? isMutationPending
            ? t('side_panel.conversations_section.actions.reopening')
            : t('side_panel.conversations_section.actions.reopen')
        : isMutationPending
          ? t('side_panel.conversations_section.actions.archiving')
          : t('side_panel.conversations_section.actions.archive');

    const actionAriaLabel = isArchived
        ? t('side_panel.conversations_section.actions.reopen_aria', {
              target: targetLabel.title,
          })
        : t('side_panel.conversations_section.actions.archive_aria', {
              target: targetLabel.title,
          });

    const handleAction = () => {
        if (isMutationPending) {
            return;
        }

        if (isArchived) {
            onReopen?.(conversation.id);
            return;
        }

        onArchive?.(conversation.id);
    };

    const handleOpen = () => {
        onSelect?.(conversation.id);
    };

    return (
        <article
            className={`flex flex-col gap-2 rounded-md border px-3 py-2.5 ${
                isArchived
                    ? 'border-muted bg-muted/30 opacity-90'
                    : 'border-border bg-background'
            }`}
            aria-label={targetLabel.title}
            data-archived={isArchived ? 'true' : 'false'}
            data-testid={`conversation-summary-${conversation.id}`}
        >
            <button
                type="button"
                className="flex w-full flex-col gap-2 text-left"
                onClick={handleOpen}
                aria-label={t(
                    'side_panel.conversations_section.summary.open_aria',
                    { target: targetLabel.title }
                )}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {targetLabel.typeLabel}
                        </p>
                        <h3
                            className={`truncate text-sm font-semibold ${
                                targetLabel.isMissing
                                    ? 'italic text-muted-foreground'
                                    : 'text-foreground'
                            }`}
                        >
                            {targetLabel.title}
                        </h3>
                    </div>
                    <ConversationSummaryTimestamp
                        timestamp={activityTimestamp}
                    />
                </div>

                {preview ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                        {preview}
                    </p>
                ) : null}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>
                        {t(
                            'side_panel.conversations_section.summary.message_count',
                            {
                                count: conversation.messageCount,
                            }
                        )}
                    </span>
                    {authorName ? (
                        <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{authorName}</span>
                        </>
                    ) : null}
                    {isArchived ? (
                        <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-muted-foreground">
                                {t(
                                    'side_panel.conversations_section.read_only'
                                )}
                            </span>
                        </>
                    ) : null}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0 gap-1 px-2 text-xs"
                    onClick={handleAction}
                    disabled={isMutationPending}
                    aria-label={actionAriaLabel}
                >
                    {isArchived ? (
                        <ArchiveRestore
                            className="size-3.5"
                            aria-hidden="true"
                        />
                    ) : (
                        <Archive className="size-3.5" aria-hidden="true" />
                    )}
                    {actionLabel}
                </Button>
            </div>
        </article>
    );
};
