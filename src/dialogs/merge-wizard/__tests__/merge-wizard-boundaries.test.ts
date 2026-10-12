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

describe('schema merge wizard boundaries', () => {
    it('flushes autosave, calls Apply, and exposes Merge without a timer workaround', () => {
        const autosave = read(
            'src/lib/diagram-autosave/diagram-autosave-controller.ts'
        );
        const wizard = read('src/dialogs/merge-wizard/merge-wizard-dialog.tsx');
        const sourceStep = read(
            'src/dialogs/merge-wizard/merge-source-step.tsx'
        );
        const resultStep = read(
            'src/dialogs/merge-wizard/merge-result-step.tsx'
        );
        const formatter = read(
            'src/dialogs/merge-wizard/format-merge-change.ts'
        );
        const compareClient = read('src/lib/api/schema-merge-compare.ts');
        const applyClient = read('src/lib/api/schema-merge-apply.ts');
        const menu = read('src/pages/editor-page/top-navbar/menu/menu.tsx');

        expect(autosave).toContain('export const flushDiagramAutosave');
        expect(autosave).toContain('AUTOSAVE_DEBOUNCE_MS = 900');
        expect(wizard).toContain('flushDiagramAutosave');
        expect(wizard).toContain('applySchemaMerge');
        expect(wizard).not.toMatch(/setTimeout\s*\(\s*900/);
        expect(wizard).not.toMatch(/\bsleep\s*\(/);
        expect(sourceStep).not.toMatch(/setTimeout\s*\(/);
        expect(resultStep).not.toMatch(/setTimeout\s*\(/);
        expect(resultStep).not.toContain('mergeEnabled = false');
        expect(formatter).not.toContain('JSON.stringify');
        expect(compareClient).toContain('payloadMaxBytes');
        expect(compareClient).not.toContain('/merge/apply');
        expect(applyClient).toContain('/merge/apply');
        expect(applyClient).toContain('getClientId');
        expect(menu).toContain('openMergeWizardDialog');
        expect(menu).toContain('menu.actions.merge');

        for (const source of [wizard, sourceStep, resultStep, applyClient]) {
            expect(source).not.toMatch(/16777216/);
            expect(source).not.toMatch(/16\s*\*\s*1024/);
            expect(source).not.toMatch(/5\s*\*\s*1024\s*\*\s*1024/);
        }
    });
});
