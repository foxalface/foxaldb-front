import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagramFilterProvider } from '../diagram-filter-provider';
import { useDiagramFilter } from '../use-diagram-filter';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import {
    deviceDiagramLocation,
    onlineDiagramLocation,
    type DiagramLocation,
} from '@/lib/diagram/diagram-location';
import { DatabaseType } from '@/lib/domain/database-type';

const getDiagramFilter = vi.fn();
const updateDiagramFilter = vi.fn();

const chartState = {
    diagramId: '42',
};

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({
        getDiagramFilter,
        updateDiagramFilter,
    }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: chartState.diagramId,
        tables: [],
        schemas: [],
        databaseType: DatabaseType.GENERIC,
        events: {
            useSubscription: vi.fn(),
        },
    }),
}));

const Probe: React.FC = () => {
    const { filter, loading, setTableIdsFilterEmpty } = useDiagramFilter();

    return (
        <button type="button" onClick={setTableIdsFilterEmpty}>
            {loading ? 'loading' : JSON.stringify(filter?.tableIds ?? null)}
        </button>
    );
};

const renderFilter = (location: DiagramLocation) =>
    render(
        <DiagramLocationProvider initialLocation={location}>
            <DiagramFilterProvider>
                <Probe />
            </DiagramFilterProvider>
        </DiagramLocationProvider>
    );

describe('DiagramFilterProvider location persistence', () => {
    beforeEach(() => {
        getDiagramFilter.mockReset();
        updateDiagramFilter.mockReset();
        getDiagramFilter.mockResolvedValue(undefined);
        chartState.diagramId = '42';
    });

    it('persists filter changes to Dexie for a device diagram, including a numeric id', async () => {
        renderFilter(deviceDiagramLocation('42'));

        await waitFor(() => {
            expect(screen.getByRole('button')).toHaveTextContent('null');
        });
        expect(getDiagramFilter).toHaveBeenCalledWith('42');

        await userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByRole('button')).toHaveTextContent('[]');
        });
        expect(updateDiagramFilter).toHaveBeenCalledWith(
            '42',
            expect.objectContaining({ tableIds: [] })
        );
    });

    it('keeps an online diagram filter in memory and does not write Dexie', async () => {
        renderFilter(onlineDiagramLocation('42'));

        await waitFor(() => {
            expect(screen.getByRole('button')).toHaveTextContent('null');
        });
        expect(getDiagramFilter).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(screen.getByRole('button')).toHaveTextContent('[]');
        });
        expect(updateDiagramFilter).not.toHaveBeenCalled();
    });
});
