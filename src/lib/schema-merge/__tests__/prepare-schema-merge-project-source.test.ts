import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    createRawZipFile,
    createTestZipFile,
} from '@/lib/project-import/__tests__/fixtures/build-test-zip';
import {
    FLEXIBLE_PRISMA_SCHEMA,
    INVALID_PRISMA_TEXT,
    LARAVEL_CREATE_POSTS_MIGRATION,
    LARAVEL_CREATE_USERS_MIGRATION,
} from '@/lib/project-import/__tests__/fixtures/flexible-layout-fixtures';
import {
    DRIZZLE_ADD_BIO_SQL,
    DRIZZLE_INIT_SQL,
    DRIZZLE_JOURNAL,
} from '@/lib/project-import/local/drizzle/__tests__/fixtures/drizzle-migrations';
import { IMPLICIT_ID_SCHEMA } from '@/lib/project-import/local/rails/__tests__/fixtures/rails-schemas';
import { ProjectImportUnauthenticatedError } from '@/lib/project-import/project-import-errors';
import type { ParseRemoteProjectParams } from '@/lib/project-import/remote/parse-remote-project';
import { getProjectCandidateKey } from '@/lib/project-import/framework-labels';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from '@/lib/upload-capabilities/safety-ceiling';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';
import { prepareSchemaMergeSource } from '../prepare-schema-merge-source';
import type {
    PrepareSchemaMergeSourceContext,
    SchemaMergeReadySource,
    SchemaMergeSourcePreparationResult,
    SchemaMergeSourceResolution,
} from '../source-adapter-types';

const { parseRemoteProjectMock } = vi.hoisted(() => ({
    parseRemoteProjectMock: vi.fn(),
}));

vi.mock('@/lib/project-import/remote/parse-remote-project', () => ({
    parseRemoteProject: parseRemoteProjectMock,
}));

const EF_CSPROJ =
    '<Project><ItemGroup><PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" /></ItemGroup></Project>';

const contextFor = (
    databaseType: DatabaseType,
    resolution?: SchemaMergeSourceResolution,
    uploadCapabilities: UploadCapabilities = CONSERVATIVE_UPLOAD_SAFETY_CEILING
): PrepareSchemaMergeSourceContext => ({
    currentDiagram: { databaseType },
    ...(resolution ? { resolution } : {}),
    uploadCapabilities,
});

const prepareArchive = (
    file: File,
    databaseType: DatabaseType,
    resolution?: SchemaMergeSourceResolution,
    uploadCapabilities?: UploadCapabilities
) =>
    prepareSchemaMergeSource(
        { type: 'archive', file },
        contextFor(
            databaseType,
            resolution,
            uploadCapabilities ?? CONSERVATIVE_UPLOAD_SAFETY_CEILING
        )
    );

const expectReady = (result: SchemaMergeSourcePreparationResult) => {
    expect(result.status).toBe('ready');

    if (result.status !== 'ready') {
        throw new Error(`expected ready, received ${result.status}`);
    }

    expect(Object.keys(result.source)).toEqual(['kind']);
    expect(result.detectedFormat).toBeNull();
    expect(result.incomingDiagram.databaseType).toEqual(expect.any(String));
    expect(Array.isArray(result.incomingDiagram.tables)).toBe(true);
    expect(Array.isArray(result.incomingDiagram.relationships)).toBe(true);
    expect(result).not.toHaveProperty('compareViews');
    expect(result.source).not.toHaveProperty('databaseType');
    expect(result.source).not.toHaveProperty('viewsSupported');

    return result;
};

const readyKeys = (result: SchemaMergeReadySource): string[] =>
    Object.keys(result).sort();

describe('prepareSchemaMergeSource project archives', () => {
    beforeEach(() => {
        parseRemoteProjectMock.mockReset();
        parseRemoteProjectMock.mockImplementation(
            async (params: ParseRemoteProjectParams) => ({
                diagram: {
                    id: 'remote-diagram',
                    name: 'Remote import',
                    databaseType: params.targetDatabaseType,
                    tables: [],
                    relationships: [],
                    createdAt: new Date(0),
                    updatedAt: new Date(0),
                },
                framework: params.framework,
                diagnostics: [],
            })
        );
    });

    it('prepares a Laravel archive as laravel', async () => {
        const result = await prepareArchive(
            createTestZipFile({
                artisan: '#!/usr/bin/env php',
                'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
                'database/migrations/2024_01_01_000000_create_users_table.php':
                    LARAVEL_CREATE_USERS_MIGRATION,
            }),
            DatabaseType.MYSQL
        );

        const ready = expectReady(result);
        expect(ready.source.kind).toBe('laravel');
        expect(ready.detectedFramework).toBe('laravel');
        expect(ready.incomingDiagram.databaseType).toBe(DatabaseType.MYSQL);
        expect(parseRemoteProjectMock).toHaveBeenCalledOnce();
        expect(parseRemoteProjectMock).toHaveBeenCalledWith(
            expect.objectContaining({
                framework: 'laravel',
                targetDatabaseType: DatabaseType.MYSQL,
            })
        );
    });

    it('prepares a Prisma archive locally as prisma', async () => {
        const result = await prepareArchive(
            createTestZipFile({
                'prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
            }),
            DatabaseType.POSTGRESQL
        );

        const ready = expectReady(result);
        expect(ready.source.kind).toBe('prisma');
        expect(ready.detectedFramework).toBe('prisma');
        expect(ready.incomingDiagram.databaseType).toBe(
            DatabaseType.POSTGRESQL
        );
        expect(
            ready.incomingDiagram.tables?.some((table) => table.name === 'User')
        ).toBe(true);
        expect(parseRemoteProjectMock).not.toHaveBeenCalled();
    });

    it('prepares an EF Core archive as entity_framework_core', async () => {
        const result = await prepareArchive(
            createTestZipFile({
                'Migrations/AppDbContextModelSnapshot.cs':
                    'partial class AppDbContextModelSnapshot { }',
                'Migrations/20240101000000_InitialMigration.cs':
                    'partial class InitialMigration { }',
                'App.csproj': EF_CSPROJ,
            }),
            DatabaseType.SQL_SERVER
        );

        const ready = expectReady(result);
        expect(ready.source.kind).toBe('entity_framework_core');
        expect(ready.detectedFramework).toBe('entity_framework_core');
        expect(ready.source.kind).not.toBe('ef_core');
        expect(parseRemoteProjectMock).toHaveBeenCalledWith(
            expect.objectContaining({
                framework: 'entity_framework_core',
                targetDatabaseType: DatabaseType.SQL_SERVER,
            })
        );
    });

    it('prepares a Rails archive locally as rails', async () => {
        const result = await prepareArchive(
            createTestZipFile({
                'db/schema.rb': IMPLICIT_ID_SCHEMA,
                Gemfile: "gem 'rails', '~> 7.1'",
            }),
            DatabaseType.POSTGRESQL
        );

        const ready = expectReady(result);
        expect(ready.source.kind).toBe('rails');
        expect(ready.detectedFramework).toBe('rails');
        expect(
            ready.incomingDiagram.tables?.some(
                (table) => table.name === 'widgets'
            )
        ).toBe(true);
        expect(parseRemoteProjectMock).not.toHaveBeenCalled();
    });

    it('prepares a Django archive as django', async () => {
        const result = await prepareArchive(
            createTestZipFile({
                'manage.py': '#!/usr/bin/env python',
                'app/migrations/0001_initial.py':
                    'from django.db import migrations',
                'pyproject.toml': 'Django>=5.0',
            }),
            DatabaseType.POSTGRESQL
        );

        const ready = expectReady(result);
        expect(ready.source.kind).toBe('django');
        expect(ready.detectedFramework).toBe('django');
        expect(parseRemoteProjectMock).toHaveBeenCalledWith(
            expect.objectContaining({
                framework: 'django',
                targetDatabaseType: DatabaseType.POSTGRESQL,
            })
        );
    });

    it('prepares a Drizzle archive locally as drizzle', async () => {
        const result = await prepareArchive(
            createTestZipFile({
                'drizzle.config.ts':
                    "export default { dialect: 'postgresql' };",
                'drizzle/meta/_journal.json': DRIZZLE_JOURNAL,
                'drizzle/0000_init.sql': DRIZZLE_INIT_SQL,
                'drizzle/0001_add_bio.sql': DRIZZLE_ADD_BIO_SQL,
            }),
            DatabaseType.POSTGRESQL
        );

        const ready = expectReady(result);
        expect(ready.source.kind).toBe('drizzle');
        expect(ready.detectedFramework).toBe('drizzle');
        expect(ready.source.kind).not.toBe('sql');
        expect(
            ready.incomingDiagram.tables?.some(
                (table) => table.name === 'users'
            )
        ).toBe(true);
        expect(parseRemoteProjectMock).not.toHaveBeenCalled();
    });

    it('returns the same ready shape for local and remote parsers', async () => {
        const prisma = expectReady(
            await prepareArchive(
                createTestZipFile({
                    'prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
                }),
                DatabaseType.POSTGRESQL
            )
        );
        const laravel = expectReady(
            await prepareArchive(
                createTestZipFile({
                    artisan: '#!/usr/bin/env php',
                    'composer.json':
                        '{"require":{"laravel/framework":"^11.0"}}',
                    'database/migrations/2024_01_01_000000_create_users_table.php':
                        LARAVEL_CREATE_USERS_MIGRATION,
                }),
                DatabaseType.MYSQL
            )
        );

        expect(readyKeys(prisma)).toEqual(readyKeys(laravel));
        expect(prisma.source.kind).toBe('prisma');
        expect(laravel.source.kind).toBe('laravel');
    });

    it('asks the caller to resolve an ambiguous project', async () => {
        const file = createTestZipFile({
            'repo/apps/api/artisan': '#!/usr/bin/env php',
            'repo/apps/api/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'repo/apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                LARAVEL_CREATE_USERS_MIGRATION,
            'repo/packages/db/prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
        });
        const unresolved = await prepareArchive(file, DatabaseType.POSTGRESQL);

        expect(unresolved.status).toBe('needs_project_resolution');
        expect(parseRemoteProjectMock).not.toHaveBeenCalled();

        if (unresolved.status !== 'needs_project_resolution') {
            return;
        }

        const prisma = unresolved.candidates.find(
            (candidate) => candidate.framework === 'prisma'
        );

        if (!prisma) {
            throw new Error('expected a Prisma candidate');
        }

        const resolved = await prepareArchive(file, DatabaseType.POSTGRESQL, {
            projectCandidateKey: getProjectCandidateKey(prisma),
        });
        const ready = expectReady(resolved);

        expect(ready.source.kind).toBe('prisma');
        expect(parseRemoteProjectMock).not.toHaveBeenCalled();
    });

    it('asks the caller to resolve multiple database groups', async () => {
        const file = createTestZipFile({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/catalog/0001_create_products.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
            'database/migrations/tenant/0001_create_customers.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });
        const unresolved = await prepareArchive(file, DatabaseType.MYSQL);

        expect(unresolved.status).toBe('needs_database_group_resolution');
        expect(parseRemoteProjectMock).not.toHaveBeenCalled();

        if (unresolved.status !== 'needs_database_group_resolution') {
            return;
        }

        expect(unresolved.sourceKind).toBe('laravel');
        expect(unresolved.analysis.groups.length).toBeGreaterThan(1);

        const catalog = unresolved.analysis.groups.find((group) =>
            group.label.toLowerCase().includes('catalog')
        );

        if (!catalog) {
            throw new Error('expected a catalog database group');
        }

        const resolved = await prepareArchive(file, DatabaseType.MYSQL, {
            databaseGroupId: catalog.id,
        });

        expectReady(resolved);
        expect(parseRemoteProjectMock).toHaveBeenCalledOnce();
    });

    it('does not keep a database group selection in module state', async () => {
        const multiple = createTestZipFile({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/catalog/0001_create_products.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
            'database/migrations/tenant/0001_create_customers.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });
        await prepareArchive(multiple, DatabaseType.MYSQL);

        const single = await prepareArchive(
            createTestZipFile({
                artisan: '#!/usr/bin/env php',
                'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
                'database/migrations/2024_01_01_000000_create_users_table.php':
                    LARAVEL_CREATE_USERS_MIGRATION,
            }),
            DatabaseType.MYSQL
        );

        expect(single.status).toBe('ready');
    });

    it('rejects an unknown project candidate and database group', async () => {
        const ambiguous = createTestZipFile({
            'repo/apps/api/artisan': '#!/usr/bin/env php',
            'repo/apps/api/composer.json':
                '{"require":{"laravel/framework":"^11.0"}}',
            'repo/apps/api/database/migrations/2024_01_01_000000_create_users_table.php':
                LARAVEL_CREATE_USERS_MIGRATION,
            'repo/packages/db/prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
        });

        await expect(
            prepareArchive(ambiguous, DatabaseType.POSTGRESQL, {
                projectCandidateKey: 'prisma:missing',
            })
        ).resolves.toEqual({
            status: 'invalid',
            code: 'unknown_project_candidate',
        });

        const grouped = createTestZipFile({
            artisan: '#!/usr/bin/env php',
            'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
            'database/migrations/catalog/0001_create_products.php':
                LARAVEL_CREATE_POSTS_MIGRATION,
            'database/migrations/tenant/0001_create_customers.php':
                LARAVEL_CREATE_USERS_MIGRATION,
        });

        await expect(
            prepareArchive(grouped, DatabaseType.MYSQL, {
                databaseGroupId: 'missing-group',
            })
        ).resolves.toEqual({
            status: 'invalid',
            code: 'unknown_database_group',
        });
    });

    it('returns a remote parse failure without assuming authentication', async () => {
        parseRemoteProjectMock.mockRejectedValueOnce(
            new ProjectImportUnauthenticatedError()
        );

        const result = await prepareArchive(
            createTestZipFile({
                artisan: '#!/usr/bin/env php',
                'composer.json': '{"require":{"laravel/framework":"^11.0"}}',
                'database/migrations/2024_01_01_000000_create_users_table.php':
                    LARAVEL_CREATE_USERS_MIGRATION,
            }),
            DatabaseType.MYSQL
        );

        expect(result).toEqual({
            status: 'project_parse_failure',
            code: 'project_import_unauthenticated',
            parserLocation: 'remote',
        });
    });

    it('returns malformed_source when a local parser rejects the archive', async () => {
        const result = await prepareArchive(
            createTestZipFile({
                'prisma/schema.prisma': INVALID_PRISMA_TEXT,
            }),
            DatabaseType.POSTGRESQL
        );

        expect(result).toEqual({
            status: 'invalid',
            code: 'malformed_source',
        });
        expect(parseRemoteProjectMock).not.toHaveBeenCalled();
    });

    it('rejects an oversized archive with the supplied compressed limit', async () => {
        const capabilities = structuredClone(
            CONSERVATIVE_UPLOAD_SAFETY_CEILING
        );
        capabilities.archive.compressedMaxBytes = 1;
        const file = createTestZipFile({
            'prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
        });
        const result = await prepareArchive(
            file,
            DatabaseType.POSTGRESQL,
            undefined,
            capabilities
        );

        expect(result).toEqual({
            status: 'file_too_large',
            limit: 'archive_compressed',
            sizeBytes: file.size,
            maxBytes: 1,
        });
    });

    it('keeps archive path traversal as a structured archive error', async () => {
        const result = await prepareArchive(
            createTestZipFile({ '../escape.txt': 'bad' }),
            DatabaseType.POSTGRESQL
        );

        expect(result).toEqual({
            status: 'invalid',
            code: 'malformed_archive',
            archiveCode: 'ARCHIVE_PATH_TRAVERSAL',
        });
    });

    it('rejects a corrupt archive', async () => {
        const result = await prepareArchive(
            createRawZipFile(new Uint8Array([1, 2, 3, 4])),
            DatabaseType.POSTGRESQL
        );

        expect(result.status).toBe('invalid');

        if (result.status === 'invalid') {
            expect(result.code).toBe('malformed_archive');
        }
    });

    it('returns unable_to_detect when the archive has no project', async () => {
        const result = await prepareArchive(
            createTestZipFile({ 'readme.txt': 'hello' }),
            DatabaseType.POSTGRESQL
        );

        expect(result).toEqual({
            status: 'unsupported',
            code: 'unable_to_detect',
        });
    });

    it('does not treat a zip submitted as a text file as schema text', async () => {
        const file = createTestZipFile({
            'prisma/schema.prisma': FLEXIBLE_PRISMA_SCHEMA,
        });
        const result = await prepareSchemaMergeSource(
            { type: 'text_file', file },
            contextFor(DatabaseType.POSTGRESQL)
        );

        expect(result).toEqual({
            status: 'invalid',
            code: 'archive_input_required',
        });
    });
});
