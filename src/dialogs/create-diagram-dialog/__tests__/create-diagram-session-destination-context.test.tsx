import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    CreateDiagramSessionDestinationProvider,
    useCreateDiagramRestoreDestination,
    useCreateDiagramSessionDestinationRequired,
} from '../create-diagram-session-destination-context';

let isAuthenticated = false;

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({ isAuthenticated }),
}));

describe('CreateDiagramSessionDestinationProvider', () => {
    beforeEach(() => {
        isAuthenticated = false;
    });

    it('latches guest device when the create dialog opens', async () => {
        const { result, rerender } = renderHook(
            () => useCreateDiagramRestoreDestination(true),
            {
                wrapper: ({ children }) => (
                    <CreateDiagramSessionDestinationProvider createDialogOpen>
                        {children}
                    </CreateDiagramSessionDestinationProvider>
                ),
            }
        );

        await waitFor(() => {
            expect(result.current).toBe('device');
        });

        isAuthenticated = true;
        rerender();

        expect(result.current).toBe('device');
    });

    it('uses standalone online default when create session is inactive', async () => {
        isAuthenticated = true;
        const { result } = renderHook(
            () => useCreateDiagramRestoreDestination(true),
            {
                wrapper: ({ children }) => (
                    <CreateDiagramSessionDestinationProvider
                        createDialogOpen={false}
                    >
                        {children}
                    </CreateDiagramSessionDestinationProvider>
                ),
            }
        );

        await waitFor(() => {
            expect(result.current).toBe('online');
        });
    });

    it('keeps a standalone guest restore on Device', async () => {
        const { result } = renderHook(
            () => useCreateDiagramRestoreDestination(true),
            {
                wrapper: ({ children }) => (
                    <CreateDiagramSessionDestinationProvider
                        createDialogOpen={false}
                    >
                        {children}
                    </CreateDiagramSessionDestinationProvider>
                ),
            }
        );

        await waitFor(() => {
            expect(result.current).toBe('device');
        });
    });

    it('moves a guest create session to Online only through setDestination', async () => {
        const { result } = renderHook(
            () => useCreateDiagramSessionDestinationRequired(),
            {
                wrapper: ({ children }) => (
                    <CreateDiagramSessionDestinationProvider createDialogOpen>
                        {children}
                    </CreateDiagramSessionDestinationProvider>
                ),
            }
        );

        await waitFor(() => {
            expect(result.current.destination).toBe('device');
        });

        isAuthenticated = true;
        act(() => {
            result.current.setDestination('online');
        });

        expect(result.current.destination).toBe('online');
    });
});
