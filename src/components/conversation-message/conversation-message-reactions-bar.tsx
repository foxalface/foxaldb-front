import React, { Suspense, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SmilePlus } from 'lucide-react';
import { Button } from '@/components/button/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import {
    ConversationMessageReactionTrigger,
    ConversationMessageReactions,
} from '@/components/conversation-message/conversation-message';
import type { ConversationReactionAggregate } from '@/lib/conversations/conversation-types';
import { formatConversationReactionPreview } from '@/lib/conversations/format-conversation-reaction-preview';
import { resolveConversationReactionMutationErrorKey } from '@/lib/conversations/format-conversation-reaction-mutation-error';
import { useConversationMessageReactionSession } from '@/hooks/use-conversation-message-reaction-session';
import { ConversationMessageReactionChip } from './conversation-message-reaction-chip';

const ConversationEmojiPickerLazy = React.lazy(() =>
    import('./conversation-emoji-picker').then((module) => ({
        default: module.ConversationEmojiPicker,
    }))
);

export interface ConversationMessageReactionsBarProps {
    conversationId: number;
    messageId: number;
    reactions: ConversationReactionAggregate[];
    canReact: boolean;
    isEditing: boolean;
}

export const ConversationMessageReactionsBar: React.FC<
    ConversationMessageReactionsBarProps
> = ({ conversationId, messageId, reactions, canReact, isEditing }) => {
    const { t } = useTranslation();
    const {
        pickerOpen,
        setPickerOpen,
        triggerRef,
        pendingEmojis,
        mutationErrorKey,
        toggleReaction,
        handlePickerSelect,
    } = useConversationMessageReactionSession({
        conversationId,
        messageId,
        reactions,
        canReact,
        isEditing,
    });

    const shouldRestoreFocusRef = useRef(false);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (isEditing) {
                return;
            }

            setPickerOpen(open);

            if (open) {
                shouldRestoreFocusRef.current = true;
            }
        },
        [isEditing, setPickerOpen]
    );

    const handleCloseAutoFocus = useCallback(
        (event: Event) => {
            if (!shouldRestoreFocusRef.current) {
                return;
            }

            event.preventDefault();
            shouldRestoreFocusRef.current = false;
            triggerRef.current?.focus();
        },
        [triggerRef]
    );

    const showTrigger = canReact && !isEditing;
    const hasReactions = reactions.length > 0;

    if (!hasReactions && !showTrigger) {
        return null;
    }

    const mutationErrorMessage = mutationErrorKey
        ? t(resolveConversationReactionMutationErrorKey(mutationErrorKey))
        : null;

    return (
        <>
            <div
                className="flex min-w-0 max-w-full flex-nowrap items-start gap-1"
                data-testid="conversation-message-reactions-row"
            >
                {hasReactions ? (
                    <ConversationMessageReactions className="min-w-0 flex-1">
                        {reactions.map((reaction) => (
                            <ConversationMessageReactionChip
                                key={reaction.emoji}
                                reaction={reaction}
                                tooltip={formatConversationReactionPreview(
                                    reaction,
                                    t
                                )}
                                interactive={canReact && !isEditing}
                                pending={pendingEmojis.has(reaction.emoji)}
                                onToggle={() => {
                                    void toggleReaction(reaction.emoji);
                                }}
                            />
                        ))}
                    </ConversationMessageReactions>
                ) : null}
                {showTrigger ? (
                    <ConversationMessageReactionTrigger>
                        <Popover
                            open={pickerOpen}
                            onOpenChange={handleOpenChange}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <PopoverTrigger asChild>
                                        <Button
                                            ref={triggerRef}
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 gap-1 px-1.5 text-muted-foreground"
                                            aria-label={t(
                                                'side_panel.conversations_section.detail.message.reactions.add_aria'
                                            )}
                                            disabled={pendingEmojis.size > 0}
                                        >
                                            <SmilePlus className="size-3.5" />
                                        </Button>
                                    </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {t(
                                        'side_panel.conversations_section.detail.message.reactions.add_tooltip'
                                    )}
                                </TooltipContent>
                            </Tooltip>
                            <PopoverContent
                                side="top"
                                align="start"
                                className="w-[min(18rem,calc(100vw-2rem))] p-0"
                                onCloseAutoFocus={handleCloseAutoFocus}
                            >
                                {pickerOpen ? (
                                    <Suspense
                                        fallback={
                                            <p
                                                className="p-3 text-sm text-muted-foreground"
                                                role="status"
                                            >
                                                {t(
                                                    'side_panel.conversations_section.detail.message.reactions.picker_loading'
                                                )}
                                            </p>
                                        }
                                    >
                                        <ConversationEmojiPickerLazy
                                            onEmojiSelect={handlePickerSelect}
                                        />
                                    </Suspense>
                                ) : null}
                            </PopoverContent>
                        </Popover>
                    </ConversationMessageReactionTrigger>
                ) : null}
            </div>
            {mutationErrorMessage ? (
                <p className="w-full text-xs text-destructive" role="alert">
                    {mutationErrorMessage}
                </p>
            ) : null}
        </>
    );
};
