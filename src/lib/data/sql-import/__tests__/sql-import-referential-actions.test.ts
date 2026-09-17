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
                    order: 0,
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
                    order: 0,
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
                    order: 0,
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
                    order: 0,
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
                    order: 0,
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
                    order: 0,
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

    it('keeps sibling PostgreSQL CREATE TABLE FK actions independent', async () => {
        const sql = `
CREATE TABLE organizations (
    id BIGINT PRIMARY KEY
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY
);

CREATE TABLE categories (
    id BIGINT PRIMARY KEY
);

CREATE TABLE projects (
    id BIGINT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    owner_id BIGINT,
    category_id BIGINT,
    name TEXT NOT NULL,
    CONSTRAINT projects_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT projects_owner_id_fk
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT projects_category_id_fk
        FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT projects_org_name_unique
        UNIQUE (organization_id, name)
);
        `;

        const parserResult = await fromPostgres(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        const projects = diagram.tables?.find(
            (table) => table.name === 'projects'
        );
        const orgRel = diagram.relationships?.find(
            (relationship) =>
                relationship.targetFieldId ===
                projects?.fields.find(
                    (field) => field.name === 'organization_id'
                )?.id
        );
        const ownerRel = diagram.relationships?.find(
            (relationship) =>
                relationship.targetFieldId ===
                projects?.fields.find((field) => field.name === 'owner_id')?.id
        );
        const categoryRel = diagram.relationships?.find(
            (relationship) =>
                relationship.targetFieldId ===
                projects?.fields.find((field) => field.name === 'category_id')
                    ?.id
        );

        expect(orgRel?.onDelete).toBe('cascade');
        expect(orgRel?.onUpdate).toBeUndefined();
        expect(ownerRel?.onDelete).toBe('set_null');
        expect(ownerRel?.onUpdate).toBeUndefined();
        expect(categoryRel?.onDelete).toBeUndefined();
        expect(categoryRel?.onUpdate).toBeUndefined();

        const uniqueIndex = projects?.indexes.find(
            (index) => index.name === 'projects_org_name_unique'
        );
        const organizationId = projects?.fields.find(
            (field) => field.name === 'organization_id'
        );
        const nameField = projects?.fields.find(
            (field) => field.name === 'name'
        );

        expect(uniqueIndex?.unique).toBe(true);
        expect(uniqueIndex?.fieldIds).toEqual([
            organizationId?.id,
            nameField?.id,
        ]);
        expect(organizationId?.unique).toBe(false);
        expect(nameField?.unique).toBe(false);
    });

    it('maps PostgreSQL CREATE TABLE ON DELETE RESTRICT and ON UPDATE CASCADE independently', async () => {
        const sql = `
CREATE TABLE users (
    id BIGINT PRIMARY KEY
);

CREATE TABLE playlists (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_playlists_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
        `;

        const diagram = convertToChartDBDiagram(
            await fromPostgres(sql),
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('restrict');
        expect(diagram.relationships?.[0]?.onUpdate).toBe('cascade');
    });

    it('omits PostgreSQL CREATE TABLE ON DELETE NO ACTION', async () => {
        const sql = `
CREATE TABLE users (
    id BIGINT PRIMARY KEY
);

CREATE TABLE playlists (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_playlists_user_id
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE NO ACTION
);
        `;

        const diagram = convertToChartDBDiagram(
            await fromPostgres(sql),
            DatabaseType.POSTGRESQL,
            DatabaseType.POSTGRESQL
        );

        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBeUndefined();
        expect(diagram.relationships?.[0]?.onUpdate).toBeUndefined();
    });

    it('keeps sibling CockroachDB CREATE TABLE FK actions independent via fromPostgres', async () => {
        const sql = `
CREATE TABLE organizations (
    id BIGINT PRIMARY KEY
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY
);

CREATE TABLE projects (
    id BIGINT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    owner_id BIGINT,
    CONSTRAINT projects_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT projects_owner_id_fk
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);
        `;

        const parserResult = await fromPostgres(sql);
        const diagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.COCKROACHDB,
            DatabaseType.COCKROACHDB
        );

        const projects = diagram.tables?.find(
            (table) => table.name === 'projects'
        );
        const orgRel = diagram.relationships?.find(
            (relationship) =>
                relationship.targetFieldId ===
                projects?.fields.find(
                    (field) => field.name === 'organization_id'
                )?.id
        );
        const ownerRel = diagram.relationships?.find(
            (relationship) =>
                relationship.targetFieldId ===
                projects?.fields.find((field) => field.name === 'owner_id')?.id
        );

        expect(orgRel?.onDelete).toBe('cascade');
        expect(ownerRel?.onDelete).toBe('set_null');
    });

    it('keeps sibling MySQL CREATE TABLE FK actions independent', async () => {
        const sql = `
CREATE TABLE products (
    id BIGINT PRIMARY KEY
) ENGINE=InnoDB;

CREATE TABLE orders (
    id BIGINT PRIMARY KEY
) ENGINE=InnoDB;

CREATE TABLE order_items (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product_id FOREIGN KEY (product_id)
        REFERENCES products(id)
) ENGINE=InnoDB;
        `;

        const parserResult = await fromMySQL(sql);
        const mysqlDiagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.MYSQL,
            DatabaseType.MYSQL
        );
        const mariaDiagram = convertToChartDBDiagram(
            parserResult,
            DatabaseType.MARIADB,
            DatabaseType.MARIADB
        );

        for (const diagram of [mysqlDiagram, mariaDiagram]) {
            const orderItems = diagram.tables?.find(
                (table) => table.name === 'order_items'
            );
            const orderRel = diagram.relationships?.find(
                (relationship) =>
                    relationship.targetFieldId ===
                    orderItems?.fields.find(
                        (field) => field.name === 'order_id'
                    )?.id
            );
            const productRel = diagram.relationships?.find(
                (relationship) =>
                    relationship.targetFieldId ===
                    orderItems?.fields.find(
                        (field) => field.name === 'product_id'
                    )?.id
            );

            expect(orderRel?.onDelete).toBe('cascade');
            expect(orderRel?.onUpdate).toBeUndefined();
            expect(productRel?.onDelete).toBeUndefined();
            expect(productRel?.onUpdate).toBeUndefined();
        }
    });

    it('maps MySQL ON DELETE SET NULL and RESTRICT without inventing sibling actions', async () => {
        const sql = `
CREATE TABLE users (
    id BIGINT PRIMARY KEY
) ENGINE=InnoDB;

CREATE TABLE categories (
    id BIGINT PRIMARY KEY
) ENGINE=InnoDB;

CREATE TABLE posts (
    id BIGINT PRIMARY KEY,
    author_id BIGINT,
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_posts_category FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;
        `;

        const diagram = convertToChartDBDiagram(
            await fromMySQL(sql),
            DatabaseType.MYSQL,
            DatabaseType.MYSQL
        );

        const posts = diagram.tables?.find((table) => table.name === 'posts');
        const authorRel = diagram.relationships?.find(
            (relationship) =>
                relationship.targetFieldId ===
                posts?.fields.find((field) => field.name === 'author_id')?.id
        );
        const categoryRel = diagram.relationships?.find(
            (relationship) =>
                relationship.targetFieldId ===
                posts?.fields.find((field) => field.name === 'category_id')?.id
        );

        expect(authorRel?.onDelete).toBe('set_null');
        expect(authorRel?.onUpdate).toBe('cascade');
        expect(categoryRel?.onDelete).toBe('restrict');
        expect(categoryRel?.onUpdate).toBeUndefined();
    });

    it('omits MySQL ON DELETE NO ACTION', async () => {
        const sql = `
CREATE TABLE users (
    id BIGINT PRIMARY KEY
) ENGINE=InnoDB;

CREATE TABLE playlists (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_playlists_user_id FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE NO ACTION
) ENGINE=InnoDB;
        `;

        const diagram = convertToChartDBDiagram(
            await fromMySQL(sql),
            DatabaseType.MYSQL,
            DatabaseType.MYSQL
        );

        expect(diagram.relationships).toHaveLength(1);
        expect(diagram.relationships?.[0]?.onDelete).toBeUndefined();
        expect(diagram.relationships?.[0]?.onUpdate).toBeUndefined();
    });
});
