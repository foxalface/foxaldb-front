import React, { type ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { useDiagramChannelLifecycle } from '@/pages/editor-page/use-diagram-channel-lifecycle';

const authState = {
    isAuthenticated: true,
    isLoading: false,
};

const chartDbState = {
    currentDiagram: { id: '42' } as { id: string } | null,
};

const joinDiagram = vi.fn();
const leaveDiagram = vi.fn();
const realtimeState: { connectionStatus: 'connected' | 'reconnecting' } = {
    connectionStatus: 'connected',
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagram,
    }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => ({
        joinDiagram,
        leaveDiagram,
        connectionStatus: realtimeState.connectionStatus,
    }),
}));

const renderLifecycle = (location: DiagramLocation) =>
    renderHook(() => useDiagramChannelLifecycle(), {
        wrapper: ({ children }: { children: ReactNode }) => (
            <DiagramLocationProvider initialLocation={location}>
                {children}
            </DiagramLocationProvider>
        ),
    });

describe('useDiagramChannelLifecycle location gate', () => {
    beforeEach(() => {
        authState.isAuthenticated = true;
        authState.isLoading = false;
        chartDbState.currentDiagram = { id: '42' };
        joinDiagram.mockReset();
        leaveDiagram.mockReset();
        realtimeState.connectionStatus = 'connected';
    });

    it('joins the diagram channel for an authenticated online diagram', () => {
        renderLifecycle(onlineDiagramLocation('42'));

        expect(joinDiagram).toHaveBeenCalledWith('42');
    });

    it('does not join a diagram channel for an authenticated device diagram', () => {
        chartDbState.currentDiagram = { id: '42' };
        renderLifecycle(deviceDiagramLocation('42'));

        expect(joinDiagram).not.toHaveBeenCalled();
    });

    it('leaves the diagram channel when authentication ends', () => {
        const { rerender } = renderLifecycle(onlineDiagramLocation('42'));

        expect(joinDiagram).toHaveBeenCalledWith('42');

        authState.isAuthenticated = false;
        rerender();

        expect(leaveDiagram).toHaveBeenCalled();
    });

    it('does not join or leave a diagram channel when a device session ends', () => {
        chartDbState.currentDiagram = { id: 'local-1' };
        const { rerender } = renderLifecycle(deviceDiagramLocation('local-1'));

        authState.isAuthenticated = false;
        rerender();

        expect(joinDiagram).not.toHaveBeenCalled();
        expect(leaveDiagram).not.toHaveBeenCalled();
    });

    it('keeps the diagram id across a transport reconnect', () => {
        const { rerender } = renderLifecycle(onlineDiagramLocation('42'));

        expect(joinDiagram).toHaveBeenCalledTimes(1);
        expect(leaveDiagram).not.toHaveBeenCalled();

        realtimeState.connectionStatus = 'reconnecting';
        rerender();

        expect(leaveDiagram).not.toHaveBeenCalled();
        expect(joinDiagram).toHaveBeenCalledTimes(2);

        realtimeState.connectionStatus = 'connected';
        rerender();

        expect(leaveDiagram).not.toHaveBeenCalled();
        expect(joinDiagram).toHaveBeenCalledTimes(3);
    });
});
