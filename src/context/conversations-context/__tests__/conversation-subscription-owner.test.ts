import { describe, expect, it, vi } from 'vitest';
import {
    adoptConversationSubscription,
    clearActiveConversationSubscription,
    type ActiveConversationSubscription,
} from '../conversation-subscription-owner';

describe('conversation-subscription-owner', () => {
    it('first adoption becomes active and matching release cleans once', () => {
        const activeRef: { current: ActiveConversationSubscription | null } = {
            current: null,
        };
        const cleanup = vi.fn();

        const release = adoptConversationSubscription(activeRef, cleanup);

        expect(activeRef.current).not.toBeNull();
        expect(activeRef.current?.cleanup).toBe(cleanup);

        release();

        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(activeRef.current).toBeNull();
    });

    it('stale release cannot clear a newer adoption', () => {
        const activeRef: { current: ActiveConversationSubscription | null } = {
            current: null,
        };
        const cleanupA = vi.fn();
        const cleanupB = vi.fn();

        const releaseA = adoptConversationSubscription(activeRef, cleanupA);
        clearActiveConversationSubscription(activeRef);

        adoptConversationSubscription(activeRef, cleanupB);
        releaseA();

        expect(cleanupB).not.toHaveBeenCalled();
        expect(activeRef.current?.cleanup).toBe(cleanupB);
    });
});
