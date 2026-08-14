import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CircleDotDashed } from 'lucide-react';
import { Button } from '@/components/button/button';
import { ConversationTargetTypeIcon } from '@/components/conversations/conversation-target-type-icon';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useChartDB } from '@/hooks/use-chartdb';
import { useFocusOnConversationTarget } from '@/hooks/use-focus-on-conversation-target';
import { cn } from '@/lib/utils';
import { LIST_ITEM_HEADER_BUTTON_CLASS } from '@/pages/editor-page/side-panel/list-item-header-button/list-item-header-button';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
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
    const { canFocusOnTarget, focusOnTarget } =
        useFocusOnConversationTarget(conversation);
    const focusTargetAriaLabel = t(
        'side_panel.conversations_section.summary.focus_target_aria',
        { target: targetLabel.title }
    );

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

            <TooltipProvider>
                <div className="flex min-w-0 items-center gap-1.5 pl-2 pr-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span
                                className="inline-flex shrink-0 text-muted-foreground"
                                data-testid="conversation-detail-target-type"
                            >
                                <ConversationTargetTypeIcon
                                    targetType={conversation.targetType}
                                />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>{targetLabel.typeLabel}</TooltipContent>
                    </Tooltip>
                    <h3
                        id={messagesHeadingId}
                        className={cn(
                            'min-w-0 flex-1 truncate text-sm font-semibold',
                            targetLabel.isMissing
                                ? 'italic text-muted-foreground'
                                : 'text-foreground'
                        )}
                    >
                        {targetLabel.title}
                    </h3>
                    {canFocusOnTarget ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={focusTargetAriaLabel}
                            data-testid="conversation-detail-focus-target"
                            className={cn(
                                LIST_ITEM_HEADER_BUTTON_CLASS,
                                'size-7 shrink-0 p-0'
                            )}
                            onClick={focusOnTarget}
                        >
                            <CircleDotDashed
                                className="size-4"
                                aria-hidden="true"
                            />
                        </Button>
                    ) : null}
                </div>
            </TooltipProvider>
        </header>
    );
};
