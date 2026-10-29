import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '@/lib/api/client';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    cockroachDistinctiveSql,
    mysqlDistinctiveSql,
    oracleDistinctiveSql,
    postgresDistinctiveSql,
    sqlServerDistinctiveSql,
    sqliteDistinctiveSql,
} from '@/lib/import/__tests__/fixtures/import-samples';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from '@/lib/upload-capabilities/safety-ceiling';
import { resetUploadCapabilitiesCache } from '@/lib/upload-capabilities/upload-capabilities-store';
import { prepareSchemaMergeSource } from '../prepare-schema-merge-source';
import type { SchemaMergeSourcePreparationResult } from '../source-adapter-types';

vi.mock('@/lib/api/client', async () => {
    const actual = (await vi.importActual(
        '@/lib/api/client'
    )) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: vi.fn(),
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

const prepare = (content: string, databaseType: DatabaseType) =>
    prepareSchemaMergeSource(
        { type: 'text', content },
        {
            currentDiagram: { databaseType },
            uploadCapabilities: CONSERVATIVE_UPLOAD_SAFETY_CEILING,
        }
    );

const expectSqlUsers = async (
    content: string,
    databaseType: DatabaseType
): Promise<void> => {
    const result = await prepare(content, databaseType);

    expect(result.status).toBe('ready');

    if (result.status !== 'ready') {
        return;
    }

    expect(result.source).toEqual({ kind: 'sql' });
    expect(result.source).not.toHaveProperty('viewsCompared');
    expect(result.incomingDiagram.databaseType).toBe(databaseType);
    expect(
        result.incomingDiagram.tables?.some((table) => table.name === 'users')
    ).toBe(true);
};

describe('B4 representative merge dialects', () => {
    beforeEach(() => {
        resetUploadCapabilitiesCache();
    });

    it('prepares PostgreSQL SQL', async () => {
        await expectSqlUsers(postgresDistinctiveSql, DatabaseType.POSTGRESQL);
    });

    it('prepares MySQL SQL', async () => {
        await expectSqlUsers(mysqlDistinctiveSql, DatabaseType.MYSQL);
    });

    it('prepares SQLite SQL', async () => {
        await expectSqlUsers(sqliteDistinctiveSql, DatabaseType.SQLITE);
    });

    it('prepares SQL Server SQL', async () => {
        await expectSqlUsers(sqlServerDistinctiveSql, DatabaseType.SQL_SERVER);
    });

    it('prepares Oracle SQL', async () => {
        await expectSqlUsers(oracleDistinctiveSql, DatabaseType.ORACLE);
    });

    it('keeps a PostgreSQL dump distinct and does not ask the client to compare views', async () => {
        const result = await prepare(postgresDumpSql, DatabaseType.POSTGRESQL);

        expect(result.status).toBe('ready');

        if (result.status !== 'ready') {
            return;
        }

        expect(result.source).toEqual({ kind: 'postgres_dump' });
        expect(result.detectedFormat).toBe('postgres_dump');
        expect(
            result.incomingDiagram.tables?.some(
                (table) => table.name === 'users'
            )
        ).toBe(true);
    });

    it('rejects ClickHouse SQL merge input', async () => {
        await expect(
            prepare(clickHouseSql, DatabaseType.CLICKHOUSE)
        ).resolves.toEqual({
            status: 'unsupported',
            code: 'unsupported_source',
        });
    });

    it('keeps MySQL with MariaDB and rejects MySQL with PostgreSQL', async () => {
        const family = await prepareSchemaMergeSource(
            { type: 'text', content: mysqlDistinctiveSql },
            {
                currentDiagram: { databaseType: DatabaseType.MARIADB },
                resolution: { sourceDialect: DatabaseType.MYSQL },
                uploadCapabilities: CONSERVATIVE_UPLOAD_SAFETY_CEILING,
            }
        );
        expect(family.status).toBe('ready');

        if (family.status === 'ready') {
            expect(family.incomingDiagram.databaseType).toBe(
                DatabaseType.MYSQL
            );
            expect(family.source).toEqual({ kind: 'sql' });
        }

        const rejected = await prepare(
            postgresDistinctiveSql,
            DatabaseType.MYSQL
        );
        expect(rejected).toEqual({
            status: 'database_type_mismatch',
            sourceKind: 'sql',
            currentDatabaseType: DatabaseType.MYSQL,
            detectedDatabaseType: DatabaseType.POSTGRESQL,
        });
    });

    it('allows CockroachDB to receive PostgreSQL SQL', async () => {
        const result: SchemaMergeSourcePreparationResult = await prepare(
            cockroachDistinctiveSql,
            DatabaseType.COCKROACHDB
        );

        if (result.status === 'needs_dialect_resolution') {
            const resolved = await prepareSchemaMergeSource(
                { type: 'text', content: cockroachDistinctiveSql },
                {
                    currentDiagram: { databaseType: DatabaseType.COCKROACHDB },
                    resolution: { sourceDialect: DatabaseType.POSTGRESQL },
                    uploadCapabilities: CONSERVATIVE_UPLOAD_SAFETY_CEILING,
                }
            );
            expect(resolved.status).toBe('ready');
            return;
        }

        expect(result.status).toBe('ready');
    });
});
