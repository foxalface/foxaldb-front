import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { AuthIntentProvider } from '@/context/auth-intent-context/auth-intent-provider';
import { deviceDiagramLocation } from '@/lib/diagram/diagram-location';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import { useAuthIntent } from '@/hooks/use-auth-intent';

const authState = {
    isAuthenticated: false,
    isLoading: false,
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <AuthIntentProvider>
        <DiagramLocationProvider
            initialLocation={deviceDiagramLocation('local-open')}
        >
            {children}
        </DiagramLocationProvider>
    </AuthIntentProvider>
);

describe('AuthIntent DiagramLocation invariant (A1 regression)', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = false;
    });

    it('does not change DiagramLocation when auth succeeds with pending intent', async () => {
        const { result, rerender } = renderHook(
            () => ({
                intent: useAuthIntent(),
                location: useDiagramLocation(),
            }),
            { wrapper }
        );

        act(() => {
            result.current.intent.setAuthIntent({ type: 'open-online-tab' });
        });

        expect(result.current.location.location).toEqual(
            deviceDiagramLocation('local-open')
        );

        act(() => {
            authState.isAuthenticated = true;
        });
        rerender();

        await waitFor(() => {
            expect(result.current.intent.lastConsumedIntent).toEqual({
                type: 'open-online-tab',
            });
        });

        expect(result.current.location.location).toEqual(
            deviceDiagramLocation('local-open')
        );
    });
});
