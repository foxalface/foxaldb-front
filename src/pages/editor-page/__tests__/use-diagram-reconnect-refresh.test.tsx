import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    readOnlineDiagramId,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { useDiagramReconnectRefresh } from '@/pages/editor-page/use-diagram-reconnect-refresh';
import { remoteSyncDepthRef } from '@/lib/realtime/diagram-sync-state';

const authState = {
    isAuthenticated: true,
    isLoading: false,
};

const chartDbState = {
    currentDiagram: {
        id: '77',
        name: 'SQL Import',
    } as { id: string; name: string } | null,
};

const locationState: { location: DiagramLocation | null } = {
    location: onlineDiagramLocation('77'),
};

const replaceDiagram = vi.fn();
const loadDiagramFromData = vi.fn();
const setDiagramAccess = vi.fn();
const getDiagram = vi.fn();
let reconnectListener: (() => void) | null = null;

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
        replaceDiagram,
        loadDiagramFromData,
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useOnlineDiagramId: () =>
        readOnlineDiagramId(
            locationState.location,
            chartDbState.currentDiagram?.id
        ),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({
        setDiagramAccess,
        clearDiagramAccess: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openOpenDiagramDialog: vi.fn(),
    }),
}));

vi.mock('@/context/alert-context/alert-context', () => ({
    useAlert: () => ({
        showAlert: vi.fn(),
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => ({
        onReconnect: (listener: () => void) => {
            reconnectListener = listener;
            return () => {
                if (reconnectListener === listener) {
                    reconnectListener = null;
                }
            };
        },
    }),
}));

vi.mock('@/lib/api/diagrams', () => ({
    getDiagram: (...args: unknown[]) => getDiagram(...args),
}));

vi.mock('@/lib/api/normalize-diagram-from-api', () => ({
    normalizeDiagramFromApi: (raw: { name: string }, id: string) => ({
        id,
        name: raw.name,
        tables: [{ name: raw.name }],
    }),
}));

vi.mock('@/lib/api/diagram-content-hash', () => ({
    readDiagramContentHashFromApi: () => 'hash-after-rename',
}));

describe('useDiagramReconnectRefresh', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        reconnectListener = null;
        replaceDiagram.mockReset();
        replaceDiagram.mockResolvedValue(undefined);
        getDiagram.mockReset();
        getDiagram.mockResolvedValue({
            name: 'b3_table_from_b',
            content_hash: 'hash-after-rename',
            access: { can_edit: true },
        });
        chartDbState.currentDiagram = { id: '77', name: 'SQL Import' };
        locationState.location = onlineDiagramLocation('77');
        authState.isAuthenticated = true;
        authState.isLoading = false;
        remoteSyncDepthRef.current = 0;
    });

    afterEach(() => {
        vi.useRealTimers();
        remoteSyncDepthRef.current = 0;
    });

    it('does not refetch on mount before a reconnect', () => {
        renderHook(() => useDiagramReconnectRefresh());

        expect(reconnectListener).not.toBeNull();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(replaceDiagram).not.toHaveBeenCalled();
    });

    it('refetches authoritative diagram on reconnect without an autosave mutation', async () => {
        renderHook(() => useDiagramReconnectRefresh());

        await act(async () => {
            reconnectListener?.();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(getDiagram).toHaveBeenCalledTimes(1);
        expect(getDiagram).toHaveBeenCalledWith('77');
        expect(replaceDiagram).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '77',
                name: 'b3_table_from_b',
            }),
            expect.objectContaining({
                authoritative: true,
                updateHistory: false,
                resetHistory: true,
                authoritativeContentHash: 'hash-after-rename',
            })
        );
        expect(remoteSyncDepthRef.current).toBe(0);
    });

    it('retries once when a remote sync is in flight during reconnect', async () => {
        remoteSyncDepthRef.current = 1;
        renderHook(() => useDiagramReconnectRefresh());

        act(() => {
            reconnectListener?.();
        });

        expect(getDiagram).not.toHaveBeenCalled();

        remoteSyncDepthRef.current = 0;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300);
        });

        expect(getDiagram).toHaveBeenCalledTimes(1);
        expect(replaceDiagram).toHaveBeenCalledTimes(1);
    });

    it('skips refresh for a device location even when the id is numeric', async () => {
        chartDbState.currentDiagram = { id: '77', name: 'Shadow' };
        locationState.location = deviceDiagramLocation('77');

        renderHook(() => useDiagramReconnectRefresh());

        await act(async () => {
            reconnectListener?.();
            await Promise.resolve();
        });

        expect(reconnectListener).toBeNull();
        expect(getDiagram).not.toHaveBeenCalled();
        expect(replaceDiagram).not.toHaveBeenCalled();
    });
});
