import { describe, expect, it } from 'vitest';
import { buildDiagramJsonExportFilename } from '../build-diagram-json-export-filename';

describe('buildDiagramJsonExportFilename', () => {
    it('uses diagram slug with .json extension', () => {
        expect(buildDiagramJsonExportFilename('My Diagram')).toBe(
            'my-diagram.json'
        );
    });

    it('lowercases mixed-case names', () => {
        expect(buildDiagramJsonExportFilename('FoxalDB Backend')).toBe(
            'foxaldb-backend.json'
        );
    });

    it('collapses punctuation into hyphens', () => {
        expect(buildDiagramJsonExportFilename('Orders (v2)!')).toBe(
            'orders-v2.json'
        );
    });

    it('falls back to diagram when the name is empty or unusable', () => {
        expect(buildDiagramJsonExportFilename('   ')).toBe('diagram.json');
        expect(buildDiagramJsonExportFilename('***')).toBe('diagram.json');
    });

    it('does not use ChartDB filename branding', () => {
        expect(buildDiagramJsonExportFilename('My Diagram')).not.toContain(
            'ChartDB'
        );
        expect(buildDiagramJsonExportFilename('My Diagram')).not.toContain('(');
    });
});
