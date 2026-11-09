import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRequestAuthentication } from '@/hooks/use-request-authentication';

const openAuthDialog = vi.fn();
const setAuthIntent = vi.fn();

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openAuthDialog,
    }),
}));

vi.mock('@/hooks/use-auth-intent', () => ({
    useAuthIntent: () => ({
        setAuthIntent,
    }),
}));

describe('useRequestAuthentication', () => {
    it('opens Login as a protected action and stores the intent', () => {
        const { result } = renderHook(() => useRequestAuthentication());

        result.current({
            type: 'protected-action',
            action: 'share',
        });

        expect(setAuthIntent).toHaveBeenCalledWith({
            type: 'protected-action',
            action: 'share',
        });
        expect(openAuthDialog).toHaveBeenCalledWith('protected-action');
    });
});
