import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { DDL_IMPORT_SUPPORTED_TYPES } from '../sql-evidence';
import { supportsMetadataImport } from '@/dialogs/create-diagram-dialog/import-from-database/get-metadata-query';
import { importMetadataScripts } from '@/lib/data/import-metadata/scripts/scripts';

const PRIMARY_DBMSES = [
    DatabaseType.POSTGRESQL,
    DatabaseType.MYSQL,
    DatabaseType.MARIADB,
    DatabaseType.SQLITE,
    DatabaseType.SQL_SERVER,
    DatabaseType.ORACLE,
    DatabaseType.COCKROACHDB,
    DatabaseType.CLICKHOUSE,
] as const;

describe('DBMS capability matrix (v1)', () => {
    it.each(PRIMARY_DBMSES)('%s is selectable for new diagrams', (dbms) => {
        expect(Object.values(DatabaseType)).toContain(dbms);
    });

    it.each([
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
        DatabaseType.SQL_SERVER,
        DatabaseType.ORACLE,
        DatabaseType.COCKROACHDB,
    ])('%s supports SQL DDL import', (dbms) => {
        expect(DDL_IMPORT_SUPPORTED_TYPES.has(dbms)).toBe(true);
    });

    it('ClickHouse does not support SQL DDL import', () => {
        expect(DDL_IMPORT_SUPPORTED_TYPES.has(DatabaseType.CLICKHOUSE)).toBe(
            false
        );
    });

    it.each([
        DatabaseType.POSTGRESQL,
        DatabaseType.MYSQL,
        DatabaseType.MARIADB,
        DatabaseType.SQLITE,
        DatabaseType.SQL_SERVER,
        DatabaseType.ORACLE,
        DatabaseType.COCKROACHDB,
        DatabaseType.CLICKHOUSE,
    ])('%s has a metadata extraction script', (dbms) => {
        expect(importMetadataScripts[dbms]).toBeDefined();
        expect(supportsMetadataImport(dbms)).toBe(true);
    });

    it('Generic has no metadata extraction script', () => {
        expect(supportsMetadataImport(DatabaseType.GENERIC)).toBe(false);
    });
});
