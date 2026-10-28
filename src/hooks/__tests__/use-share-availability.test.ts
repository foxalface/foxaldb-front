import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramLocation } from '@/lib/diagram/diagram-location';
import { readOnlineDiagramId } from '@/lib/diagram/diagram-location';

const { authState, diagramAccessState, locationState, chartDbState } =
    vi.hoisted(() => ({
        authState: { isAuthenticated: false },
        diagramAccessState: {
            diagramAccess: null as { can_manage_members: boolean } | null,
        },
        locationState: { location: null as DiagramLocation | null },
        chartDbState: { currentDiagramId: undefined as string | undefined },
    }));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => diagramAccessState,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram: chartDbState.currentDiagramId
            ? { id: chartDbState.currentDiagramId }
            : null,
    }),
}));

vi.mock('@/hooks/use-diagram-location', () => ({
    useDiagramLocation: () => ({
        location: locationState.location,
        setDiagramLocation: vi.fn(),
    }),
    useOnlineDiagramId: () =>
        readOnlineDiagramId(
            locationState.location,
            chartDbState.currentDiagramId
        ),
}));

import { useShareAvailability } from '@/hooks/use-share-availability';

describe('useShareAvailability', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        chartDbState.currentDiagramId = undefined;
        diagramAccessState.diagramAccess = null;
        locationState.location = null;
    });

    it('returns false for guest users', () => {
        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(false);
    });

    it('returns false for local diagram ids', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = 'local-diagram';
        locationState.location = { type: 'device', localId: 'local-diagram' };
        diagramAccessState.diagramAccess = { can_manage_members: true };

        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(false);
    });

    it('returns false when user cannot manage members', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = '42';
        locationState.location = { type: 'online', diagramId: '42' };
        diagramAccessState.diagramAccess = { can_manage_members: false };

        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(false);
    });

    it('returns false when a numeric id is still a device diagram', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = '42';
        locationState.location = { type: 'device', localId: '42' };
        diagramAccessState.diagramAccess = { can_manage_members: true };

        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(false);
    });

    it('returns false when online location does not match the open diagram', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = '456';
        locationState.location = { type: 'online', diagramId: '123' };
        diagramAccessState.diagramAccess = { can_manage_members: true };

        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(false);
    });

    it('returns true for authenticated managers on backend diagrams', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = '42';
        locationState.location = { type: 'online', diagramId: '42' };
        diagramAccessState.diagramAccess = { can_manage_members: true };

        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(true);
    });
});
