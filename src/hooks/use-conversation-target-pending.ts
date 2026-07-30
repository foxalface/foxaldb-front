import { useSyncExternalStore } from 'react';
import {
    getConversationTargetPendingSnapshot,
    isConversationTargetPending,
    subscribeToConversationTargetPending,
} from '@/lib/conversations/conversation-target-pending';

/**
 * Reactive pending state for a single diagram-scoped conversation target key.
 */
export const useConversationTargetPending = (key: string | null): boolean =>
    useSyncExternalStore(
        subscribeToConversationTargetPending,
        () => (key === null ? false : isConversationTargetPending(key)),
        () => false
    );

export const useConversationTargetPendingSnapshot = (): number =>
    useSyncExternalStore(
        subscribeToConversationTargetPending,
        getConversationTargetPendingSnapshot,
        () => 0
    );
