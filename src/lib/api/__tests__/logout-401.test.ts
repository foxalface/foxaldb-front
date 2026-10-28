import { afterEach, describe, expect, it, vi } from 'vitest';
import { logout } from '@/lib/api/auth';
import {
    notifySessionExpired,
    registerSessionExpiredHandler,
} from '@/lib/api/session-expired';

describe('logout 401', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        registerSessionExpiredHandler(() => undefined)();
    });

    it('does not treat a logout 401 as an unexpected session expiry', async () => {
        const handler = vi.fn();
        const unregister = registerSessionExpiredHandler(handler);

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                text: async () =>
                    JSON.stringify({ message: 'Unauthenticated.' }),
            })
        );

        await expect(logout()).rejects.toThrow(/Unauthenticated/);
        expect(handler).not.toHaveBeenCalled();

        unregister();
    });

    it('still notifies session expiry for a protected 401', async () => {
        const handler = vi.fn();
        const unregister = registerSessionExpiredHandler(handler);

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                text: async () =>
                    JSON.stringify({ message: 'Unauthenticated.' }),
            })
        );

        const { apiRequest } = await import('@/lib/api/client');

        await expect(apiRequest('/diagrams/42')).rejects.toThrow(
            /Unauthenticated/
        );
        expect(handler).toHaveBeenCalledTimes(1);

        notifySessionExpired();
        expect(handler).toHaveBeenCalledTimes(2);

        unregister();
    });
});
