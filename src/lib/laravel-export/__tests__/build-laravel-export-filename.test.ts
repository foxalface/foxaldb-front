import { describe, expect, it } from 'vitest';
import { buildLaravelExportFilename } from '../build-laravel-export-filename';

describe('buildLaravelExportFilename', () => {
    it('slugifies the diagram name and appends the laravel zip suffix', () => {
        expect(buildLaravelExportFilename('My Diagram')).toBe(
            'my-diagram-laravel-migrations.zip'
        );
    });

    it('falls back to diagram when the name is empty', () => {
        expect(buildLaravelExportFilename('   ')).toBe(
            'diagram-laravel-migrations.zip'
        );
    });

    it('strips leading and trailing separators', () => {
        expect(buildLaravelExportFilename('--Hello World--')).toBe(
            'hello-world-laravel-migrations.zip'
        );
    });
});
