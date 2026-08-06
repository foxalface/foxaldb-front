import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type RefObject,
} from 'react';
import { useConversationMutations } from '@/hooks/use-conversation-mutations';
import type { ConversationReactionAggregate } from '@/lib/conversations/conversation-types';
import {
    resolveConversationReactionMutationError,
    type ConversationReactionMutationErrorKey,
} from '@/lib/conversations/format-conversation-reaction-mutation-error';

export interface UseConversationMessageReactionSessionOptions {
    conversationId: number;
    messageId: number;
    reactions: ConversationReactionAggregate[];
    canReact: boolean;
    isEditing: boolean;
}

export interface UseConversationMessageReactionSessionResult {
    pickerOpen: boolean;
    setPickerOpen: (open: boolean) => void;
    triggerRef: RefObject<HTMLButtonElement>;
    pendingEmojis: ReadonlySet<string>;
    mutationErrorKey: ConversationReactionMutationErrorKey | null;
    toggleReaction: (emoji: string) => Promise<void>;
    handlePickerSelect: (emoji: string) => Promise<void>;
}

export const useConversationMessageReactionSession = ({
    conversationId,
    messageId,
    reactions,
    canReact,
    isEditing,
}: UseConversationMessageReactionSessionOptions): UseConversationMessageReactionSessionResult => {
    const { addReaction, removeReaction } = useConversationMutations();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pendingEmojis, setPendingEmojis] = useState<Set<string>>(
        () => new Set()
    );
    const [mutationErrorKey, setMutationErrorKey] =
        useState<ConversationReactionMutationErrorKey | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const mountedRef = useRef(true);
    const sessionKeyRef = useRef(`${conversationId}:${messageId}`);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        sessionKeyRef.current = `${conversationId}:${messageId}`;
        setPendingEmojis(new Set());
        setMutationErrorKey(null);
        setPickerOpen(false);
    }, [conversationId, messageId]);

    const toggleReaction = useCallback(
        async (emoji: string): Promise<void> => {
            if (!canReact || isEditing) {
                return;
            }

            if (pendingEmojis.has(emoji)) {
                return;
            }

            const existingReaction = reactions.find(
                (reaction) => reaction.emoji === emoji
            );
            const shouldRemove = existingReaction?.reactedByMe === true;
            const sessionKey = sessionKeyRef.current;

            setPendingEmojis((current) => new Set(current).add(emoji));
            setMutationErrorKey(null);

            try {
                if (shouldRemove) {
                    await removeReaction(conversationId, messageId, emoji);
                } else {
                    await addReaction(conversationId, messageId, emoji);
                }
            } catch (error) {
                if (
                    mountedRef.current &&
                    sessionKeyRef.current === sessionKey
                ) {
                    setMutationErrorKey(
                        resolveConversationReactionMutationError(error).key
                    );
                }
            } finally {
                if (
                    mountedRef.current &&
                    sessionKeyRef.current === sessionKey
                ) {
                    setPendingEmojis((current) => {
                        const next = new Set(current);
                        next.delete(emoji);
                        return next;
                    });
                }
            }
        },
        [
            addReaction,
            canReact,
            conversationId,
            isEditing,
            messageId,
            pendingEmojis,
            reactions,
            removeReaction,
        ]
    );

    const handlePickerSelect = useCallback(
        async (emoji: string): Promise<void> => {
            setPickerOpen(false);
            await toggleReaction(emoji);
        },
        [toggleReaction]
    );

    return {
        pickerOpen,
        setPickerOpen,
        triggerRef,
        pendingEmojis,
        mutationErrorKey,
        toggleReaction,
        handlePickerSelect,
    };
};
