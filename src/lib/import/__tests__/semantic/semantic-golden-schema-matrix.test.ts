import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    findSemanticTable,
    semanticFromSqlFixture,
} from './semantic-golden-helpers';

const noDefaultSchema = (schema: string | null | undefined) =>
    schema === '' || schema === undefined || schema === null;

describe('M11.2 default schema matrix', () => {
    it('PostgreSQL uses public for unqualified tables', async () => {
        const semantic = await semanticFromSqlFixture(
            'postgres-baseline.sql',
            DatabaseType.POSTGRESQL
        );
        expect(findSemanticTable(semantic, 'users', 'public')).toBeDefined();
        expect(findSemanticTable(semantic, 'users', 'audit')).toBeDefined();
    });

    it('CockroachDB uses public for unqualified tables', async () => {
        const semantic = await semanticFromSqlFixture(
            'cockroachdb-baseline.sql',
            DatabaseType.COCKROACHDB
        );
        expect(findSemanticTable(semantic, 'users', 'public')).toBeDefined();
    });

    it('SQL Server uses dbo', async () => {
        const semantic = await semanticFromSqlFixture(
            'sqlserver-baseline.sql',
            DatabaseType.SQL_SERVER
        );
        expect(findSemanticTable(semantic, 'users', 'dbo')).toBeDefined();
    });

    it('MySQL omits default schema (empty/undefined)', async () => {
        const semantic = await semanticFromSqlFixture(
            'mysql-baseline.sql',
            DatabaseType.MYSQL
        );
        expect(
            noDefaultSchema(findSemanticTable(semantic, 'users')?.schema)
        ).toBe(true);
    });

    it('MariaDB omits default schema (empty/undefined)', async () => {
        const semantic = await semanticFromSqlFixture(
            'mariadb-baseline.sql',
            DatabaseType.MARIADB
        );
        expect(
            noDefaultSchema(findSemanticTable(semantic, 'users')?.schema)
        ).toBe(true);
    });

    it('SQLite omits schema', async () => {
        const semantic = await semanticFromSqlFixture(
            'sqlite-baseline.sql',
            DatabaseType.SQLITE
        );
        expect(
            noDefaultSchema(findSemanticTable(semantic, 'users')?.schema)
        ).toBe(true);
    });

    it('Oracle baseline tables have no FoxalDB schema segment', async () => {
        const semantic = await semanticFromSqlFixture(
            'oracle-baseline.sql',
            DatabaseType.ORACLE
        );
        expect(
            noDefaultSchema(findSemanticTable(semantic, 'employees')?.schema)
        ).toBe(true);
    });
});
