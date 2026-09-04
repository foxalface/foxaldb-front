import { describe, expect, it } from 'vitest';
import { ArchiveReader } from '../archive/archive-reader';
import { collectFileBundle } from '../bundle/collect-file-bundle';
import { getCandidateImportPaths } from '../bundle/candidate-import-paths';
import { detectProjectCandidates } from '../detection/detect-project';
import { getProjectSummaryMetrics } from '../project-summary-metrics';
import { createTestZipFile } from './fixtures/build-test-zip';
import {
    LARAVEL_CREATE_POSTS_MIGRATION,
    LARAVEL_CREATE_USERS_MIGRATION,
} from './fixtures/flexible-layout-fixtures';

const buildUserArchiveMigration = (tableName: string): string =>
    LARAVEL_CREATE_USERS_MIGRATION.replace("'users'", `'${tableName}'`).replace(
        'users',
        tableName
    );

const REAL_QA_MIGRATION_FILES: Record<string, string> = {
    'database/migrations/2024_01_01_120001_create_table_1_table.php':
        buildUserArchiveMigration('table_1'),
    'database/migrations/2024_01_01_120002_create_table_3_table.php':
        buildUserArchiveMigration('table_3'),
    'database/migrations/2024_01_01_120003_create_table_4_table.php':
        buildUserArchiveMigration('table_4'),
    'database/migrations/2024_01_01_120004_create_table_5_table.php':
        buildUserArchiveMigration('table_5'),
    'database/migrations/2024_01_01_120005_create_table_6_table.php':
        buildUserArchiveMigration('table_6'),
    'database/migrations/2024_01_01_120006_create_table__b_table.php':
        buildUserArchiveMigration('table__b'),
};

const detectLaravel = async (files: Record<string, string>) => {
    const archive = await ArchiveReader.open(createTestZipFile(files));
    const candidates = await detectProjectCandidates(archive);
    const laravel = candidates.filter(
        (candidate) =>
            candidate.framework === 'laravel' &&
            (candidate.confidence === 'high' ||
                candidate.confidence === 'medium')
    );

    return { archive, laravel, candidates };
};

describe('M10.2.1 canonical partial-tree Laravel archive regression', () => {
    it('detects six migrations for database/migrations at ZIP root (real QA archive)', async () => {
        const { archive, laravel } = await detectLaravel(
            REAL_QA_MIGRATION_FILES
        );

        expect(laravel).toHaveLength(1);
        expect(laravel[0]?.rootPath).toBe('');
        expect(laravel[0]?.usesVirtualLayout).not.toBe(true);
        expect(laravel[0]?.relevantFiles).toHaveLength(6);

        const metrics = getProjectSummaryMetrics(laravel[0]!);
        expect(metrics).toEqual({ sourceFileKind: 'migrations', count: 6 });

        const importPaths = getCandidateImportPaths(laravel[0]!);
        expect(importPaths).toHaveLength(6);
        expect(
            importPaths.every((path) => path.startsWith('database/migrations/'))
        );
        expect(
            importPaths.some((path) =>
                path.includes('database/migrations/database/migrations/')
            )
        ).toBe(false);

        const bundle = await collectFileBundle(archive, laravel[0]!);
        expect(bundle.files).toHaveLength(6);
        expect(bundle.files.map((entry) => entry.relativePath).sort()).toEqual(
            importPaths
        );

        archive.close();
    });

    it('full canonical Laravel project remains unchanged', async () => {
        const { archive, laravel } = await detectLaravel({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2024_01_01_000000_create_users_table.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        expect(laravel).toHaveLength(1);
        expect(getProjectSummaryMetrics(laravel[0]!)).toEqual({
            sourceFileKind: 'migrations',
            count: 1,
        });
        archive.close();
    });

    it('migrations directory at ZIP root uses virtual layout', async () => {
        const { archive, laravel, candidates } = await detectLaravel({
            'migrations/2024_01_01_create_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
            'migrations/2024_01_02_create_posts.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
        });

        expect(laravel).toHaveLength(1);
        expect(laravel[0]?.usesVirtualLayout).toBe(true);
        expect(getProjectSummaryMetrics(laravel[0]!)).toEqual({
            sourceFileKind: 'migrations',
            count: 2,
        });
        expect(
            candidates.filter(
                (candidate) =>
                    candidate.framework === 'laravel' &&
                    candidate.usesVirtualLayout
            )
        ).toHaveLength(1);
        archive.close();
    });

    it('flattened migration files at archive root use virtual layout', async () => {
        const { archive, laravel } = await detectLaravel({
            '2024_01_01_create_users.php': LARAVEL_CREATE_USERS_MIGRATION,
            '2024_01_02_create_posts.php': LARAVEL_CREATE_POSTS_MIGRATION,
        });

        expect(laravel[0]?.usesVirtualLayout).toBe(true);
        expect(getProjectSummaryMetrics(laravel[0]!)).toEqual({
            sourceFileKind: 'migrations',
            count: 2,
        });
        archive.close();
    });

    it('wrapper export/database/migrations preserves canonical logical paths', async () => {
        const { archive, laravel } = await detectLaravel({
            'export/database/migrations/2024_01_01_create_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        expect(laravel[0]?.rootPath).toBe('export');
        expect(getProjectSummaryMetrics(laravel[0]!)).toEqual({
            sourceFileKind: 'migrations',
            count: 1,
        });

        const bundle = await collectFileBundle(archive, laravel[0]!);
        expect(bundle.files[0]?.relativePath).toBe(
            'database/migrations/2024_01_01_create_users.php'
        );
        archive.close();
    });

    it('preserves catalog and tenant subdirectories under migrations', async () => {
        const { archive, laravel } = await detectLaravel({
            'database/migrations/catalog/2026_create_products.php':
                LARAVEL_CREATE_USERS_MIGRATION,
            'database/migrations/tenant/2026_create_orders.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
        });

        expect(getProjectSummaryMetrics(laravel[0]!)).toEqual({
            sourceFileKind: 'migrations',
            count: 2,
        });

        const bundle = await collectFileBundle(archive, laravel[0]!);
        expect(bundle.files.map((entry) => entry.relativePath).sort()).toEqual([
            'database/migrations/catalog/2026_create_products.php',
            'database/migrations/tenant/2026_create_orders.php',
        ]);
        archive.close();
    });

    it('does not classify unrelated PHP files as Laravel migrations', async () => {
        const { archive, laravel } = await detectLaravel({
            'src/User.php': '<?php class User {}',
            'index.php': '<?php',
        });

        expect(laravel).toHaveLength(0);
        archive.close();
    });
});
