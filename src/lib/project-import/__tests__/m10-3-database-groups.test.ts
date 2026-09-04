import { describe, expect, it } from 'vitest';
import { ArchiveReader } from '../archive/archive-reader';
import { collectGroupBundle } from '../bundle/collect-group-bundle';
import { detectProjectCandidates } from '../detection/detect-project';
import { detectDatabaseGroups } from '../detection/database-groups/detect-database-groups';
import { buildArchivePathIndex } from '../detection/archive-paths';
import type { ProjectDetectionCandidate } from '../project-types';
import { evidenceFromCode } from '../detection/detector-utils';
import {
    CANONICAL_PRISMA_SCHEMA,
    FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
    FLEXIBLE_DRIZZLE_CONFIG,
    FLEXIBLE_DRIZZLE_INITIAL_SQL,
    FLEXIBLE_DRIZZLE_JOURNAL,
    LARAVEL_CREATE_POSTS_MIGRATION,
    LARAVEL_CREATE_USERS_MIGRATION,
} from './fixtures/flexible-layout-fixtures';
import { createTestZipFile } from './fixtures/build-test-zip';

const EF_CSPROJ =
    '<Project><ItemGroup><PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" /></ItemGroup></Project>';
const APP_SNAPSHOT =
    'partial class AppDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';
const CATALOG_SNAPSHOT =
    'partial class CatalogDbContextModelSnapshot : ModelSnapshot { protected override void BuildModel(ModelBuilder modelBuilder) {} }';

const selectFrameworkCandidate = (
    candidates: Awaited<ReturnType<typeof detectProjectCandidates>>,
    framework: string
) => {
    const matches = candidates.filter(
        (candidate) => candidate.framework === framework
    );

    if (matches.length === 0) {
        return undefined;
    }

    return matches.sort(
        (left, right) => right.relevantFiles.length - left.relevantFiles.length
    )[0];
};

const detectGroupsFromZip = async (files: Record<string, string>) => {
    const file = createTestZipFile(files);
    const archive = await ArchiveReader.open(file);
    const candidates = await detectProjectCandidates(archive);

    return {
        archive,
        candidates,
        laravel: selectFrameworkCandidate(candidates, 'laravel'),
        ef: selectFrameworkCandidate(candidates, 'entity_framework_core'),
        prisma: selectFrameworkCandidate(candidates, 'prisma'),
        drizzle: selectFrameworkCandidate(candidates, 'drizzle'),
        django: selectFrameworkCandidate(candidates, 'django'),
        rails: selectFrameworkCandidate(candidates, 'rails'),
    };
};

const analyzeLaravelGroups = async (files: Record<string, string>) => {
    const { archive, laravel } = await detectGroupsFromZip(files);
    expect(laravel).toBeDefined();
    const analysis = await detectDatabaseGroups(archive, laravel!);
    return { archive, laravel: laravel!, analysis };
};

describe('M10.3 Laravel database groups', () => {
    it('A. normal single migrations folder → 1 group', async () => {
        const { analysis } = await analyzeLaravelGroups({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2026_01_01_create_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        expect(analysis.status).toBe('single');
        expect(analysis.groups).toHaveLength(1);
    });

    it('B. root + catalog + tenant → multiple groups', async () => {
        const { analysis } = await analyzeLaravelGroups({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/0001_create_admin_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
            'database/migrations/catalog/0001_create_products.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
            'database/migrations/tenant/0001_create_customers.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
        });

        expect(analysis.status).toBe('multiple');
        expect(analysis.groups).toHaveLength(3);
        expect(analysis.groups.map((group) => group.label).sort()).toEqual([
            'Catalog',
            'Main',
            'Tenant',
        ]);
    });

    it('C. catalog + tenant only → 2 groups', async () => {
        const { analysis } = await analyzeLaravelGroups({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/catalog/0001_create_products.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
            'database/migrations/tenant/0001_create_customers.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
        });

        expect(analysis.status).toBe('multiple');
        expect(analysis.groups).toHaveLength(2);
    });

    it('D. single organizational nested folder → do not over-group', async () => {
        const { analysis } = await analyzeLaravelGroups({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/organizational/nested/0001_create_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        expect(analysis.status).toBe('single');
        expect(analysis.groups).toHaveLength(1);
    });

    it('E. root migrations shared with catalog group', async () => {
        const { archive, laravel, analysis } = await analyzeLaravelGroups({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/0001_shared.php':
                LARAVEL_CREATE_USERS_MIGRATION,
            'database/migrations/catalog/0002_products.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
        });

        const catalogGroup = analysis.groups.find(
            (group) => group.label === 'Catalog'
        );
        expect(catalogGroup?.supportingFileMappings?.length).toBeGreaterThan(0);

        const bundle = await collectGroupBundle(
            archive,
            laravel,
            catalogGroup!
        );
        const paths = bundle.files.map((file) => file.relativePath);
        expect(paths).toContain('database/migrations/0001_shared.php');
        expect(paths).toContain(
            'database/migrations/catalog/0002_products.php'
        );
        archive.close();
    });

    it('I. selected catalog bundle excludes tenant migrations', async () => {
        const { archive, laravel, analysis } = await analyzeLaravelGroups({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/catalog/0001_create_products.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
            'database/migrations/tenant/0001_create_customers.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        const catalogGroup = analysis.groups.find(
            (group) => group.label === 'Catalog'
        )!;
        const bundle = await collectGroupBundle(archive, laravel, catalogGroup);
        const paths = bundle.files.map((file) => file.relativePath);

        expect(paths.some((path) => path.includes('/tenant/'))).toBe(false);
        expect(paths.some((path) => path.includes('/catalog/'))).toBe(true);
        archive.close();
    });
});

describe('M10.3 EF Core database groups', () => {
    it('A. one ModelSnapshot → 1 group', async () => {
        const { archive, ef } = await detectGroupsFromZip({
            'App.csproj': EF_CSPROJ,
            'Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
        });
        const analysis = await detectDatabaseGroups(archive, ef!);
        expect(analysis.status).toBe('single');
        archive.close();
    });

    it('B. App + Catalog snapshots → 2 groups', async () => {
        const { archive, ef } = await detectGroupsFromZip({
            'App.csproj': EF_CSPROJ,
            'Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
            'CatalogMigrations/CatalogDbContextModelSnapshot.cs':
                CATALOG_SNAPSHOT,
        });
        const analysis = await detectDatabaseGroups(archive, ef!);
        expect(analysis.status).toBe('multiple');
        expect(analysis.groups).toHaveLength(2);
        archive.close();
    });

    it('D. duplicate snapshots for same DbContext → single group', async () => {
        const { archive, ef } = await detectGroupsFromZip({
            'App.csproj': EF_CSPROJ,
            'Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
            'Backup/Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
        });
        const analysis = await detectDatabaseGroups(archive, ef!);
        expect(analysis.status).toBe('single');
        archive.close();
    });

    it('E. selected DbContext bundle excludes other snapshots', async () => {
        const { archive, ef } = await detectGroupsFromZip({
            'App.csproj': EF_CSPROJ,
            'Migrations/AppDbContextModelSnapshot.cs': APP_SNAPSHOT,
            'CatalogMigrations/CatalogDbContextModelSnapshot.cs':
                CATALOG_SNAPSHOT,
        });
        const analysis = await detectDatabaseGroups(archive, ef!);
        const catalogGroup = analysis.groups.find((group) =>
            group.label.includes('Catalog')
        )!;
        const bundle = await collectGroupBundle(archive, ef!, catalogGroup);
        const paths = bundle.files.map((file) => file.relativePath);

        expect(paths).not.toContain('Migrations/AppDbContextModelSnapshot.cs');
        expect(paths).toContain(
            'CatalogMigrations/CatalogDbContextModelSnapshot.cs'
        );
        archive.close();
    });
});

describe('M10.3 Prisma database groups', () => {
    it('A. one schema → one group', async () => {
        const { archive, prisma } = await detectGroupsFromZip({
            'package.json': '{"dependencies":{"@prisma/client":"^5.0.0"}}',
            'prisma/schema.prisma': CANONICAL_PRISMA_SCHEMA,
        });
        const analysis = await detectDatabaseGroups(archive, prisma!);
        expect(analysis.status).toBe('single');
        archive.close();
    });

    it('B. monorepo api + admin schemas → two groups', async () => {
        const { archive, prisma } = await detectGroupsFromZip({
            'package.json': '{"dependencies":{"@prisma/client":"^5.0.0"}}',
            'packages/api/prisma/schema.prisma': CANONICAL_PRISMA_SCHEMA,
            'packages/admin/prisma/schema.prisma': CANONICAL_PRISMA_SCHEMA,
        });
        const analysis = await detectDatabaseGroups(archive, prisma!);
        expect(analysis.status).toBe('multiple');
        expect(analysis.groups).toHaveLength(2);
        archive.close();
    });
});

describe('M10.3 Django database groups', () => {
    it('A. ordinary multi-app project → one group', async () => {
        const { archive, django } = await detectGroupsFromZip({
            'manage.py': '#!/usr/bin/env python',
            'users/migrations/0001_initial.py':
                'from django.db import migrations',
            'posts/migrations/0001_initial.py':
                'from django.db import migrations',
        });
        if (!django) {
            archive.close();
            return;
        }
        const analysis = await detectDatabaseGroups(archive, django);
        expect(analysis.status).toBe('single');
        archive.close();
    });
});

const buildArchiveRootDrizzleCandidate = (
    archive: ArchiveReader,
    rootPath = ''
): ProjectDetectionCandidate => {
    const index = buildArchivePathIndex(archive);
    const relevantFiles = index.filePaths.filter((filePath) =>
        /(^|\/)drizzle\.config\.(ts|js|mjs|cjs)$/.test(
            filePath.slice(rootPath.length + (rootPath.length > 0 ? 1 : 0))
        )
    );

    return {
        framework: 'drizzle',
        rootPath,
        score: 10,
        confidence: 'high',
        evidence: [evidenceFromCode('drizzle_config', relevantFiles[0])],
        relevantFiles,
        parserLocation: 'local',
    };
};

describe('M10.3 Drizzle database groups', () => {
    it('A. one config/journal → one group', async () => {
        const { archive, drizzle } = await detectGroupsFromZip({
            'package.json': '{"dependencies":{"drizzle-orm":"^0.30.0"}}',
            'drizzle.config.ts': FLEXIBLE_DRIZZLE_CONFIG,
            'drizzle/meta/_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
            'drizzle/0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
        });
        const analysis = await detectDatabaseGroups(archive, drizzle!);
        expect(analysis.status).toBe('single');
        archive.close();
    });

    it('B. two configs + histories → two groups', async () => {
        const { archive } = await detectGroupsFromZip({
            'package.json': '{"dependencies":{"drizzle-orm":"^0.30.0"}}',
            'packages/api/drizzle.config.ts': FLEXIBLE_DRIZZLE_CONFIG,
            'packages/api/drizzle/meta/_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
            'packages/api/drizzle/0000_initial.sql':
                FLEXIBLE_DRIZZLE_INITIAL_SQL,
            'packages/admin/drizzle.config.ts': FLEXIBLE_DRIZZLE_CONFIG,
            'packages/admin/drizzle/meta/_journal.json':
                FLEXIBLE_DRIZZLE_JOURNAL,
            'packages/admin/drizzle/0000_initial.sql':
                FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
        });
        const drizzleCandidate = buildArchiveRootDrizzleCandidate(archive);
        const analysis = await detectDatabaseGroups(archive, drizzleCandidate);
        expect(analysis.status).toBe('multiple');
        expect(analysis.groups).toHaveLength(2);
        archive.close();
    });
});
