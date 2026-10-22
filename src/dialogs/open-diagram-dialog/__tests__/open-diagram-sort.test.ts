import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { OpenDiagramDeviceRow } from '../open-diagram-list-types';
import { DEFAULT_OPEN_DIAGRAM_SORT } from '../open-diagram-list-types';
import {
    sortOpenDiagramRows,
    toggleOpenDiagramSort,
} from '../open-diagram-sort';

const row = (
    id: string,
    updatedAt: string,
    name: string
): OpenDiagramDeviceRow => ({
    storage: 'device',
    id,
    name,
    databaseType: DatabaseType.GENERIC,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(updatedAt),
    tablesCount: 1,
});

describe('open-diagram-sort', () => {
    it('defaults to modified descending', () => {
        const sorted = sortOpenDiagramRows(
            [row('a', '2024-01-01', 'A'), row('b', '2024-02-01', 'B')],
            DEFAULT_OPEN_DIAGRAM_SORT
        );

        expect(sorted.map((item) => item.id)).toEqual(['b', 'a']);
    });

    it('toggles sort direction when clicking the same column', () => {
        const next = toggleOpenDiagramSort(
            DEFAULT_OPEN_DIAGRAM_SORT,
            'updatedAt'
        );

        expect(next).toEqual({ column: 'updatedAt', direction: 'asc' });
    });
});
