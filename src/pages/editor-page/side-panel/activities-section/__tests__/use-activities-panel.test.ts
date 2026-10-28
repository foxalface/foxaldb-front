import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { listDiagramActivitiesMock } = vi.hoisted(() => ({
    listDiagramActivitiesMock: vi.fn(),
}));

vi.mock('@/lib/api/diagram-activities', () => ({
    listDiagramActivities: listDiagramActivitiesMock,
}));

import { useActivitiesPanel } from '../use-activities-panel';

describe('useActivitiesPanel', () => {
    beforeEach(() => {
        listDiagramActivitiesMock.mockReset();
        listDiagramActivitiesMock.mockResolvedValue([]);
    });

    it('does not fetch when diagram id is undefined', () => {
        const { result } = renderHook(() => useActivitiesPanel(undefined));

        expect(result.current.status).toBe('idle');
        expect(listDiagramActivitiesMock).not.toHaveBeenCalled();
    });

    it('fetches activities with the provided online diagram id', async () => {
        renderHook(() => useActivitiesPanel('42'));

        await waitFor(() => {
            expect(listDiagramActivitiesMock).toHaveBeenCalledWith('42');
        });
    });
});
