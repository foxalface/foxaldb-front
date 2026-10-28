import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthIntentProvider } from '@/context/auth-intent-context/auth-intent-provider';
import { useEntryFlowRouteAuthIntent } from '@/hooks/use-entry-flow-route-auth-intent';
import { useAuthIntent } from '@/hooks/use-auth-intent';

const authState = {
    isAuthenticated: false,
    isLoading: false,
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <AuthIntentProvider>{children}</AuthIntentProvider>
);

const useRouteIntentProbe = (
    routeDiagramId: string | undefined,
    stateKind: 'awaitingGuestChoice' | 'ready'
) => {
    useEntryFlowRouteAuthIntent(
        routeDiagramId,
        authState.isAuthenticated,
        authState.isLoading,
        stateKind
    );
    return useAuthIntent();
};

describe('useEntryFlowRouteAuthIntent', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = false;
    });

    it('sets open-online-diagram for numeric guest routes in awaitingGuestChoice', async () => {
        const { result, rerender } = renderHook(
            () => useRouteIntentProbe('42', 'awaitingGuestChoice'),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.pendingIntent).toEqual({
                type: 'open-online-diagram',
                diagramId: '42',
            });
        });

        rerender();

        expect(result.current.pendingIntent).toEqual({
            type: 'open-online-diagram',
            diagramId: '42',
        });
    });

    it('does not set intent for non-backend route ids', async () => {
        const { result } = renderHook(
            () => useRouteIntentProbe('workspace-local', 'awaitingGuestChoice'),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.pendingIntent).toEqual({ type: 'none' });
        });
    });

    it('does not set intent when already authenticated', async () => {
        authState.isAuthenticated = true;

        const { result } = renderHook(
            () => useRouteIntentProbe('42', 'awaitingGuestChoice'),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.pendingIntent).toEqual({ type: 'none' });
        });
    });
});
