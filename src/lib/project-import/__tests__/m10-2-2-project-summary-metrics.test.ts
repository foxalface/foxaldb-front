import { describe, expect, it } from 'vitest';
import { ArchiveReader } from '../archive/archive-reader';
import { collectFileBundle } from '../bundle/collect-file-bundle';
import { getCandidateImportPaths } from '../bundle/candidate-import-paths';
import { detectProjectCandidates } from '../detection/detect-project';
import {
    getProjectSummaryMetricTranslationKey,
    getProjectSummaryMetrics,
} from '../project-summary-metrics';
import { createTestZipFile } from './fixtures/build-test-zip';
import {
    FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
    FLEXIBLE_DRIZZLE_INITIAL_SQL,
    FLEXIBLE_DRIZZLE_JOURNAL,
    FLEXIBLE_EF_CSPROJ,
    FLEXIBLE_EF_SNAPSHOT,
    FLEXIBLE_PRISMA_SCHEMA,
    FLEXIBLE_RAILS_SCHEMA,
    DJANGO_USERS_ADD_BIO,
    DJANGO_USERS_INITIAL,
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

const detectFramework = async (
    files: Record<string, string>,
    framework: string
) => {
    const archive = await ArchiveReader.open(createTestZipFile(files));
    const candidates = await detectProjectCandidates(archive);
    const matches = candidates.filter(
        (candidate) =>
            candidate.framework === framework &&
            (candidate.confidence === 'high' ||
                candidate.confidence === 'medium')
    );

    return { archive, matches, candidates };
};

describe('M10.2.2 project summary metrics', () => {
    it('EF Core root-level snapshot reports one model snapshot (real QA archive)', async () => {
        const { archive, matches } = await detectFramework(
            {
                'AppDbContextModelSnapshot.cs': FLEXIBLE_EF_SNAPSHOT,
                'App.csproj': FLEXIBLE_EF_CSPROJ,
            },
            'entity_framework_core'
        );

        expect(matches).toHaveLength(1);
        expect(matches[0]?.usesVirtualLayout).not.toBe(true);

        const metrics = getProjectSummaryMetrics(matches[0]!);
        expect(metrics).toEqual({
            sourceFileKind: 'model_snapshot',
            count: 1,
        });
        expect(getProjectSummaryMetricTranslationKey(metrics)).toBe(
            'new_diagram_dialog.import_schema.project.model_snapshots_found'
        );

        const importPaths = getCandidateImportPaths(matches[0]!);
        expect(importPaths).toEqual([
            'App.csproj',
            'AppDbContextModelSnapshot.cs',
        ]);

        const bundle = await collectFileBundle(archive, matches[0]!);
        expect(bundle.files).toHaveLength(2);
        expect(
            bundle.files.filter((entry) =>
                entry.relativePath.endsWith('ModelSnapshot.cs')
            )
        ).toHaveLength(1);

        archive.close();
    });

    it('Laravel partial-tree archive still reports migration count', async () => {
        const { archive, matches } = await detectFramework(
            REAL_QA_MIGRATION_FILES,
            'laravel'
        );

        expect(getProjectSummaryMetrics(matches[0]!)).toEqual({
            sourceFileKind: 'migrations',
            count: 6,
        });
        archive.close();
    });

    it('Prisma reports schema file count for canonical and virtual layouts', async () => {
        const canonical = await detectFramework(
            { 'prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA },
            'prisma'
        );
        const flat = await detectFramework(
            { 'schema.prisma': FLEXIBLE_PRISMA_SCHEMA },
            'prisma'
        );

        expect(getProjectSummaryMetrics(canonical.matches[0]!)).toEqual({
            sourceFileKind: 'schema',
            count: 1,
        });
        expect(getProjectSummaryMetrics(flat.matches[0]!)).toEqual({
            sourceFileKind: 'schema',
            count: 1,
        });

        canonical.archive.close();
        flat.archive.close();
    });

    it('Rails reports schema file count for canonical and virtual layouts', async () => {
        const canonical = await detectFramework(
            { 'db/schema.rb': FLEXIBLE_RAILS_SCHEMA },
            'rails'
        );
        const flat = await detectFramework(
            { 'schema.rb': FLEXIBLE_RAILS_SCHEMA },
            'rails'
        );

        expect(getProjectSummaryMetrics(canonical.matches[0]!)).toEqual({
            sourceFileKind: 'schema',
            count: 1,
        });
        expect(getProjectSummaryMetrics(flat.matches[0]!)).toEqual({
            sourceFileKind: 'schema',
            count: 1,
        });

        canonical.archive.close();
        flat.archive.close();
    });

    it('Django reports migration count', async () => {
        const { archive, matches } = await detectFramework(
            {
                '0001_initial.py': DJANGO_USERS_INITIAL,
                '0002_add_bio.py': DJANGO_USERS_ADD_BIO,
            },
            'django'
        );

        expect(getProjectSummaryMetrics(matches[0]!)).toEqual({
            sourceFileKind: 'migrations',
            count: 2,
        });
        archive.close();
    });

    it('Drizzle reports SQL migration count for canonical and virtual layouts', async () => {
        const canonical = await detectFramework(
            {
                'drizzle/meta/_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
                'drizzle/0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
                'drizzle/0001_add_posts.sql': FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
            },
            'drizzle'
        );
        const flat = await detectFramework(
            {
                '_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
                '0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
                '0001_add_posts.sql': FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
            },
            'drizzle'
        );

        expect(getProjectSummaryMetrics(canonical.matches[0]!)).toEqual({
            sourceFileKind: 'sql_migrations',
            count: 2,
        });
        expect(getProjectSummaryMetrics(flat.matches[0]!)).toEqual({
            sourceFileKind: 'sql_migrations',
            count: 2,
        });

        canonical.archive.close();
        flat.archive.close();
    });

    it('does not create duplicate EF candidates for root-level snapshot archive', async () => {
        const { archive, candidates } = await detectFramework(
            {
                'AppDbContextModelSnapshot.cs': FLEXIBLE_EF_SNAPSHOT,
                'App.csproj': FLEXIBLE_EF_CSPROJ,
            },
            'entity_framework_core'
        );

        const efCandidates = candidates.filter(
            (candidate) => candidate.framework === 'entity_framework_core'
        );

        expect(efCandidates).toHaveLength(1);
        archive.close();
    });
});
