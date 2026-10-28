import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
} from '@/lib/diagram/diagram-location';
import { ConversationsProvider } from '../conversations-provider';
import { useDiagramConversations } from '@/hooks/use-diagram-conversations';
import {
    createConversationsProviderTestEnv,
    resetConversationsProviderTestEnv,
} from './conversations-provider-test-utils';

const { listDiagramConversations } = vi.hoisted(() => ({
    listDiagramConversations: vi.fn(),
}));

const env = createConversationsProviderTestEnv();
const locationState = {
    location: onlineDiagramLocation('42') as
        | ReturnType<typeof onlineDiagramLocation>
        | ReturnType<typeof deviceDiagramLocation>,
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => env.authValue,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ currentDiagram: env.currentDiagram }),
}));

vi.mock('@/hooks/use-realtime', () => ({
    useRealtime: () => env.realtimeValue,
}));

vi.mock('@/lib/api/diagram-conversations', () => ({
    listDiagramConversations,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DiagramLocationProvider initialLocation={locationState.location}>
        <ConversationsProvider>{children}</ConversationsProvider>
    </DiagramLocationProvider>
);

describe('ConversationsProvider DiagramLocation gates', () => {
    beforeEach(() => {
        resetConversationsProviderTestEnv(env);
        listDiagramConversations.mockReset();
        listDiagramConversations.mockResolvedValue({
            data: [],
            nextCursor: null,
            totalUnreadCount: 0,
        });
        locationState.location = onlineDiagramLocation('42');
    });

    it('stays inactive for authenticated device diagrams', () => {
        locationState.location = deviceDiagramLocation('123');
        env.currentDiagram = { id: '123' };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: Wrapper,
        });

        expect(result.current.isActive).toBe(false);
        expect(listDiagramConversations).not.toHaveBeenCalled();
    });

    it('stays inactive for numeric-looking device diagrams', () => {
        locationState.location = deviceDiagramLocation('42');
        env.currentDiagram = { id: '42' };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: Wrapper,
        });

        expect(result.current.isActive).toBe(false);
        expect(listDiagramConversations).not.toHaveBeenCalled();
    });

    it('loads summaries when location and editor id match online', async () => {
        locationState.location = onlineDiagramLocation('42');
        env.currentDiagram = { id: '42' };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: Wrapper,
        });

        await waitFor(() => {
            expect(listDiagramConversations).toHaveBeenCalledWith('42', {
                status: 'active',
                cursor: undefined,
            });
        });

        expect(result.current.isActive).toBe(true);
    });

    it('stays inactive when online location does not match the editor diagram', () => {
        locationState.location = onlineDiagramLocation('123');
        env.currentDiagram = { id: '456' };

        const { result } = renderHook(() => useDiagramConversations(), {
            wrapper: Wrapper,
        });

        expect(result.current.isActive).toBe(false);
        expect(listDiagramConversations).not.toHaveBeenCalled();
    });
});
