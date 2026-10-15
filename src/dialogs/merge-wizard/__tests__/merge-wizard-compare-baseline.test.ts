import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { snapshotMergeBaseDiagram } from '@/lib/schema-merge/snapshot-merge-base-diagram';

const frontendRoot = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../..'
);

const readWizard = (): string =>
    readFileSync(
        join(frontendRoot, 'src/dialogs/merge-wizard/merge-wizard-dialog.tsx'),
        'utf8'
    );

const readApplyClient = (): string =>
    readFileSync(
        join(frontendRoot, 'src/lib/api/schema-merge-apply.ts'),
        'utf8'
    );

describe('merge compare baseline', () => {
    it('captures baseDiagram after autosave flush and before Compare', () => {
        const wizard = readWizard();

        expect(wizard).toContain('await flushDiagramAutosave()');
        expect(wizard).toContain('snapshotMergeBaseDiagram(currentDiagram)');
        expect(wizard).toContain('baseDiagram,');
        expect(wizard).toMatch(
            /await flushDiagramAutosave\(\)[\s\S]*const baseDiagram = snapshotMergeBaseDiagram\(currentDiagram\);[\s\S]*compareSchemaMerge/
        );
    });

    it('does not send baseDiagram in Apply requests', () => {
        const applyClient = readApplyClient();

        expect(applyClient).not.toContain('baseDiagram');
        expect(applyClient).toContain('baseContentHash');
        expect(applyClient).toContain('selectedOperationIds');
    });

    it('isolates baseDiagram from later live diagram mutation', () => {
        const live: Diagram = {
            id: '42',
            name: 'Live',
            databaseType: DatabaseType.POSTGRESQL,
            tables: [
                {
                    id: 't1',
                    name: 'users',
                    schema: 'public',
                    x: 1,
                    y: 2,
                    fields: [],
                    indexes: [],
                    color: '#fff',
                    isView: false,
                    createdAt: 0,
                },
            ],
            relationships: [],
            createdAt: new Date(0),
            updatedAt: new Date(0),
        };

        const baseDiagram = snapshotMergeBaseDiagram(live);
        live.tables![0].x = 500;

        expect(baseDiagram.tables?.[0]?.x).toBe(1);
    });
});
