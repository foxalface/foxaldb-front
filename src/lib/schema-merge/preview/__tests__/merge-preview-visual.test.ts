import { describe, expect, it } from 'vitest';
import {
    getMergePreviewCardinalityMarkerClasses,
    getMergePreviewEdgeClasses,
    getMergePreviewFieldClasses,
    getMergePreviewRelationshipOverlayClasses,
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

    it('keeps delete edges the canvas stroke weight, dashed and red', () => {
        const deleteStyle = getMergePreviewEdgeClasses('delete', false);
        expect(deleteStyle.dashed).toBe(true);
        expect(deleteStyle.opacity).toBe(1);
        expect(deleteStyle.stroke).toContain('!stroke-2');
        expect(deleteStyle.stroke).toContain('red');
    });

    it('maps cardinality marker classes per change', () => {
        expect(getMergePreviewCardinalityMarkerClasses('add').circle).toContain(
            'emerald'
        );
        expect(
            getMergePreviewCardinalityMarkerClasses('modify').circle
        ).toContain('sky');
        expect(
            getMergePreviewCardinalityMarkerClasses('delete').circle
        ).toContain('red');
    });

    it('keeps semantic overlay colors when foreground is requested', () => {
        const foreground = getMergePreviewRelationshipOverlayClasses(
            'add',
            true
        );
        expect(foreground.edgeStroke).toContain('emerald');
        expect(foreground.indicatorClassName).toContain('emerald');
        expect(foreground.cardinalityForeground).not.toContain('pink');
    });
});
