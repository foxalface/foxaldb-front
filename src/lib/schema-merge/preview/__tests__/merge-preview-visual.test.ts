import { describe, expect, it } from 'vitest';
import {
    getMergePreviewEdgeClasses,
    getMergePreviewFieldClasses,
    getMergePreviewTableClasses,
} from '../merge-preview-visual';

describe('merge-preview-visual', () => {
    it('returns empty table classes when change is undefined', () => {
        expect(getMergePreviewTableClasses(undefined)).toEqual({
            ring: '',
            border: '',
            container: '',
            name: '',
        });
    });

    it('maps add/modify/rename/delete table semantics', () => {
        expect(getMergePreviewTableClasses('add').border).toContain('emerald');
        expect(getMergePreviewTableClasses('modify').border).toContain('sky');
        expect(getMergePreviewTableClasses('rename').border).toContain('amber');
        expect(getMergePreviewTableClasses('delete').container).toContain(
            'opacity'
        );
    });

    it('maps field row classes per change', () => {
        expect(getMergePreviewFieldClasses('add').row).toContain(
            'border-emerald'
        );
        expect(getMergePreviewFieldClasses('delete').name).toContain(
            'line-through'
        );
    });

    it('marks delete edges dashed with reduced opacity', () => {
        const deleteStyle = getMergePreviewEdgeClasses('delete', false);
        expect(deleteStyle.dashed).toBe(true);
        expect(deleteStyle.opacity).toBeLessThan(1);
        expect(deleteStyle.stroke).toContain('red');
    });
});
