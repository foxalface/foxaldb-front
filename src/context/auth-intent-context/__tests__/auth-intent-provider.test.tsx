import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthIntentProvider } from '@/context/auth-intent-context/auth-intent-provider';
import { useAuthIntent } from '@/hooks/use-auth-intent';

const authState = {
    isAuthenticated: false,
    isLoading: true,
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <AuthIntentProvider>{children}</AuthIntentProvider>
);

describe('AuthIntentProvider', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        authState.isLoading = true;
    });

    it('exposes none by default after session resolves', async () => {
        const { result, rerender } = renderHook(() => useAuthIntent(), {
            wrapper,
        });

        await act(async () => {
            authState.isLoading = false;
        });
        rerender();

        await waitFor(() => {
            expect(result.current.pendingIntent).toEqual({ type: 'none' });
        });
    });

    it('consumes pending intent once when authentication succeeds', async () => {
        const { result, rerender } = renderHook(() => useAuthIntent(), {
            wrapper,
        });

        await act(async () => {
            authState.isLoading = false;
        });
        rerender();

        act(() => {
            result.current.setAuthIntent({ type: 'open-online-tab' });
        });

        expect(result.current.pendingIntent).toEqual({
            type: 'open-online-tab',
        });

        act(() => {
            authState.isAuthenticated = true;
        });
        rerender();

        await waitFor(() => {
            expect(result.current.lastConsumedIntent).toEqual({
                type: 'open-online-tab',
            });
            expect(result.current.pendingIntent).toEqual({ type: 'none' });
        });

        expect(result.current.lastConsumedIntent).toEqual({
            type: 'open-online-tab',
        });
    });

    it('does not double-consume when auth success is signaled twice', async () => {
        const { result, rerender } = renderHook(() => useAuthIntent(), {
            wrapper,
        });

        await act(async () => {
            authState.isLoading = false;
        });
        rerender();

        act(() => {
            result.current.setAuthIntent({
                type: 'open-online-diagram',
                diagramId: '99',
            });
        });

        act(() => {
            authState.isAuthenticated = true;
        });
        rerender();

        await waitFor(() => {
            expect(result.current.lastConsumedIntent).toEqual({
                type: 'open-online-diagram',
                diagramId: '99',
            });
        });

        await act(async () => {
            authState.isAuthenticated = true;
        });

        expect(result.current.lastConsumedIntent).toEqual({
            type: 'open-online-diagram',
            diagramId: '99',
        });
        expect(result.current.pendingIntent).toEqual({ type: 'none' });
    });

    it('does not replay cleared intent on a later login', async () => {
        const { result, rerender } = renderHook(() => useAuthIntent(), {
            wrapper,
        });

        await act(async () => {
            authState.isLoading = false;
        });
        rerender();

        act(() => {
            result.current.setAuthIntent({ type: 'open-online-tab' });
            result.current.clearAuthIntent();
        });

        act(() => {
            authState.isAuthenticated = true;
        });
        rerender();

        await waitFor(() => {
            expect(result.current.lastConsumedIntent).toEqual({ type: 'none' });
        });

        act(() => {
            authState.isAuthenticated = false;
        });
        rerender();

        act(() => {
            result.current.setAuthIntent({
                type: 'protected-action',
                action: 'share',
            });
        });

        act(() => {
            authState.isAuthenticated = true;
        });
        rerender();

        await waitFor(() => {
            expect(result.current.lastConsumedIntent).toEqual({
                type: 'protected-action',
                action: 'share',
            });
        });
    });
});
