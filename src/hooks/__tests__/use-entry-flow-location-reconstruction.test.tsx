import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { useDiagramLocation } from '@/hooks/use-diagram-location';
import { useEntryFlowGuestResolution } from '@/hooks/use-entry-flow-guest-resolution';
import type { EntryFlowState } from '@/lib/entry-flow';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';

const loadDiagram = vi.fn();
const dispatchEvent = vi.fn();
const clearDiagramAccess = vi.fn();

let currentDiagram: Diagram | null = null;

vi.mock('@/hooks/use-config', () => ({
    useConfig: () => ({ config: { defaultDiagramId: null } }),
}));

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({ listDiagrams: vi.fn() }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        currentDiagram,
        loadDiagram,
    }),
}));

vi.mock('@/hooks/use-diagram-access', () => ({
    useDiagramAccess: () => ({ clearDiagramAccess }),
}));

const LocationReader: React.FC = () => {
    const { location } = useDiagramLocation();

    if (location === null) {
        return <span data-testid="location">none</span>;
    }

    return (
        <span data-testid="location">
            {location.type}:
            {location.type === 'device' ? location.localId : location.diagramId}
        </span>
    );
};

describe('entry flow location reconstruction (hard reload)', () => {
    beforeEach(() => {
        currentDiagram = null;
        loadDiagram.mockReset();
        dispatchEvent.mockReset();
        clearDiagramAccess.mockReset();
    });

    it('starts at null and becomes device after guest Dexie resolution', async () => {
        loadDiagram.mockResolvedValue({
            id: 'workspace-local-1',
            name: 'Local',
            databaseType: DatabaseType.GENERIC,
            tables: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Diagram);

        const GuestRunner: React.FC = () => {
            useEntryFlowGuestResolution({
                state: {
                    kind: 'openingDiagram',
                    diagramId: 'workspace-local-1',
                    diagramSource: 'local',
                    entrySource: 'guestContinuation',
                } as EntryFlowState,
                isAuthenticated: false,
                isAuthLoading: false,
                beginResolution: () => 1,
                isResolutionCurrent: () => true,
                dispatchEvent,
            });

            return <LocationReader />;
        };

        render(
            <DiagramLocationProvider>
                <GuestRunner />
            </DiagramLocationProvider>
        );

        expect(screen.getByTestId('location')).toHaveTextContent('none');

        await waitFor(() => {
            expect(screen.getByTestId('location')).toHaveTextContent(
                'device:workspace-local-1'
            );
        });

        expect(loadDiagram).toHaveBeenCalledWith('workspace-local-1');
    });
});
