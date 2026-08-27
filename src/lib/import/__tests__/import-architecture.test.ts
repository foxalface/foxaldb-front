import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = join(process.cwd(), 'src');

const walkProductionFiles = (dir: string, files: string[] = []): string[] => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            if (entry.name === '__tests__' || entry.name === 'node_modules') {
                continue;
            }

            walkProductionFiles(fullPath, files);
            continue;
        }

        if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }

    return files;
};

const productionSource = walkProductionFiles(SRC_ROOT)
    .filter((file) => !file.includes('.test.'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');

describe('import architecture regression', () => {
    it('has no detectImportMethod helper', () => {
        expect(productionSource).not.toMatch(/\bdetectImportMethod\b/);
    });

    it('has no legacy ImportDatabase tab component', () => {
        expect(productionSource).not.toMatch(
            /dialogs\/common\/import-database/
        );
        expect(productionSource).not.toMatch(/\bSmartQueryInstructions\b/);
        expect(productionSource).not.toMatch(/\bInstructionsSection\b/);
    });

    it('has no importMethods or initialImportMethod dialog props', () => {
        expect(productionSource).not.toMatch(/\bimportMethods\b/);
        expect(productionSource).not.toMatch(/\binitialImportMethod\b/);
    });

    it('routes create-flow schema import through ImportSchemaStep', () => {
        const createDialog = readFileSync(
            join(
                SRC_ROOT,
                'dialogs/create-diagram-dialog/create-diagram-dialog.tsx'
            ),
            'utf8'
        );

        expect(createDialog).toContain('ImportSchemaStep');
        expect(createDialog).not.toMatch(/dialogs\/common\/import-database/);
    });

    it('routes existing-diagram import through ImportSchemaStep', () => {
        const importDialog = readFileSync(
            join(
                SRC_ROOT,
                'dialogs/import-database-dialog/import-database-dialog.tsx'
            ),
            'utf8'
        );

        expect(importDialog).toContain('ImportSchemaStep');
        expect(importDialog).not.toMatch(
            /from ['"]@\/dialogs\/common\/import-database/
        );
    });
});
