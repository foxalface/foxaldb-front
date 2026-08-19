import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { authState, diagramAccessState, routeState } = vi.hoisted(() => ({
    authState: { isAuthenticated: false },
    diagramAccessState: {
        diagramAccess: null as { can_manage_members: boolean } | null,
    },
    routeState: { diagramId: undefined as string | undefined },
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => diagramAccessState,
}));

vi.mock('react-router-dom', () => ({
    useParams: () => ({ diagramId: routeState.diagramId }),
}));

vi.mock('@/lib/realtime/diagram-id', () => ({
    isValidBackendDiagramId: (id: string) => /^\d+$/.test(id),
}));

import { useShareAvailability } from '@/hooks/use-share-availability';

describe('useShareAvailability', () => {
    beforeEach(() => {
        authState.isAuthenticated = false;
        routeState.diagramId = undefined;
        diagramAccessState.diagramAccess = null;
    });

    it('returns false for guest users', () => {
        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(false);
    });

    it('returns false for local diagram ids', () => {
        authState.isAuthenticated = true;
        routeState.diagramId = 'local-diagram';
        diagramAccessState.diagramAccess = { can_manage_members: true };

        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(false);
    });

    it('returns false when user cannot manage members', () => {
        authState.isAuthenticated = true;
        routeState.diagramId = '42';
        diagramAccessState.diagramAccess = { can_manage_members: false };

        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(false);
    });

    it('returns true for authenticated managers on backend diagrams', () => {
        authState.isAuthenticated = true;
        routeState.diagramId = '42';
        diagramAccessState.diagramAccess = { can_manage_members: true };

        const { result } = renderHook(() => useShareAvailability());
        expect(result.current).toBe(true);
    });
});
