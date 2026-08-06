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
import { buttonVariants } from '@/components/button/button-variants';
import { LIST_ITEM_HEADER_BUTTON_CLASS } from '@/pages/editor-page/side-panel/list-item-header-button/list-item-header-button';

export type ConversationIndicatorAppearance = 'default' | 'list-item-header';

export interface ConversationIndicatorProps {
    target: DiagramConversationTarget;
    targetName: string;
    className?: string;
    buttonClassName?: string;
    appearance?: ConversationIndicatorAppearance;
    highlightWhenActive?: boolean;
    showTooltip?: boolean;
}

export const ConversationIndicator: React.FC<ConversationIndicatorProps> = ({
    target,
    targetName,
    className,
    buttonClassName,
    appearance = 'default',
    highlightWhenActive = true,
    showTooltip = true,
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

    const isListItemHeaderAppearance = appearance === 'list-item-header';

    const icon = isPending ? (
        <Spinner size="small" className="size-3.5" />
    ) : (
        <SlBubbles className="size-3.5" aria-hidden="true" />
    );

    const conversationButton = isListItemHeaderAppearance ? (
        <button
            type="button"
            data-testid="conversation-indicator"
            className={cn(
                buttonVariants({ variant: 'ghost' }),
                LIST_ITEM_HEADER_BUTTON_CLASS,
                buttonClassName
            )}
            aria-label={t(labelKey, { name: targetName })}
            aria-describedby={errorMessage !== null ? errorId : undefined}
            aria-busy={isPending}
            disabled={isPending}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            {icon}
        </button>
    ) : (
        <button
            type="button"
            data-testid="conversation-indicator"
            className={cn(
                'flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors',
                'hover:bg-muted/70 hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                highlightWhenActive &&
                    hasActiveConversation &&
                    'bg-muted/70 text-foreground',
                buttonClassName
            )}
            aria-label={t(labelKey, { name: targetName })}
            aria-describedby={errorMessage !== null ? errorId : undefined}
            aria-busy={isPending}
            disabled={isPending}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            {icon}
        </button>
    );

    const tooltipKey = hasActiveConversation
        ? 'side_panel.conversations_section.target_entry.open_tooltip'
        : isPending
          ? 'side_panel.conversations_section.target_entry.pending_tooltip'
          : 'side_panel.conversations_section.target_entry.start_tooltip';

    return (
        <span className={cn('relative inline-flex shrink-0', className)}>
            {showTooltip ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        {conversationButton}
                    </TooltipTrigger>
                    <TooltipContent>
                        {t(tooltipKey, { name: targetName })}
                    </TooltipContent>
                </Tooltip>
            ) : (
                conversationButton
            )}
            {errorMessage !== null ? (
                <span id={errorId} role="alert" className="sr-only">
                    {errorMessage}
                </span>
            ) : null}
        </span>
    );
};
