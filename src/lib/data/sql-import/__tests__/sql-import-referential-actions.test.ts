import { describe, expect, it } from 'vitest';
import { convertToChartDBDiagram, type SQLParserResult } from '../common';
import { fromPostgres } from '../dialect-importers/postgresql/postgresql';
import { fromPostgresDump } from '../dialect-importers/postgresql/postgresql-dump';
import { fromMySQL } from '../dialect-importers/mysql/mysql';
import { fromSQLite } from '../dialect-importers/sqlite/sqlite';
import { fromSQLServer } from '../dialect-importers/sqlserver/sqlserver';
import { DatabaseType } from '@/lib/domain/database-type';

describe('SQL import referential actions', () => {
    it('maps SQLForeignKey deleteAction and updateAction in convertToChartDBDiagram', () => {
        const sourceTableId = 'source-table-id';
        const targetTableId = 'target-table-id';

        const parserResult: SQLParserResult = {
            tables: [
                {
                    id: targetTableId,
                    name: 'users',
                    schema: 'public',
                    columns: [
                        {
                            name: 'user_id',
                            type: 'int',
                            nullable: false,
                            primaryKey: true,
                            unique: true,
                        },
                    ],
                    indexes: [],
                },
                {
                    id: sourceTableId,
                    name: 'playlists',
                    schema: 'public',
                    columns: [
                        {
                            name: 'playlist_id',
                            type: 'int',
                            nullable: false,
                            primaryKey: true,
                            unique: true,
                        },
                        {
                            name: 'user_id',
                            type: 'int',
                            nullable: true,
                            primaryKey: false,
                            unique: false,
                        },
                    ],
                    indexes: [],
                },
            ],
            relationships: [
                {
                    name: 'fk_playlists_user_id',
                    sourceTable: 'playlists',
                    sourceSchema: 'public',
                    sourceColumn: 'user_id',
                    targetTable: 'users',
                    targetSchema: 'public',
                    targetColumn: 'user_id',
                    sourceTableId,
                    targetTableId,
                    deleteAction: 'SET NULL',
                    updateAction: 'RESTRICT',
                },
            ],
        };

        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('set_null');
        expect(diagram.relationships?.[0]?.onUpdate).toBe('restrict');
    });

    it('preserves ON DELETE CASCADE from PostgreSQL dump import', async () => {
        const sql = `
            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY
            );

            CREATE TABLE playlists (
                playlist_id SERIAL PRIMARY KEY,
                user_id INT NOT NULL
            );

            ALTER TABLE ONLY playlists ADD CONSTRAINT fk_playlists_user_id
                FOREIGN KEY (user_id) REFERENCES users(user_id)
                ON DELETE CASCADE;
        `;

        const parserResult = await fromPostgresDump(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        expect(parserResult.relationships[0]?.deleteAction).toBe('CASCADE');
        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('cascade');
    });

    it('preserves ON DELETE SET NULL from PostgreSQL dump import', async () => {
        const sql = `
            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY
            );

            CREATE TABLE playlists (
                playlist_id SERIAL PRIMARY KEY,
                user_id INT
            );

            ALTER TABLE ONLY playlists ADD CONSTRAINT fk_playlists_user_id
                FOREIGN KEY (user_id) REFERENCES users(user_id)
                ON DELETE SET NULL;
        `;

        const parserResult = await fromPostgresDump(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        expect(parserResult.relationships[0]?.deleteAction).toBe('SET NULL');
        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('set_null');
    });

    it('preserves ON UPDATE RESTRICT when SQLForeignKey includes updateAction', () => {
        const sourceTableId = 'source-table-id';
        const targetTableId = 'target-table-id';

        const parserResult: SQLParserResult = {
            tables: [
                {
                    id: targetTableId,
                    name: 'users',
                    columns: [
                        {
                            name: 'user_id',
                            type: 'int',
                            nullable: false,
                            primaryKey: true,
                            unique: true,
                        },
                    ],
                    indexes: [],
                },
                {
                    id: sourceTableId,
                    name: 'playlists',
                    columns: [
                        {
                            name: 'playlist_id',
                            type: 'int',
                            nullable: false,
                            primaryKey: true,
                            unique: true,
                        },
                        {
                            name: 'user_id',
                            type: 'int',
                            nullable: false,
                            primaryKey: false,
                            unique: false,
                        },
                    ],
                    indexes: [],
                },
            ],
            relationships: [
                {
                    name: 'fk_playlists_user_id',
                    sourceTable: 'playlists',
                    sourceColumn: 'user_id',
                    targetTable: 'users',
                    targetColumn: 'user_id',
                    sourceTableId,
                    targetTableId,
                    updateAction: 'RESTRICT',
                },
            ],
        };

        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.MYSQL,
            DatabaseType.MYSQL
        );

        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onUpdate).toBe('restrict');
    });

    it('preserves ON DELETE CASCADE and ON UPDATE RESTRICT from PostgreSQL ALTER TABLE import', async () => {
        const sql = `
CREATE TABLE users (
    id BIGINT PRIMARY KEY
);

CREATE TABLE playlists (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL
);

ALTER TABLE playlists
ADD CONSTRAINT fk_playlists_user_id
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
ON UPDATE RESTRICT;
        `;

        const parserResult = await fromPostgres(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        expect(parserResult.relationships).toHaveLength(1);
        expect(parserResult.relationships[0]?.deleteAction).toBe('CASCADE');
        expect(parserResult.relationships[0]?.updateAction).toBe('RESTRICT');
        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('cascade');
        expect(diagram.relationships?.[0]?.onUpdate).toBe('restrict');
    });

    it('preserves ON DELETE CASCADE and ON UPDATE RESTRICT from MySQL CREATE TABLE import', async () => {
        const sql = `
CREATE TABLE users (
    id BIGINT PRIMARY KEY
);

CREATE TABLE playlists (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_playlists_user_id FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
) ENGINE=InnoDB;
        `;

        const parserResult = await fromMySQL(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.MYSQL,
            DatabaseType.MYSQL
        );

        expect(parserResult.relationships).toHaveLength(1);
        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('cascade');
        expect(diagram.relationships?.[0]?.onUpdate).toBe('restrict');
    });

    it('preserves ON DELETE SET NULL and ON UPDATE CASCADE from PostgreSQL dump import', async () => {
        const sql = `
            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY
            );

            CREATE TABLE playlists (
                playlist_id SERIAL PRIMARY KEY,
                user_id INT
            );

            ALTER TABLE ONLY playlists ADD CONSTRAINT fk_playlists_user_id
                FOREIGN KEY (user_id) REFERENCES users(user_id)
                ON DELETE SET NULL
                ON UPDATE CASCADE;
        `;

        const parserResult = await fromPostgresDump(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        expect(parserResult.relationships[0]?.deleteAction).toBe('SET NULL');
        expect(parserResult.relationships[0]?.updateAction).toBe('CASCADE');
        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('set_null');
        expect(diagram.relationships?.[0]?.onUpdate).toBe('cascade');
    });

    it('preserves ON DELETE CASCADE and ON UPDATE RESTRICT from SQLite CREATE TABLE import', async () => {
        const sql = `
CREATE TABLE users (
    id INTEGER PRIMARY KEY
);

CREATE TABLE playlists (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);
        `;

        const parserResult = await fromSQLite(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.SQLITE,
            DatabaseType.SQLITE
        );

        expect(parserResult.relationships.length).toBeGreaterThanOrEqual(1);
        expect(diagram.relationships?.length).toBeGreaterThanOrEqual(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('cascade');
        expect(diagram.relationships?.[0]?.onUpdate).toBe('restrict');
    });

    it('preserves ON DELETE CASCADE and ON UPDATE RESTRICT from SQL Server ALTER TABLE import', async () => {
        const sql = `
CREATE TABLE users (
    id INT PRIMARY KEY
);

CREATE TABLE playlists (
    id INT PRIMARY KEY,
    user_id INT NOT NULL
);

ALTER TABLE playlists ADD CONSTRAINT fk_playlists_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT;
        `;

        const parserResult = await fromSQLServer(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.SQL_SERVER,
            DatabaseType.SQL_SERVER
        );

        expect(parserResult.relationships.length).toBeGreaterThanOrEqual(1);
        expect(diagram.relationships?.length).toBeGreaterThanOrEqual(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('cascade');
        expect(diagram.relationships?.[0]?.onUpdate).toBe('restrict');
    });

    it('supplements missing updateAction from sourceSql in convertToChartDBDiagram', () => {
        const sourceTableId = 'source-table-id';
        const targetTableId = 'target-table-id';

        const parserResult: SQLParserResult = {
            tables: [
                {
                    id: targetTableId,
                    name: 'users',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            nullable: false,
                            primaryKey: true,
                            unique: true,
                        },
                    ],
                    indexes: [],
                },
                {
                    id: sourceTableId,
                    name: 'playlists',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            nullable: false,
                            primaryKey: true,
                            unique: true,
                        },
                        {
                            name: 'user_id',
                            type: 'int',
                            nullable: false,
                            primaryKey: false,
                            unique: false,
                        },
                    ],
                    indexes: [],
                },
            ],
            relationships: [
                {
                    name: 'fk_playlists_user_id',
                    sourceTable: 'playlists',
                    sourceColumn: 'user_id',
                    targetTable: 'users',
                    targetColumn: 'id',
                    sourceTableId,
                    targetTableId,
                    deleteAction: 'CASCADE',
                    sourceSql:
                        'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT',
                },
            ],
        };

        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.MYSQL,
            DatabaseType.MYSQL
        );

        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('cascade');
        expect(diagram.relationships?.[0]?.onUpdate).toBe('restrict');
    });

    it('omits unsupported referential actions on imported relationships', async () => {
        const sql = `
            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY
            );

            CREATE TABLE playlists (
                playlist_id SERIAL PRIMARY KEY,
                user_id INT NOT NULL
            );

            ALTER TABLE ONLY playlists ADD CONSTRAINT fk_playlists_user_id
                FOREIGN KEY (user_id) REFERENCES users(user_id)
                ON DELETE SET DEFAULT;
        `;

        const parserResult = await fromPostgresDump(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        expect(parserResult.relationships[0]?.deleteAction).toBe('SET DEFAULT');
        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBeUndefined();
        expect(diagram.relationships?.[0]?.onUpdate).toBeUndefined();
    });
});
