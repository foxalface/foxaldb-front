import { describe, expect, it } from 'vitest';
import { buildVisualExportFilename } from '../build-visual-export-filename';

describe('buildVisualExportFilename', () => {
    it('uses diagram slug with png extension', () => {
        expect(buildVisualExportFilename('My Diagram', 'png')).toBe(
            'my-diagram.png'
        );
    });

    it('uses .jpg rather than .jpeg', () => {
        expect(buildVisualExportFilename('Orders', 'jpg')).toBe('orders.jpg');
    });

    it('uses svg extension', () => {
        expect(buildVisualExportFilename('Schema', 'svg')).toBe('schema.svg');
    });

    it('collapses whitespace and punctuation', () => {
        expect(buildVisualExportFilename('  Orders (v2)!  ', 'png')).toBe(
            'orders-v2.png'
        );
    });

    it('falls back to diagram when the name is empty or unusable', () => {
        expect(buildVisualExportFilename('   ', 'png')).toBe('diagram.png');
        expect(buildVisualExportFilename('***', 'jpg')).toBe('diagram.jpg');
        expect(buildVisualExportFilename('', 'svg')).toBe('diagram.svg');
    });

    it('does not use ChartDB filename branding', () => {
        expect(buildVisualExportFilename('My Diagram', 'png')).not.toContain(
            'ChartDB'
        );
        expect(buildVisualExportFilename('My Diagram', 'jpg')).not.toContain(
            'jpeg'
        );
    });
});
