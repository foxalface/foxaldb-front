import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramLocation } from '@/lib/diagram/diagram-location';
import { readOnlineDiagramId } from '@/lib/diagram/diagram-location';

const { authState, locationState, chartDbState } = vi.hoisted(() => ({
    authState: { isAuthenticated: false },
    locationState: { location: null as DiagramLocation | null },
    chartDbState: { currentDiagramId: undefined as string | undefined },
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
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

import { useActivitiesAvailability } from '@/hooks/use-activities-availability';

describe('useActivitiesAvailability', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        chartDbState.currentDiagramId = undefined;
        locationState.location = null;
    });

    it('returns false for guests', () => {
        const { result } = renderHook(() => useActivitiesAvailability());
        expect(result.current).toBe(false);
    });

    it('returns false for authenticated device diagrams', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = 'local-1';
        locationState.location = { type: 'device', localId: 'local-1' };

        expect(
            renderHook(() => useActivitiesAvailability()).result.current
        ).toBe(false);
    });

    it('returns false for numeric-looking device diagrams', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = '123';
        locationState.location = { type: 'device', localId: '123' };

        expect(
            renderHook(() => useActivitiesAvailability()).result.current
        ).toBe(false);
    });

    it('returns true for authenticated online diagrams', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = '42';
        locationState.location = { type: 'online', diagramId: '42' };

        expect(
            renderHook(() => useActivitiesAvailability()).result.current
        ).toBe(true);
    });

    it('returns false when online location does not match the open diagram', () => {
        authState.isAuthenticated = true;
        chartDbState.currentDiagramId = '456';
        locationState.location = { type: 'online', diagramId: '123' };

        expect(
            renderHook(() => useActivitiesAvailability()).result.current
        ).toBe(false);
    });
});
