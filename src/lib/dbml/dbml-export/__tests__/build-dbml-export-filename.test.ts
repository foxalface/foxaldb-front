import { describe, expect, it } from 'vitest';
import { buildDbmlExportFilename } from '../build-dbml-export-filename';

describe('buildDbmlExportFilename', () => {
    it('uses diagram slug with .dbml extension', () => {
        expect(buildDbmlExportFilename('My Diagram')).toBe('my-diagram.dbml');
    });

    it('falls back to diagram when name is empty', () => {
        expect(buildDbmlExportFilename('   ')).toBe('diagram.dbml');
    });
});
