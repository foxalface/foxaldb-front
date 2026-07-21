import type { MutableRefObject } from 'react';

export interface ActiveCommentSubscription {
    cleanup: () => void;
    token: symbol;
}

/**
 * Clears the current subscription. Nulls the ref before invoking cleanup so a
 * throwing cleanup cannot leave a poisoned active entry.
 */
export const clearActiveCommentSubscription = (
    activeSubscriptionRef: MutableRefObject<ActiveCommentSubscription | null>
): void => {
    const active = activeSubscriptionRef.current;
    activeSubscriptionRef.current = null;
    if (active !== null) {
        active.cleanup();
    }
};

/**
 * Adopts a subscriber cleanup under an owner token and returns a release that
 * only clears the subscription when it is still the active owner.
 */
export const adoptCommentSubscription = (
    activeSubscriptionRef: MutableRefObject<ActiveCommentSubscription | null>,
    cleanup: () => void
): (() => void) => {
    const token = Symbol('comment-subscription');

    activeSubscriptionRef.current = {
        cleanup,
        token,
    };

    let released = false;

    return () => {
        if (released) {
            return;
        }

        released = true;

        const active = activeSubscriptionRef.current;
        if (active === null || active.token !== token) {
            return;
        }

        activeSubscriptionRef.current = null;
        cleanup();
    };
};
