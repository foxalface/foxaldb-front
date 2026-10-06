import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '@/lib/api/client';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    dbmlSample,
    diagramJsonSample,
    genericAmbiguousSql,
    malformedContent,
    mariadbDistinctiveSql,
    metadataJsonSample,
    mysqlDistinctiveSql,
    oracleDistinctiveSql,
    ordinaryJsonSample,
    postgresDistinctiveSql,
    randomText,
    sqliteDistinctiveSql,
    sqlServerDistinctiveSql,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from '@/lib/upload-capabilities/safety-ceiling';
import { resetUploadCapabilitiesCache } from '@/lib/upload-capabilities/upload-capabilities-store';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';
import type { SchemaMergeCompareRequest } from '../compare-request';
import { prepareSchemaMergeSource } from '../prepare-schema-merge-source';
import {
    SCHEMA_MERGE_SOURCE_KIND_BY_IMPORT_FORMAT,
    SCHEMA_MERGE_SOURCE_KIND_BY_PROJECT_FRAMEWORK,
    SCHEMA_MERGE_SOURCE_KINDS,
} from '../source-kinds';
import type {
    PrepareSchemaMergeSourceContext,
    SchemaMergeSourcePreparationResult,
    SchemaMergeSourceResolution,
} from '../source-adapter-types';
import type { SchemaMergeSourceKind } from '../source-kinds';

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('@/lib/api/client', async () => {
    const actual = (await vi.importActual(
        '@/lib/api/client'
    )) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

const postgresDumpSql = `
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name text
);
`;

const clickHouseSql = `
CREATE TABLE events (
    id UInt64,
    created_at DateTime
) ENGINE = MergeTree ORDER BY id;
`;

const diagramJsonWithTable = JSON.stringify({
    id: 'diagram',
    name: 'Imported',
    databaseType: 'mysql',
    schemaVersion: 1,
    tables: [
        {
            id: '1',
            name: 'users',
            x: 0,
            y: 0,
            fields: [
                {
                    id: '2',
                    name: 'id',
                    type: { id: 'int', name: 'int' },
                    primaryKey: true,
                    unique: true,
                    nullable: false,
                    createdAt: 1,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 1,
        },
    ],
    relationships: [],
});

type Expect<T extends true> = T;

type CompareSourceIsKindOnly = Expect<
    keyof SchemaMergeCompareRequest['source'] extends 'kind' ? true : false
>;

type CompareSourceOmitsCapabilityFields = Expect<
    'viewsSupported' extends keyof SchemaMergeCompareRequest['source']
        ? false
        : true
>;

const compareSourceIsKindOnly: CompareSourceIsKindOnly = true;
const compareSourceOmitsCapabilityFields: CompareSourceOmitsCapabilityFields = true;

const contextFor = (
    databaseType: DatabaseType,
    resolution?: SchemaMergeSourceResolution,
    uploadCapabilities:
        | UploadCapabilities
        | undefined = CONSERVATIVE_UPLOAD_SAFETY_CEILING
): PrepareSchemaMergeSourceContext => ({
    currentDiagram: { databaseType },
    ...(resolution ? { resolution } : {}),
    ...(uploadCapabilities ? { uploadCapabilities } : {}),
});

const prepareText = (
    content: string,
    databaseType: DatabaseType,
    resolution?: SchemaMergeSourceResolution,
    uploadCapabilities?: UploadCapabilities
) =>
    prepareSchemaMergeSource(
        { type: 'text', content },
        contextFor(databaseType, resolution, uploadCapabilities)
    );

const expectReady = (
    result: SchemaMergeSourcePreparationResult,
    kind: SchemaMergeSourceKind
) => {
    expect(result.status).toBe('ready');

    if (result.status !== 'ready') {
        return;
    }

    expect(result.source).toEqual({ kind });
    expect(Object.keys(result.source)).toEqual(['kind']);
    expect(result.incomingDiagram.databaseType).toEqual(expect.any(String));
    expect(Array.isArray(result.incomingDiagram.tables)).toBe(true);
    expect(Array.isArray(result.incomingDiagram.relationships)).toBe(true);
    expect(result).not.toHaveProperty('compareViews');
    expect(result.source).not.toHaveProperty('viewsSupported');
    expect(result.source).not.toHaveProperty('databaseType');

    return result;
};

describe('schema merge source kinds', () => {
    it('maps import formats and project frameworks onto the backend kinds', () => {
        expect(compareSourceIsKindOnly).toBe(true);
        expect(compareSourceOmitsCapabilityFields).toBe(true);
        expect(SCHEMA_MERGE_SOURCE_KINDS).toEqual([
            'sql',
            'postgres_dump',
            'dbml',
            'diagram_json',
            'metadata_json',
            'laravel',
            'prisma',
            'entity_framework_core',
            'rails',
            'django',
            'drizzle',
        ]);
        expect(SCHEMA_MERGE_SOURCE_KIND_BY_IMPORT_FORMAT.postgres_dump).toBe(
            'postgres_dump'
        );
        expect(SCHEMA_MERGE_SOURCE_KIND_BY_IMPORT_FORMAT.dbml).toBe('dbml');
        expect(
            SCHEMA_MERGE_SOURCE_KIND_BY_PROJECT_FRAMEWORK.entity_framework_core
        ).toBe('entity_framework_core');
        expect(
            Object.values(SCHEMA_MERGE_SOURCE_KIND_BY_PROJECT_FRAMEWORK)
        ).not.toContain('ef_core');
    });
});

describe('prepareSchemaMergeSource text', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        resetUploadCapabilitiesCache();
    });

    it('prepares ordinary SQL as source kind sql', async () => {
        const current = {
            databaseType: DatabaseType.POSTGRESQL,
            name: 'Live diagram',
            tables: [{ id: 'keep-me', name: 'existing' }],
        };
        const snapshot = structuredClone(current);
        const result = await prepareSchemaMergeSource(
            { type: 'text', content: postgresDistinctiveSql },
            {
                currentDiagram: current,
                uploadCapabilities: CONSERVATIVE_UPLOAD_SAFETY_CEILING,
            }
        );

        const ready = expectReady(result, 'sql');
        expect(ready?.detectedFormat).toBe('sql');
        expect(ready?.detectedFramework).toBeNull();
        expect(ready?.detectedDatabaseType).toBe(DatabaseType.POSTGRESQL);
        expect(ready?.incomingDiagram.databaseType).toBe(
            DatabaseType.POSTGRESQL
        );
        expect(
            ready?.incomingDiagram.tables?.some(
                (table) => table.name === 'users'
            )
        ).toBe(true);
        expect(current).toEqual(snapshot);
        expect(ready?.incomingDiagram).not.toBe(current);
    });

    it('keeps a PostgreSQL dump distinct from ordinary SQL', async () => {
        const result = await prepareText(
            postgresDumpSql,
            DatabaseType.POSTGRESQL
        );
        const ready = expectReady(result, 'postgres_dump');

        expect(ready?.detectedFormat).toBe('postgres_dump');
        expect(ready?.incomingDiagram.databaseType).toBe(
            DatabaseType.POSTGRESQL
        );
        expect(ready?.source.kind).not.toBe('sql');
    });

    it('prepares DBML without collapsing it to sql', async () => {
        const result = await prepareText(dbmlSample, DatabaseType.MYSQL);
        const ready = expectReady(result, 'dbml');

        expect(ready?.detectedFormat).toBe('dbml');
        expect(ready?.incomingDiagram.databaseType).toBe(DatabaseType.MYSQL);
        expect(
            ready?.incomingDiagram.tables?.some(
                (table) => table.name === 'users'
            )
        ).toBe(true);
    });

    it('prepares diagram JSON through its dedicated importer', async () => {
        const result = await prepareText(
            diagramJsonWithTable,
            DatabaseType.MARIADB
        );
        const ready = expectReady(result, 'diagram_json');

        expect(ready?.detectedFormat).toBe('diagram_json');
        expect(ready?.incomingDiagram.databaseType).toBe(DatabaseType.MYSQL);
        expect(ready?.incomingDiagram.id).not.toBe('diagram');
        expect(
            ready?.incomingDiagram.tables?.some(
                (table) => table.name === 'users'
            )
        ).toBe(true);
        expect(ready?.incomingDiagram).not.toHaveProperty('schemaVersion');
    });

    it('prepares a diagram JSON sample that importSchema does not accept', async () => {
        const result = await prepareText(
            diagramJsonSample,
            DatabaseType.POSTGRESQL
        );

        expectReady(result, 'diagram_json');
    });

    it('prepares metadata JSON as a normalized diagram', async () => {
        const result = await prepareText(
            metadataJsonSample,
            DatabaseType.SQLITE
        );
        const ready = expectReady(result, 'metadata_json');

        expect(ready?.detectedFormat).toBe('metadata_json');
        expect(ready?.incomingDiagram.databaseType).toBe(DatabaseType.SQLITE);
        expect(ready?.incomingDiagram.tables).toEqual([]);
        expect(ready?.incomingDiagram.relationships).toEqual([]);
    });

    it('asks for an explicit SQL dialect when detection is ambiguous', async () => {
        const competingSql = `
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    legacy_id INT AUTO_INCREMENT,
    payload JSONB
);
`;
        const unresolved = await prepareText(
            competingSql,
            DatabaseType.POSTGRESQL
        );

        expect(unresolved.status).toBe('needs_dialect_resolution');

        if (unresolved.status !== 'needs_dialect_resolution') {
            return;
        }

        expect(unresolved.analysis.dialectCandidates).toEqual(
            expect.arrayContaining([
                DatabaseType.POSTGRESQL,
                DatabaseType.MYSQL,
            ])
        );

        const resolved = await prepareText(
            competingSql,
            DatabaseType.POSTGRESQL,
            { sourceDialect: DatabaseType.POSTGRESQL }
        );
        const ready = expectReady(resolved, 'sql');
        expect(ready?.incomingDiagram.databaseType).toBe(
            DatabaseType.POSTGRESQL
        );

        const rejected = await prepareText(
            competingSql,
            DatabaseType.POSTGRESQL,
            { sourceDialect: DatabaseType.MYSQL }
        );

        expect(rejected).toEqual({
            status: 'database_type_mismatch',
            sourceKind: 'sql',
            currentDatabaseType: DatabaseType.POSTGRESQL,
            detectedDatabaseType: DatabaseType.MYSQL,
        });
    });

    it('does not keep dialect resolution in module state', async () => {
        await prepareText(genericAmbiguousSql, DatabaseType.POSTGRESQL);

        const result = await prepareText(
            postgresDistinctiveSql,
            DatabaseType.POSTGRESQL
        );

        expectReady(result, 'sql');
    });

    it('rejects an explicit dialect that was not a candidate', async () => {
        const result = await prepareText(
            genericAmbiguousSql,
            DatabaseType.POSTGRESQL,
            { sourceDialect: DatabaseType.ORACLE }
        );

        expect(result).toEqual({
            status: 'invalid',
            code: 'invalid_dialect_resolution',
        });
    });

    it('returns unable_to_detect for unstructured text', async () => {
        await expect(
            prepareText(randomText, DatabaseType.POSTGRESQL)
        ).resolves.toEqual({
            status: 'unsupported',
            code: 'unable_to_detect',
        });
    });

    it('returns a structured error for malformed JSON and SQL', async () => {
        await expect(
            prepareText(ordinaryJsonSample, DatabaseType.POSTGRESQL)
        ).resolves.toEqual({
            status: 'invalid',
            code: 'malformed_source',
        });

        await expect(
            prepareText(malformedContent, DatabaseType.POSTGRESQL)
        ).resolves.toEqual({
            status: 'unsupported',
            code: 'unable_to_detect',
        });

        await expect(
            prepareText('{ "broken": }', DatabaseType.POSTGRESQL)
        ).resolves.toEqual({
            status: 'invalid',
            code: 'malformed_source',
        });

        await expect(
            prepareText('Table users {\n  id int [pk]', DatabaseType.POSTGRESQL)
        ).resolves.toEqual({
            status: 'invalid',
            code: 'malformed_source',
        });
    });

    it('rejects ClickHouse SQL that has no DDL importer', async () => {
        await expect(
            prepareText(clickHouseSql, DatabaseType.CLICKHOUSE)
        ).resolves.toEqual({
            status: 'unsupported',
            code: 'unsupported_source',
        });
    });

    it('returns empty_content for blank input', async () => {
        await expect(
            prepareText('   ', DatabaseType.POSTGRESQL)
        ).resolves.toEqual({
            status: 'invalid',
            code: 'empty_content',
        });
    });

    it('rejects an oversized text file with the supplied text limit', async () => {
        const capabilities = structuredClone(
            CONSERVATIVE_UPLOAD_SAFETY_CEILING
        );
        capabilities.schema.textMaxBytes = 8;
        const file = new File([mysqlDistinctiveSql], 'schema.sql', {
            type: 'text/plain',
        });
        const result = await prepareSchemaMergeSource(
            { type: 'text_file', file },
            contextFor(DatabaseType.MYSQL, undefined, capabilities)
        );

        expect(result).toEqual({
            status: 'file_too_large',
            limit: 'text',
            sizeBytes: file.size,
            maxBytes: 8,
        });
    });

    it('reads an ordinary text file through the same SQL path', async () => {
        const file = new File([mysqlDistinctiveSql], 'schema.sql', {
            type: 'text/plain',
        });
        const result = await prepareSchemaMergeSource(
            { type: 'text_file', file },
            contextFor(DatabaseType.MYSQL)
        );

        expectReady(result, 'sql');
    });

    it('rejects a text file whose extension is not an import extension', async () => {
        const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
        const result = await prepareSchemaMergeSource(
            { type: 'text_file', file },
            contextFor(DatabaseType.MYSQL)
        );

        expect(result).toEqual({
            status: 'unsupported',
            code: 'unsupported_file_extension',
        });
    });

    it('uses fetched limits when capabilities are not injected', async () => {
        const fetched = structuredClone(CONSERVATIVE_UPLOAD_SAFETY_CEILING);
        fetched.schema.textMaxBytes = 16;
        apiRequestMock.mockResolvedValueOnce(fetched);

        const result = await prepareSchemaMergeSource(
            { type: 'text', content: mysqlDistinctiveSql },
            { currentDiagram: { databaseType: DatabaseType.MYSQL } }
        );

        expect(result).toMatchObject({
            status: 'file_too_large',
            limit: 'text',
            maxBytes: 16,
        });
    });

    it('uses the conservative safety ceiling when capability loading fails', async () => {
        apiRequestMock.mockRejectedValue(new Error('offline'));

        const accepted = await prepareSchemaMergeSource(
            { type: 'text', content: postgresDistinctiveSql },
            { currentDiagram: { databaseType: DatabaseType.POSTGRESQL } }
        );
        expectReady(accepted, 'sql');

        const oversized = 'a'.repeat(
            CONSERVATIVE_UPLOAD_SAFETY_CEILING.schema.textMaxBytes + 1
        );
        const rejected = await prepareSchemaMergeSource(
            { type: 'text', content: oversized },
            { currentDiagram: { databaseType: DatabaseType.POSTGRESQL } }
        );

        expect(rejected).toEqual({
            status: 'file_too_large',
            limit: 'text',
            sizeBytes: oversized.length,
            maxBytes: CONSERVATIVE_UPLOAD_SAFETY_CEILING.schema.textMaxBytes,
        });
    });
});

describe('prepareSchemaMergeSource database compatibility', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        resetUploadCapabilitiesCache();
    });

    it('allows the same database type', async () => {
        const result = await prepareText(
            oracleDistinctiveSql,
            DatabaseType.ORACLE
        );

        const ready = expectReady(result, 'sql');
        expect(ready?.incomingDiagram.databaseType).toBe(DatabaseType.ORACLE);
    });

    it('allows MySQL and MariaDB without rewriting the detected dialect', async () => {
        const unresolved = await prepareText(
            mysqlDistinctiveSql,
            DatabaseType.MARIADB
        );

        expect(unresolved.status).toBe('needs_dialect_resolution');

        const result = await prepareText(
            mysqlDistinctiveSql,
            DatabaseType.MARIADB,
            { sourceDialect: DatabaseType.MYSQL }
        );
        const ready = expectReady(result, 'sql');

        expect(ready?.incomingDiagram.databaseType).toBe(DatabaseType.MYSQL);
        expect(ready?.detectedDatabaseType).toBe(DatabaseType.MYSQL);
    });

    it('allows PostgreSQL and CockroachDB for ordinary SQL', async () => {
        const unresolved = await prepareText(
            postgresDistinctiveSql,
            DatabaseType.COCKROACHDB
        );

        expect(unresolved.status).toBe('needs_dialect_resolution');

        const result = await prepareText(
            postgresDistinctiveSql,
            DatabaseType.COCKROACHDB,
            { sourceDialect: DatabaseType.POSTGRESQL }
        );
        const ready = expectReady(result, 'sql');

        expect(ready?.incomingDiagram.databaseType).toBe(
            DatabaseType.POSTGRESQL
        );
    });

    it('allows a PostgreSQL dump into CockroachDB without changing its type', async () => {
        const result = await prepareText(
            postgresDumpSql,
            DatabaseType.COCKROACHDB
        );
        const ready = expectReady(result, 'postgres_dump');

        expect(ready?.incomingDiagram.databaseType).toBe(
            DatabaseType.POSTGRESQL
        );
    });

    it('blocks a PostgreSQL dump against MySQL', async () => {
        const result = await prepareText(postgresDumpSql, DatabaseType.MYSQL);

        expect(result).toEqual({
            status: 'database_type_mismatch',
            sourceKind: 'postgres_dump',
            currentDatabaseType: DatabaseType.MYSQL,
            detectedDatabaseType: DatabaseType.POSTGRESQL,
        });
    });

    it('blocks MySQL against PostgreSQL', async () => {
        const result = await prepareText(
            mysqlDistinctiveSql,
            DatabaseType.POSTGRESQL
        );

        expect(result).toEqual({
            status: 'database_type_mismatch',
            sourceKind: 'sql',
            currentDatabaseType: DatabaseType.POSTGRESQL,
            detectedDatabaseType: DatabaseType.MYSQL,
        });
    });

    it('blocks SQLite against SQL Server', async () => {
        const result = await prepareText(
            sqliteDistinctiveSql,
            DatabaseType.SQL_SERVER
        );

        expect(result).toEqual({
            status: 'database_type_mismatch',
            sourceKind: 'sql',
            currentDatabaseType: DatabaseType.SQL_SERVER,
            detectedDatabaseType: DatabaseType.SQLITE,
        });
    });

    it('blocks SQL Server against SQLite', async () => {
        const result = await prepareText(
            sqlServerDistinctiveSql,
            DatabaseType.SQLITE
        );

        expect(result).toMatchObject({
            status: 'database_type_mismatch',
            sourceKind: 'sql',
            currentDatabaseType: DatabaseType.SQLITE,
            detectedDatabaseType: DatabaseType.SQL_SERVER,
        });
    });

    it('blocks MariaDB SQL against PostgreSQL', async () => {
        const result = await prepareText(
            mariadbDistinctiveSql,
            DatabaseType.POSTGRESQL
        );

        expect(result).toMatchObject({
            status: 'database_type_mismatch',
            detectedDatabaseType: DatabaseType.MARIADB,
        });
    });

    it('blocks a diagram JSON type outside the current family', async () => {
        const result = await prepareText(
            diagramJsonWithTable,
            DatabaseType.POSTGRESQL
        );

        expect(result).toEqual({
            status: 'database_type_mismatch',
            sourceKind: 'diagram_json',
            currentDatabaseType: DatabaseType.POSTGRESQL,
            detectedDatabaseType: DatabaseType.MYSQL,
        });
    });

    it('does not treat generic as a family partner of MySQL', async () => {
        const result = await prepareText(
            mysqlDistinctiveSql,
            DatabaseType.GENERIC
        );

        expect(result).toMatchObject({
            status: 'database_type_mismatch',
            currentDatabaseType: DatabaseType.GENERIC,
            detectedDatabaseType: DatabaseType.MYSQL,
        });
    });
});
