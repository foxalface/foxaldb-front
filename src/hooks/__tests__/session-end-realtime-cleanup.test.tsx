import React, { type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { onlineDiagramLocation } from '@/lib/diagram/diagram-location';
import { useRemoteEditing } from '@/hooks/use-remote-editing';
import { useRemoteCursors } from '@/hooks/use-remote-cursors';
import type { EditingAction } from '@/lib/realtime/editing-reducer';
import type { CursorAction } from '@/lib/realtime/cursor-reducer';

const authState = {
    user: {
        id: 1,
        first_name: 'Ada',
        last_name: 'Lovelace',
        full_name: 'Ada Lovelace',
        email: 'ada@example.com',
    },
    isAuthenticated: true,
    isLoading: false,
};

const editingListeners = new Set<(action: EditingAction) => void>();
const cursorListeners = new Set<(action: CursorAction) => void>();
const unsubscribeEditing = vi.fn();
const unsubscribeCursors = vi.fn();
const subscribeToEditingActions = (
    listener: (action: EditingAction) => void
): (() => void) => {
    editingListeners.add(listener);
    return () => {
        editingListeners.delete(listener);
        unsubscribeEditing();
    };
};
const subscribeToCursorActions = (
    listener: (action: CursorAction) => void
): (() => void) => {
    cursorListeners.add(listener);
    return () => {
        cursorListeners.delete(listener);
        unsubscribeCursors();
    };
};

const presenceMembers = new Map([
    [
        2,
        {
            id: 2,
            firstName: 'Grace',
            lastName: 'Hopper',
            fullName: 'Grace Hopper',
            email: 'grace@example.com',
        },
    ],
]);

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: { id: '42' },
    }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => ({
        presence: {
            status: 'active',
            members: presenceMembers,
            error: null,
        },
        subscribeToEditingActions,
        subscribeToCursorActions,
    }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
    <DiagramLocationProvider initialLocation={onlineDiagramLocation('42')}>
        {children}
    </DiagramLocationProvider>
);

describe('session end realtime overlays', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        authState.isLoading = false;
        editingListeners.clear();
        cursorListeners.clear();
        unsubscribeEditing.mockReset();
        unsubscribeCursors.mockReset();
        vi.stubGlobal(
            'matchMedia',
            vi.fn().mockImplementation(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            }))
        );
    });

    it('clears remote editing and drops the subscription when auth ends', () => {
        const { result, rerender } = renderHook(() => useRemoteEditing(), {
            wrapper,
        });

        expect(result.current.isEditingActive).toBe(true);

        act(() => {
            for (const listener of editingListeners) {
                listener({
                    type: 'UPDATE',
                    userId: 2,
                    edits: [{ entityType: 'table', entityId: 'table-1' }],
                    receivedAt: Date.now(),
                });
            }
        });

        expect(result.current.editingByEntity.size).toBeGreaterThan(0);

        authState.isAuthenticated = false;
        rerender();

        expect(result.current.isEditingActive).toBe(false);
        expect(result.current.editingByEntity.size).toBe(0);
        expect(unsubscribeEditing).toHaveBeenCalled();
    });

    it('clears remote cursors and drops the subscription when auth ends', () => {
        const { result, rerender } = renderHook(() => useRemoteCursors(), {
            wrapper,
        });

        expect(result.current.isOverlayActive).toBe(true);

        act(() => {
            for (const listener of cursorListeners) {
                listener({
                    type: 'UPDATE',
                    cursor: {
                        userId: 2,
                        x: 10,
                        y: 20,
                        receivedAt: Date.now(),
                        stale: false,
                    },
                });
            }
        });

        expect(result.current.remoteCursors.length).toBeGreaterThan(0);

        authState.isAuthenticated = false;
        rerender();

        expect(result.current.isOverlayActive).toBe(false);
        expect(result.current.remoteCursors).toEqual([]);
        expect(unsubscribeCursors).toHaveBeenCalled();
    });
});
