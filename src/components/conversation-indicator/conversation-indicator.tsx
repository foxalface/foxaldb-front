import React, { useId } from 'react';
import { SlBubbles } from 'react-icons/sl';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/spinner/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useOpenTargetConversation } from '@/hooks/use-open-target-conversation';
import type { DiagramConversationTarget } from '@/lib/conversations/conversation-types';
import { cn } from '@/lib/utils';

export interface ConversationIndicatorProps {
    target: DiagramConversationTarget;
    targetName: string;
    className?: string;
}

export const ConversationIndicator: React.FC<ConversationIndicatorProps> = ({
    target,
    targetName,
    className,
}) => {
    const { t } = useTranslation();
    const errorId = useId();
    const {
        hasActiveConversation,
        canCreate,
        isPending,
        errorMessage,
        openConversation,
    } = useOpenTargetConversation(target);

    if (!hasActiveConversation && !canCreate) {
        return null;
    }

    const labelKey = hasActiveConversation
        ? 'side_panel.conversations_section.target_entry.open_aria'
        : 'side_panel.conversations_section.target_entry.start_aria';

    const tooltipKey = hasActiveConversation
        ? 'side_panel.conversations_section.target_entry.open_tooltip'
        : isPending
          ? 'side_panel.conversations_section.target_entry.pending_tooltip'
          : 'side_panel.conversations_section.target_entry.start_tooltip';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        void openConversation();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            void openConversation();
        }
    };

    return (
        <span className={cn('relative inline-flex shrink-0', className)}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        data-testid="conversation-indicator"
                        className={cn(
                            'flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors',
                            'hover:bg-muted/70 hover:text-foreground',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                            hasActiveConversation &&
                                'bg-muted/70 text-foreground'
                        )}
                        aria-label={t(labelKey, { name: targetName })}
                        aria-describedby={
                            errorMessage !== null ? errorId : undefined
                        }
                        aria-busy={isPending}
                        disabled={isPending}
                        onClick={handleClick}
                        onKeyDown={handleKeyDown}
                    >
                        {isPending ? (
                            <Spinner size="small" className="size-3.5" />
                        ) : (
                            <SlBubbles
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    {t(tooltipKey, { name: targetName })}
                </TooltipContent>
            </Tooltip>
            {errorMessage !== null ? (
                <span id={errorId} role="alert" className="sr-only">
                    {errorMessage}
                </span>
            ) : null}
        </span>
    );
};
