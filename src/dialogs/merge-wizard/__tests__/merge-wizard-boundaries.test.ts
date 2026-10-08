import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const frontendRoot = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../..'
);

const read = (path: string): string =>
    readFileSync(join(frontendRoot, path), 'utf8');

describe('schema merge M6 boundaries', () => {
    it('does not wait for autosave and does not hardcode upload limits', () => {
        const autosave = read('src/pages/editor-page/use-diagram-autosave.ts');
        const wizard = read('src/dialogs/merge-wizard/merge-wizard-dialog.tsx');
        const sourceStep = read(
            'src/dialogs/merge-wizard/merge-source-step.tsx'
        );
        const client = read('src/lib/api/schema-merge-compare.ts');
        const menu = read('src/pages/editor-page/top-navbar/menu/menu.tsx');

        expect(autosave).toContain('const AUTOSAVE_DEBOUNCE_MS = 900');
        expect(autosave).not.toMatch(/export const flush/);
        expect(autosave).not.toMatch(/flushDiagramAutosave/);

        for (const source of [wizard, sourceStep, client]) {
            expect(source).not.toMatch(/setTimeout\s*\(/);
            expect(source).not.toMatch(/\bsleep\s*\(/);
            expect(source).not.toMatch(/16777216/);
            expect(source).not.toMatch(/16\s*\*\s*1024/);
            expect(source).not.toMatch(/5\s*\*\s*1024\s*\*\s*1024/);
        }

        expect(client).toContain('payloadMaxBytes');
        expect(client).toContain('M8');
        expect(menu).not.toContain('openMergeWizardDialog');
        expect(menu).not.toContain('merge_wizard');
    });
});
