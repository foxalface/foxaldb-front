import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/button/button';
import { useChartDB } from '@/hooks/use-chartdb';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { ConversationSummaryTimestamp } from './conversation-summary-timestamp';
import { resolveConversationTargetLabel } from './resolve-conversation-target-label';

export interface ConversationDetailHeaderProps {
    conversation: DiagramConversation;
    onBack: () => void;
    messagesHeadingId: string;
}

export const ConversationDetailHeader: React.FC<
    ConversationDetailHeaderProps
> = ({ conversation, onBack, messagesHeadingId }) => {
    const { t } = useTranslation();
    const { tables, relationships, diagramName } = useChartDB();

    const targetLabel = useMemo(
        () =>
            resolveConversationTargetLabel(conversation, {
                diagramName,
                tables,
                relationships,
                t,
            }),
        [conversation, diagramName, tables, relationships, t]
    );

    const isArchived = conversation.status === 'archived';
    const activityTimestamp =
        conversation.lastMessageAt ?? conversation.updatedAt;

    const statusLabel = isArchived
        ? t('side_panel.conversations_section.detail.metadata.status_archived')
        : t('side_panel.conversations_section.detail.metadata.status_active');

    return (
        <header className="flex shrink-0 flex-col gap-2 border-b border-border/60 pb-2">
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    onClick={onBack}
                    aria-label={t(
                        'side_panel.conversations_section.detail.back_aria'
                    )}
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {t('side_panel.conversations_section.detail.back')}
                </Button>
            </div>

            <div className="flex flex-col gap-1 px-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {targetLabel.typeLabel}
                </p>
                <h3
                    id={messagesHeadingId}
                    className={`text-sm font-semibold ${
                        targetLabel.isMissing
                            ? 'italic text-muted-foreground'
                            : 'text-foreground'
                    }`}
                >
                    {targetLabel.title}
                </h3>
            </div>

            <dl className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <dt className="sr-only">
                        {t(
                            'side_panel.conversations_section.detail.metadata.status_label'
                        )}
                    </dt>
                    <dd
                        className={
                            isArchived
                                ? 'font-medium text-muted-foreground'
                                : ''
                        }
                    >
                        {statusLabel}
                    </dd>
                </div>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1">
                    <dt className="sr-only">
                        {t(
                            'side_panel.conversations_section.detail.metadata.message_count_label'
                        )}
                    </dt>
                    <dd>
                        {t(
                            'side_panel.conversations_section.detail.metadata.message_count',
                            { count: conversation.messageCount }
                        )}
                    </dd>
                </div>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1">
                    <dt className="sr-only">
                        {t(
                            'side_panel.conversations_section.summary.last_activity'
                        )}
                    </dt>
                    <dd>
                        <ConversationSummaryTimestamp
                            timestamp={activityTimestamp}
                        />
                    </dd>
                </div>
            </dl>
        </header>
    );
};
