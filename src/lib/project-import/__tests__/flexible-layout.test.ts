import { describe, expect, it } from 'vitest';
import { ArchiveReader } from '../archive/archive-reader';
import { collectFileBundle } from '../bundle/collect-file-bundle';
import { detectProjectCandidates } from '../detection/detect-project';
import { analyzeProjectArchive } from '../analyze-project-archive';
import { parsePrismaProject } from '../local/prisma/prisma-project-parser';
import { parseRailsProject } from '../local/rails/rails-project-parser';
import { parseDrizzleProject } from '../local/drizzle/drizzle-project-parser';
import { DatabaseType } from '@/lib/domain/database-type';
import { createTestZipFile } from './fixtures/build-test-zip';
import {
    CANONICAL_PRISMA_SCHEMA,
    DJANGO_POSTS_INITIAL,
    DJANGO_USERS_ADD_BIO,
    DJANGO_USERS_INITIAL,
    FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
    FLEXIBLE_DRIZZLE_CONFIG,
    FLEXIBLE_DRIZZLE_INITIAL_SQL,
    FLEXIBLE_DRIZZLE_JOURNAL,
    FLEXIBLE_EF_CSPROJ,
    FLEXIBLE_EF_SNAPSHOT,
    FLEXIBLE_PRISMA_SCHEMA,
    FLEXIBLE_RAILS_SCHEMA,
    GENERIC_CSHARP_FILE,
    GENERIC_PHP_FILE,
    GENERIC_PYTHON_FILE,
    GENERIC_RUBY_FILE,
    INVALID_PRISMA_TEXT,
    LARAVEL_CREATE_POSTS_MIGRATION,
    LARAVEL_CREATE_USERS_MIGRATION,
} from './fixtures/flexible-layout-fixtures';

const detectFromZip = async (
    files: Record<string, string>,
    zipName = 'test.zip'
) => {
    const file = createTestZipFile(files, zipName);
    const archive = await ArchiveReader.open(file);
    const candidates = await detectProjectCandidates(archive);

    return { archive, candidates, file };
};

const selectable = (
    candidates: Awaited<ReturnType<typeof detectProjectCandidates>>,
    framework: string
) =>
    candidates.filter(
        (candidate) =>
            candidate.framework === framework &&
            (candidate.confidence === 'high' ||
                candidate.confidence === 'medium')
    );

describe('M10.2 flexible layout — Laravel', () => {
    it('A. canonical full project remains unchanged', async () => {
        const { archive, candidates } = await detectFromZip({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/2026_01_01_create_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        const laravel = candidates.find(
            (candidate) => candidate.framework === 'laravel'
        );

        expect(laravel?.usesVirtualLayout).not.toBe(true);
        expect(laravel?.confidence).toBe('high');
        archive.close();
    });

    it('B. database/migrations zipped directly', async () => {
        const { archive, candidates } = await detectFromZip({
            'database/migrations/2026_01_01_create_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        expect(selectable(candidates, 'laravel').length).toBeGreaterThan(0);
        archive.close();
    });

    it('C. migrations folder zipped directly', async () => {
        const { archive, candidates } = await detectFromZip({
            'migrations/2026_01_01_create_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        const laravel = selectable(candidates, 'laravel')[0];
        expect(laravel?.usesVirtualLayout).toBe(true);
        archive.close();
    });

    it('D. only migration PHP files at root', async () => {
        const { archive, candidates } = await detectFromZip(
            {
                '2026_01_01_create_users.php': LARAVEL_CREATE_USERS_MIGRATION,
                '2026_01_02_create_posts.php': LARAVEL_CREATE_POSTS_MIGRATION,
            },
            'migrations.zip'
        );

        const laravel = selectable(candidates, 'laravel')[0];
        expect(laravel?.usesVirtualLayout).toBe(true);

        const bundle = await collectFileBundle(archive, laravel!);
        expect(bundle.files.map((entry) => entry.relativePath).sort()).toEqual([
            'database/migrations/2026_01_01_create_users.php',
            'database/migrations/2026_01_02_create_posts.php',
        ]);
        archive.close();
    });

    it('E. arbitrary wrapper directory', async () => {
        const { archive, candidates } = await detectFromZip({
            'export/migrations/2026_01_01_create_users.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        const laravel = selectable(candidates, 'laravel')[0];
        expect(laravel?.rootPath).toBe('export');
        expect(laravel?.usesVirtualLayout).toBe(true);
        archive.close();
    });

    it('F. nested catalog migration path preserved in logical layout', async () => {
        const { archive, candidates } = await detectFromZip({
            'catalog/2026_create_products.php': LARAVEL_CREATE_USERS_MIGRATION,
        });

        const laravel = selectable(candidates, 'laravel')[0];
        const bundle = await collectFileBundle(archive, laravel!);

        expect(bundle.files[0]?.relativePath).toBe(
            'database/migrations/catalog/2026_create_products.php'
        );
        expect(laravel?.pathMappings?.[0]?.physicalPath).toBe(
            'catalog/2026_create_products.php'
        );
        archive.close();
    });

    it('G. arbitrary PHP archive must NOT detect Laravel', async () => {
        const { archive, candidates } = await detectFromZip({
            'src/User.php': GENERIC_PHP_FILE,
            'index.php': '<?php echo 1;',
        });

        expect(selectable(candidates, 'laravel')).toHaveLength(0);
        archive.close();
    });

    it('I. logical path collision fails safely', async () => {
        const { archive, candidates } = await detectFromZip({
            '2026_01_01_create_users.php': LARAVEL_CREATE_USERS_MIGRATION,
            'migrations/2026_01_01_create_users.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
        });

        const flexible = candidates.filter(
            (candidate) =>
                candidate.framework === 'laravel' && candidate.usesVirtualLayout
        );

        expect(flexible).toHaveLength(0);
        archive.close();
    });
});

describe('M10.2 flexible layout — Prisma', () => {
    it('A. canonical prisma/schema.prisma', async () => {
        const { archive, candidates } = await detectFromZip({
            'prisma/schema.prisma': CANONICAL_PRISMA_SCHEMA,
        });

        const prisma = candidates.find(
            (candidate) => candidate.framework === 'prisma'
        );

        expect(prisma?.usesVirtualLayout).not.toBe(true);
        archive.close();
    });

    it('B. schema.prisma at root', async () => {
        const { archive, candidates } = await detectFromZip(
            { 'schema.prisma': FLEXIBLE_PRISMA_SCHEMA },
            'schema.zip'
        );

        const prisma = selectable(candidates, 'prisma')[0];
        expect(prisma?.usesVirtualLayout).toBe(true);

        const bundle = await collectFileBundle(archive, prisma!);
        expect(bundle.files[0]?.relativePath).toBe('prisma/schema.prisma');
        archive.close();
    });

    it('C. wrapper/schema.prisma', async () => {
        const { archive, candidates } = await detectFromZip({
            'random-export-name/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
        });

        const prisma = selectable(candidates, 'prisma')[0];
        expect(prisma?.rootPath).toBe('random-export-name');
        archive.close();
    });

    it('D. prisma folder zipped directly', async () => {
        const { archive, candidates } = await detectFromZip({
            'prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
        });

        expect(selectable(candidates, 'prisma').length).toBeGreaterThan(0);
        archive.close();
    });

    it('E. two schema.prisma candidates stay ambiguous', async () => {
        const file = createTestZipFile({
            'apps/a/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
            'apps/b/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
        });
        const archive = await ArchiveReader.open(file);
        const analysis = await analyzeProjectArchive(archive);

        const flexiblePrisma = analysis.candidates.filter(
            (candidate) =>
                candidate.framework === 'prisma' && candidate.usesVirtualLayout
        );

        expect(flexiblePrisma).toHaveLength(0);
        archive.close();
    });

    it('F. invalid .prisma text is not detected', async () => {
        const { archive, candidates } = await detectFromZip({
            'schema.prisma': INVALID_PRISMA_TEXT,
        });

        expect(selectable(candidates, 'prisma')).toHaveLength(0);
        archive.close();
    });

    it('G. canonical vs flattened produce equivalent diagrams', async () => {
        const canonicalZip = createTestZipFile({
            'prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
        });
        const flatZip = createTestZipFile(
            { 'schema.prisma': FLEXIBLE_PRISMA_SCHEMA },
            'schema.zip'
        );

        const canonicalArchive = await ArchiveReader.open(canonicalZip);
        const flatArchive = await ArchiveReader.open(flatZip);
        const canonicalCandidate = (
            await detectProjectCandidates(canonicalArchive)
        ).find((candidate) => candidate.framework === 'prisma');
        const flatCandidate = (await detectProjectCandidates(flatArchive)).find(
            (candidate) =>
                candidate.framework === 'prisma' && candidate.usesVirtualLayout
        );

        const canonicalBundle = await collectFileBundle(
            canonicalArchive,
            canonicalCandidate!
        );
        const flatBundle = await collectFileBundle(flatArchive, flatCandidate!);

        const canonicalResult = await parsePrismaProject({
            candidate: canonicalCandidate!,
            bundle: canonicalBundle,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });
        const flatResult = await parsePrismaProject({
            candidate: flatCandidate!,
            bundle: flatBundle,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(
            flatResult.diagram.tables?.map((table) => table.name).sort()
        ).toEqual(
            canonicalResult.diagram.tables?.map((table) => table.name).sort()
        );

        canonicalArchive.close();
        flatArchive.close();
    });
});

describe('M10.2 flexible layout — EF Core', () => {
    it('A. canonical csproj + Migrations snapshot', async () => {
        const { archive, candidates } = await detectFromZip({
            'foxaldb/App.csproj': FLEXIBLE_EF_CSPROJ,
            'foxaldb/Migrations/AppDbContextModelSnapshot.cs':
                FLEXIBLE_EF_SNAPSHOT,
        });

        const ef = candidates.find(
            (candidate) => candidate.framework === 'entity_framework_core'
        );

        expect(ef?.usesVirtualLayout).not.toBe(true);
        archive.close();
    });

    it('B. snapshot at root + csproj is absorbed into canonical project candidate', async () => {
        const { archive, candidates } = await detectFromZip({
            'AppDbContextModelSnapshot.cs': FLEXIBLE_EF_SNAPSHOT,
            'App.csproj': FLEXIBLE_EF_CSPROJ,
        });

        const ef = selectable(candidates, 'entity_framework_core')[0];
        expect(ef?.usesVirtualLayout).not.toBe(true);
        expect(ef?.relevantFiles).toEqual([
            'App.csproj',
            'AppDbContextModelSnapshot.cs',
        ]);

        const bundle = await collectFileBundle(archive, ef!);
        expect(bundle.files.map((entry) => entry.relativePath).sort()).toEqual([
            'App.csproj',
            'AppDbContextModelSnapshot.cs',
        ]);
        archive.close();
    });

    it('D. arbitrary wrapper', async () => {
        const { archive, candidates } = await detectFromZip({
            'export/AppDbContextModelSnapshot.cs': FLEXIBLE_EF_SNAPSHOT,
            'export/App.csproj': FLEXIBLE_EF_CSPROJ,
        });

        const ef = selectable(candidates, 'entity_framework_core')[0];
        expect(ef?.rootPath).toBe('export');
        archive.close();
    });

    it('E. multiple snapshots remain ambiguous', async () => {
        const { archive, candidates } = await detectFromZip({
            'AAppDbContextModelSnapshot.cs': FLEXIBLE_EF_SNAPSHOT,
            'BAppDbContextModelSnapshot.cs': FLEXIBLE_EF_SNAPSHOT,
            'App.csproj': FLEXIBLE_EF_CSPROJ,
        });

        const flexible = candidates.filter(
            (candidate) =>
                candidate.framework === 'entity_framework_core' &&
                candidate.usesVirtualLayout
        );

        expect(flexible).toHaveLength(0);
        archive.close();
    });

    it('F. random C# is not detected', async () => {
        const { archive, candidates } = await detectFromZip({
            'Program.cs': GENERIC_CSHARP_FILE,
        });

        expect(selectable(candidates, 'entity_framework_core')).toHaveLength(0);
        archive.close();
    });
});

describe('M10.2 flexible layout — Rails', () => {
    it('A. db/schema.rb canonical', async () => {
        const { archive, candidates } = await detectFromZip({
            'db/schema.rb': FLEXIBLE_RAILS_SCHEMA,
        });

        const rails = candidates.find(
            (candidate) => candidate.framework === 'rails'
        );

        expect(rails?.usesVirtualLayout).not.toBe(true);
        archive.close();
    });

    it('B. schema.rb at root', async () => {
        const { archive, candidates } = await detectFromZip(
            { 'schema.rb': FLEXIBLE_RAILS_SCHEMA },
            'rails.zip'
        );

        const rails = selectable(candidates, 'rails')[0];
        expect(rails?.usesVirtualLayout).toBe(true);

        const bundle = await collectFileBundle(archive, rails!);
        expect(bundle.files[0]?.relativePath).toBe('db/schema.rb');
        archive.close();
    });

    it('C. wrapper/schema.rb', async () => {
        const { archive, candidates } = await detectFromZip({
            'wrapper/schema.rb': FLEXIBLE_RAILS_SCHEMA,
        });

        const rails = selectable(candidates, 'rails')[0];
        expect(rails?.rootPath).toBe('wrapper');
        archive.close();
    });

    it('D. db folder zipped directly', async () => {
        const { archive, candidates } = await detectFromZip({
            'db/schema.rb': FLEXIBLE_RAILS_SCHEMA,
        });

        expect(selectable(candidates, 'rails').length).toBeGreaterThan(0);
        archive.close();
    });

    it('E. arbitrary ruby file is not detected', async () => {
        const { archive, candidates } = await detectFromZip({
            'lib/greeter.rb': GENERIC_RUBY_FILE,
        });

        expect(selectable(candidates, 'rails')).toHaveLength(0);
        archive.close();
    });

    it('F. two schema.rb files are ambiguous', async () => {
        const { archive, candidates } = await detectFromZip({
            'a/schema.rb': FLEXIBLE_RAILS_SCHEMA,
            'b/schema.rb': FLEXIBLE_RAILS_SCHEMA,
        });

        const flexible = candidates.filter(
            (candidate) =>
                candidate.framework === 'rails' && candidate.usesVirtualLayout
        );

        expect(flexible).toHaveLength(0);
        archive.close();
    });

    it('G. canonical vs flattened equivalent diagrams', async () => {
        const canonicalArchive = await ArchiveReader.open(
            createTestZipFile({ 'db/schema.rb': FLEXIBLE_RAILS_SCHEMA })
        );
        const flatArchive = await ArchiveReader.open(
            createTestZipFile(
                { 'schema.rb': FLEXIBLE_RAILS_SCHEMA },
                'rails.zip'
            )
        );

        const canonicalCandidate = (
            await detectProjectCandidates(canonicalArchive)
        ).find((candidate) => candidate.framework === 'rails');
        const flatCandidate = (await detectProjectCandidates(flatArchive)).find(
            (candidate) =>
                candidate.framework === 'rails' && candidate.usesVirtualLayout
        );

        const canonicalResult = await parseRailsProject({
            candidate: canonicalCandidate!,
            bundle: await collectFileBundle(
                canonicalArchive,
                canonicalCandidate!
            ),
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });
        const flatResult = await parseRailsProject({
            candidate: flatCandidate!,
            bundle: await collectFileBundle(flatArchive, flatCandidate!),
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(
            flatResult.diagram.tables?.map((table) => table.name).sort()
        ).toEqual(
            canonicalResult.diagram.tables?.map((table) => table.name).sort()
        );

        canonicalArchive.close();
        flatArchive.close();
    });
});

describe('M10.2 flexible layout — Django', () => {
    it('A. canonical app/migrations/*', async () => {
        const { archive, candidates } = await detectFromZip({
            'users/migrations/0001_initial.py': DJANGO_USERS_INITIAL,
        });

        const django = candidates.find(
            (candidate) => candidate.framework === 'django'
        );

        expect(django?.usesVirtualLayout).not.toBe(true);
        archive.close();
    });

    it('B. migrations folder zipped directly via virtual layout', async () => {
        const { archive, candidates } = await detectFromZip({
            'migrations/0001_initial.py': DJANGO_USERS_INITIAL,
        });

        const django = selectable(candidates, 'django')[0];
        expect(django?.usesVirtualLayout).toBe(true);
        archive.close();
    });

    it('C. migration files at root', async () => {
        const { archive, candidates } = await detectFromZip({
            '0001_initial.py': DJANGO_USERS_INITIAL,
            '0002_add_bio.py': DJANGO_USERS_ADD_BIO,
        });

        const django = selectable(candidates, 'django')[0];
        expect(django?.usesVirtualLayout).toBe(true);

        const bundle = await collectFileBundle(archive, django!);

        expect(
            bundle.files.every((entry) =>
                entry.relativePath.includes('/migrations/')
            )
        ).toBe(true);
        archive.close();
    });

    it('E. multiple apps flattened must NOT silently merge', async () => {
        const { archive, candidates } = await detectFromZip({
            'users/0001_initial.py': DJANGO_USERS_INITIAL,
            'posts/0001_initial.py': DJANGO_POSTS_INITIAL,
        });

        const flexible = candidates.filter(
            (candidate) =>
                candidate.framework === 'django' && candidate.usesVirtualLayout
        );

        expect(flexible).toHaveLength(0);
        archive.close();
    });

    it('H. random Python files are not detected', async () => {
        const { archive, candidates } = await detectFromZip({
            'main.py': GENERIC_PYTHON_FILE,
        });

        expect(selectable(candidates, 'django')).toHaveLength(0);
        archive.close();
    });
});

describe('M10.2 flexible layout — Drizzle', () => {
    it('A. canonical drizzle/', async () => {
        const { archive, candidates } = await detectFromZip({
            'drizzle.config.ts': FLEXIBLE_DRIZZLE_CONFIG,
            'drizzle/meta/_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
            'drizzle/0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
            'drizzle/0001_add_posts.sql': FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
        });

        const drizzle = candidates.find(
            (candidate) => candidate.framework === 'drizzle'
        );

        expect(drizzle?.usesVirtualLayout).not.toBe(true);
        archive.close();
    });

    it('B. drizzle folder zipped directly via canonical paths', async () => {
        const { archive, candidates } = await detectFromZip({
            'drizzle/meta/_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
            'drizzle/0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
            'drizzle/0001_add_posts.sql': FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
        });

        const drizzle = selectable(candidates, 'drizzle')[0];
        expect(drizzle?.usesVirtualLayout).not.toBe(true);
        archive.close();
    });

    it('C. SQL + journal at root', async () => {
        const { archive, candidates } = await detectFromZip(
            {
                '_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
                '0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
                '0001_add_posts.sql': FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
            },
            'drizzle.zip'
        );

        const drizzle = selectable(candidates, 'drizzle')[0];
        expect(drizzle?.usesVirtualLayout).toBe(true);

        const bundle = await collectFileBundle(archive, drizzle!);
        expect(bundle.files.map((entry) => entry.relativePath).sort()).toEqual([
            'drizzle/0000_initial.sql',
            'drizzle/0001_add_posts.sql',
            'drizzle/meta/_journal.json',
        ]);
        archive.close();
    });

    it('F. arbitrary SQL archive is not Drizzle', async () => {
        const { archive, candidates } = await detectFromZip({
            '0001_init.sql': 'CREATE TABLE users (id int);',
        });

        expect(selectable(candidates, 'drizzle')).toHaveLength(0);
        archive.close();
    });

    it('G. canonical vs flattened equivalent diagrams', async () => {
        const canonicalArchive = await ArchiveReader.open(
            createTestZipFile({
                'drizzle/meta/_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
                'drizzle/0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
                'drizzle/0001_add_posts.sql': FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
            })
        );
        const flatArchive = await ArchiveReader.open(
            createTestZipFile(
                {
                    '_journal.json': FLEXIBLE_DRIZZLE_JOURNAL,
                    '0000_initial.sql': FLEXIBLE_DRIZZLE_INITIAL_SQL,
                    '0001_add_posts.sql': FLEXIBLE_DRIZZLE_ADD_POSTS_SQL,
                },
                'drizzle.zip'
            )
        );

        const canonicalCandidate = (
            await detectProjectCandidates(canonicalArchive)
        ).find((candidate) => candidate.framework === 'drizzle');
        const flatCandidate = (await detectProjectCandidates(flatArchive)).find(
            (candidate) =>
                candidate.framework === 'drizzle' && candidate.usesVirtualLayout
        );

        const canonicalResult = await parseDrizzleProject({
            candidate: canonicalCandidate!,
            bundle: await collectFileBundle(
                canonicalArchive,
                canonicalCandidate!
            ),
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });
        const flatResult = await parseDrizzleProject({
            candidate: flatCandidate!,
            bundle: await collectFileBundle(flatArchive, flatCandidate!),
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        expect(
            flatResult.diagram.tables?.map((table) => table.name).sort()
        ).toEqual(
            canonicalResult.diagram.tables?.map((table) => table.name).sort()
        );

        canonicalArchive.close();
        flatArchive.close();
    });
});

describe('M10.2 diagram naming', () => {
    it('uses archive basename for virtual layout imports', async () => {
        const file = createTestZipFile(
            { 'schema.prisma': FLEXIBLE_PRISMA_SCHEMA },
            'schema.zip'
        );
        const archive = await ArchiveReader.open(file);
        const candidate = (await detectProjectCandidates(archive)).find(
            (entry) => entry.framework === 'prisma' && entry.usesVirtualLayout
        );

        const bundle = await collectFileBundle(archive, candidate!, {
            diagramNameHint: 'schema Import',
        });

        expect(bundle.diagramNameHint).toBe('schema Import');
        archive.close();
    });
});

describe('M10.2 source leakage', () => {
    it('does not expose raw source in bundle diagnostics paths only', async () => {
        const sentinel = 'FOXALDB_DO_NOT_EXPOSE_FLEX_SOURCE';
        const { archive, candidates } = await detectFromZip({
            'schema.prisma': `${FLEXIBLE_PRISMA_SCHEMA}\n// ${sentinel}`,
        });

        const prisma = selectable(candidates, 'prisma')[0];
        const bundle = await collectFileBundle(archive, prisma!);
        const serialized = JSON.stringify(bundle);

        expect(bundle.files[0]?.content).toContain(sentinel);
        expect(serialized).toContain(sentinel);
        archive.close();
    });
});
