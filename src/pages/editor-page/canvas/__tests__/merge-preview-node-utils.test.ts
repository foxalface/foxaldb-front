import { describe, expect, it } from 'vitest';
import {
    buildFieldMergeChangeById,
    resolveTableMergeChange,
} from '../merge-preview-node-utils';

describe('merge-preview-node-utils', () => {
    it('resolves table-level change only from table decoration rows', () => {
        expect(
            resolveTableMergeChange([
                { entityKind: 'table', entityId: 't1', change: 'delete' },
                { entityKind: 'field', entityId: 'f1', change: 'modify' },
            ])
        ).toBe('delete');
    });

    it('builds field change map', () => {
        const map = buildFieldMergeChangeById([
            { entityKind: 'field', entityId: 'f1', change: 'rename' },
            { entityKind: 'field', entityId: 'f2', change: 'add' },
        ]);
        expect(map.get('f1')).toBe('rename');
        expect(map.get('f2')).toBe('add');
    });
});
