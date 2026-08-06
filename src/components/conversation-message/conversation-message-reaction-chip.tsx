import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import type { ConversationReactionAggregate } from '@/lib/conversations/conversation-types';
import { cn } from '@/lib/utils';

export interface ConversationMessageReactionChipProps {
    reaction: ConversationReactionAggregate;
    tooltip: string;
    interactive: boolean;
    pending: boolean;
    onToggle: () => void;
}

export const ConversationMessageReactionChip: React.FC<
    ConversationMessageReactionChipProps
> = ({ reaction, tooltip, interactive, pending, onToggle }) => {
    const { t } = useTranslation();
    const chipLabel = t(
        'side_panel.conversations_section.detail.message.reactions.chip_aria',
        {
            emoji: reaction.emoji,
            count: reaction.count,
        }
    );

    const chipContent = (
        <>
            <span aria-hidden="true">{reaction.emoji}</span>
            <span>{reaction.count}</span>
        </>
    );

    if (!interactive) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        data-slot="conversation-message-reaction-chip"
                        className="inline-flex h-6 items-center gap-1 rounded-md border border-border/60 bg-muted/20 px-1.5 text-xs text-foreground"
                        aria-disabled="true"
                        aria-label={chipLabel}
                    >
                        {chipContent}
                    </span>
                </TooltipTrigger>
                <TooltipContent side="top">{tooltip}</TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant={reaction.reactedByMe ? 'secondary' : 'outline'}
                    size="sm"
                    data-slot="conversation-message-reaction-chip"
                    className={cn(
                        'h-6 gap-1 px-1.5 text-xs font-normal',
                        reaction.reactedByMe
                            ? 'border-primary/30 bg-primary/10 text-foreground'
                            : undefined
                    )}
                    aria-pressed={reaction.reactedByMe}
                    aria-busy={pending}
                    aria-label={chipLabel}
                    disabled={pending}
                    onClick={onToggle}
                >
                    {chipContent}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">{tooltip}</TooltipContent>
        </Tooltip>
    );
};
