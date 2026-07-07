import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EditingAction } from '@/lib/realtime/editing-reducer';
import type { PresenceState } from '@/lib/realtime/presence-reducer';
import type { DiagramPresenceUser } from '@/lib/realtime/diagram-presence';

interface AuthValue {
    user: { id: number } | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

let authValue: AuthValue;
let currentDiagram: { id: string } | null;
let presence: PresenceState;
let capturedListener: ((action: EditingAction) => void) | null;

const subscribeToEditingActions = vi.fn(
    (listener: (action: EditingAction) => void) => {
        capturedListener = listener;
        return () => {
            capturedListener = null;
        };
    }
);

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authValue,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => ({ presence, subscribeToEditingActions }),
}));

import React from 'react';
import {
    EMPTY_REMOTE_EDITORS,
    useEntityRemoteEditing,
    useRemoteEditing,
} from '../use-remote-editing';
import { RemoteEditingContext } from '@/context/remote-editing-context/remote-editing-context';
import {
    toEditingEntityKey,
    type RemoteEditingViewModel,
} from '@/lib/realtime/editing-utils';

const buildPresence = (
    members: [number, DiagramPresenceUser][]
): PresenceState => ({
    members: new Map(members),
    status: 'active',
    error: null,
});

const dispatch = (action: EditingAction): void => {
    act(() => {
        capturedListener?.(action);
    });
};

describe('useRemoteEditing', () => {
    beforeEach(() => {
        authValue = {
            user: { id: 1 },
            isAuthenticated: true,
            isLoading: false,
        };
        currentDiagram = { id: '42' };
        presence = buildPresence([
            [2, { id: 2, name: 'Bob' }],
            [3, { id: 3, name: 'Alice' }],
        ]);
        capturedListener = null;
        subscribeToEditingActions.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('derives a map keyed by entity across multiple users and entities', () => {
        const { result } = renderHook(() => useRemoteEditing());

        expect(result.current.isEditingActive).toBe(true);

        dispatch({
            type: 'UPDATE',
            userId: 2,
            edits: [
                { entityType: 'field', entityId: 'field-1' },
                { entityType: 'table', entityId: 'table-1' },
            ],
            receivedAt: Date.now(),
        });
        dispatch({
            type: 'UPDATE',
            userId: 3,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
            receivedAt: Date.now(),
        });

        const fieldEditors = result.current.editingByEntity.get(
            toEditingEntityKey('field', 'field-1')
        );
        const tableEditors = result.current.editingByEntity.get(
            toEditingEntityKey('table', 'table-1')
        );

        expect(fieldEditors?.map((editor) => editor.userId)).toEqual([3, 2]);
        expect(tableEditors?.map((editor) => editor.userId)).toEqual([2]);
    });

    it('filters self and unknown presence users', () => {
        const { result } = renderHook(() => useRemoteEditing());

        dispatch({
            type: 'UPDATE',
            userId: 1,
            edits: [{ entityType: 'field', entityId: 'field-self' }],
            receivedAt: Date.now(),
        });
        dispatch({
            type: 'UPDATE',
            userId: 99,
            edits: [{ entityType: 'field', entityId: 'field-unknown' }],
            receivedAt: Date.now(),
        });

        expect(result.current.editingByEntity.size).toBe(0);
    });

    it('sweeps stale editing entries after the stale window', () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);

        const { result } = renderHook(() => useRemoteEditing());

        dispatch({
            type: 'UPDATE',
            userId: 2,
            edits: [{ entityType: 'field', entityId: 'field-1' }],
            receivedAt: Date.now(),
        });

        expect(
            result.current.editingByEntity.get(
                toEditingEntityKey('field', 'field-1')
            )
        ).toHaveLength(1);

        act(() => {
            vi.advanceTimersByTime(3_600);
        });

        expect(result.current.editingByEntity.size).toBe(0);
    });

    it('returns a stable empty map when editing is inactive', () => {
        authValue = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
        };

        const { result, rerender } = renderHook(() => useRemoteEditing());

        expect(result.current.isEditingActive).toBe(false);
        const first = result.current.editingByEntity;
        expect(first.size).toBe(0);

        rerender();

        expect(result.current.editingByEntity).toBe(first);
    });
});

describe('useEntityRemoteEditing', () => {
    it('returns the shared stable empty array outside a provider', () => {
        const { result } = renderHook(() =>
            useEntityRemoteEditing('field', 'field-1')
        );

        expect(result.current).toBe(EMPTY_REMOTE_EDITORS);
    });

    it('reads editors for the requested entity from context', () => {
        const editor: RemoteEditingViewModel = {
            userId: 2,
            name: 'Bob',
            initials: 'BO',
            colorClass: 'bg-red-500',
            borderColorClass: 'border-red-500',
            strokeColorClass: '!stroke-red-500',
            ringColorClass: 'ring-red-500',
            isSelf: false,
        };
        const editingByEntity = new Map([
            [toEditingEntityKey('field', 'field-1'), [editor]],
        ]);

        const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
            <RemoteEditingContext.Provider
                value={{ isEditingActive: true, editingByEntity }}
            >
                {children}
            </RemoteEditingContext.Provider>
        );

        const { result } = renderHook(
            () => useEntityRemoteEditing('field', 'field-1'),
            { wrapper }
        );

        expect(result.current).toHaveLength(1);
        expect(result.current[0]?.userId).toBe(2);

        const { result: emptyResult } = renderHook(
            () => useEntityRemoteEditing('field', 'field-unknown'),
            { wrapper }
        );

        expect(emptyResult.current).toBe(EMPTY_REMOTE_EDITORS);
    });
});
