import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const providerSource = readFileSync(
    join(process.cwd(), 'src/context/dialog-context/dialog-provider.tsx'),
    'utf8'
);

describe('DialogProvider legacy import UI', () => {
    it('does not register removed Laravel migration import dialogs', () => {
        expect(providerSource).not.toContain('LaravelMigrationImportDialog');
        expect(providerSource).not.toContain('LaravelMigrationDiffDialog');
        expect(providerSource).not.toContain(
            'openLaravelMigrationImportDialog'
        );
        expect(providerSource).not.toContain('openLaravelMigrationDiffDialog');
    });

    it('does not register the removed standalone restore-json dialog', () => {
        expect(providerSource).not.toContain('ImportDiagramDialog');
        expect(providerSource).not.toContain('openImportDiagramDialog');
    });
});
