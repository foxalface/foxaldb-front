import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { DatabaseEdition } from '@/lib/domain/database-edition';
import { DatabaseClient } from '@/lib/domain/database-clients';
import {
    getMetadataQuery,
    supportsMetadataImport,
} from '../get-metadata-query';

describe('getMetadataQuery', () => {
    it('returns PostgreSQL metadata query by default', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.POSTGRESQL,
        });

        expect(query).toContain('metadata_json_to_import');
        expect(query).not.toContain("'auth', 'extensions'");
    });

    it('returns Supabase-specific PostgreSQL filters', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.POSTGRESQL,
            databaseEdition: DatabaseEdition.POSTGRESQL_SUPABASE,
        });

        expect(query).toContain("'auth', 'extensions'");
    });

    it('returns MySQL metadata query by default', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.MYSQL,
        });

        expect(query).toContain('fk_info');
    });

    it('returns MySQL 5.7 metadata query variant', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.MYSQL,
            databaseEdition: DatabaseEdition.MYSQL_5_7,
        });

        expect(query).toContain('group_concat_max_len');
    });

    it('returns SQL Server metadata query by default', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.SQL_SERVER,
        });

        expect(query).toContain('metadata_json_to_import');
    });

    it('returns SQL Server 2016 metadata query variant', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.SQL_SERVER,
            databaseEdition: DatabaseEdition.SQL_SERVER_2016_AND_BELOW,
        });

        expect(query).toContain('FOR XML PATH');
    });

    it('returns SQLite metadata query', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.SQLITE,
        });

        expect(query).toContain('sqlite_master');
    });

    it('returns Cloudflare D1 SQLite metadata query variant', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.SQLITE,
            databaseEdition: DatabaseEdition.SQLITE_CLOUDFLARE_D1,
        });

        expect(query).toContain('Cloudflare D1 SQLite');
    });

    it('returns Oracle metadata query', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.ORACLE,
        });

        expect(query).toContain('all_tab_columns');
    });

    it('returns CockroachDB metadata query', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.COCKROACHDB,
        });

        expect(query).toContain('crdb_internal');
    });

    it('returns ClickHouse metadata query', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.CLICKHOUSE,
        });

        expect(query).toContain('system.columns');
    });

    it('wraps PostgreSQL query for PSQL client', () => {
        const query = getMetadataQuery({
            databaseType: DatabaseType.POSTGRESQL,
            databaseClient: DatabaseClient.POSTGRESQL_PSQL,
        });

        expect(query).toContain('psql');
    });

    it('does not support generic database metadata import', () => {
        expect(supportsMetadataImport(DatabaseType.GENERIC)).toBe(false);
        expect(supportsMetadataImport(DatabaseType.POSTGRESQL)).toBe(true);
    });
});
