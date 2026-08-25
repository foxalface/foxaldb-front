import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    notifySessionExpired,
    registerSessionExpiredHandler,
} from '../session-expired';

describe('session-expired', () => {
    const cleanups: Array<() => void> = [];

    afterEach(() => {
        while (cleanups.length > 0) {
            cleanups.pop()?.();
        }
    });

    it('invokes the registered handler', () => {
        const handler = vi.fn();
        cleanups.push(registerSessionExpiredHandler(handler));

        notifySessionExpired();

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('stops invoking the handler after unregistering', () => {
        const handler = vi.fn();
        const unregister = registerSessionExpiredHandler(handler);
        cleanups.push(unregister);

        unregister();
        notifySessionExpired();

        expect(handler).not.toHaveBeenCalled();
    });
});
