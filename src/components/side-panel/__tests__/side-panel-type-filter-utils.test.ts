import { describe, expect, it } from 'vitest';
import {
    getTypeFilterCheckboxState,
    getTypeFilterSelectionAfterHeaderToggle,
} from '../side-panel-type-filter-utils';

describe('side-panel-type-filter-utils', () => {
    const allTypes = ['a', 'b', 'c'] as const;

    it('returns unchecked when nothing is selected', () => {
        expect(getTypeFilterCheckboxState(0, 3)).toBe(false);
    });

    it('returns checked when everything is selected', () => {
        expect(getTypeFilterCheckboxState(3, 3)).toBe(true);
    });

    it('returns indeterminate for partial selection', () => {
        expect(getTypeFilterCheckboxState(1, 3)).toBe('indeterminate');
        expect(getTypeFilterCheckboxState(2, 3)).toBe('indeterminate');
    });

    it('selects all when header is toggled from partial or empty selection', () => {
        expect(
            getTypeFilterSelectionAfterHeaderToggle(['a'], allTypes)
        ).toEqual(['a', 'b', 'c']);
        expect(getTypeFilterSelectionAfterHeaderToggle([], allTypes)).toEqual([
            'a',
            'b',
            'c',
        ]);
    });

    it('deselects all when header is toggled from full selection', () => {
        expect(
            getTypeFilterSelectionAfterHeaderToggle(['a', 'b', 'c'], allTypes)
        ).toEqual([]);
    });
});
