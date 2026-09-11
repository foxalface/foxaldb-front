import { describe, expect, it } from 'vitest';
import {
    getCompleteDiagramCaptureLayout,
    getViewportCaptureLayout,
    isVisualExportDiagramNode,
} from '../visual-export-capture-layout';

describe('visual export capture layout', () => {
    it('excludes hidden and transient nodes from complete-diagram bounds', () => {
        expect(isVisualExportDiagramNode({ type: 'table' })).toBe(true);
        expect(isVisualExportDiagramNode({ type: 'note', hidden: false })).toBe(
            true
        );
        expect(isVisualExportDiagramNode({ type: 'table', hidden: true })).toBe(
            false
        );
        expect(isVisualExportDiagramNode({ type: 'temp-cursor' })).toBe(false);
        expect(isVisualExportDiagramNode({ type: 'create-relationship' })).toBe(
            false
        );
    });

    it('builds a padded 1:1 transform for complete-diagram capture', () => {
        expect(
            getCompleteDiagramCaptureLayout(
                { x: 100, y: 50, width: 400, height: 200 },
                32
            )
        ).toEqual({
            width: 464,
            height: 264,
            transform: 'translate(-68px, -18px) scale(1)',
        });
    });

    it('uses the current viewport transform for viewport capture', () => {
        expect(
            getViewportCaptureLayout(
                { x: 40, y: -12, zoom: 1.5 },
                { width: 800, height: 600 }
            )
        ).toEqual({
            width: 800,
            height: 600,
            transform: 'translate(40px, -12px) scale(1.5)',
        });
    });
});
