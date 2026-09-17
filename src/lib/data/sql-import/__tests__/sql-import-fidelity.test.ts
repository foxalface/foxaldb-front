import { describe, expect, it } from 'vitest';
import { sqlImportToDiagram } from '../index';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';

const findTable = (diagram: Diagram, name: string): DBTable | undefined =>
    diagram.tables?.find((table) => table.name === name);

const fieldId = (
    table: DBTable | undefined,
    fieldName: string
): string | undefined =>
    table?.fields.find((field) => field.name === fieldName)?.id;

describe('SQL import fidelity', () => {
    it('preserves MySQL DECIMAL precision and scale through canonical Diagram', async () => {
        const sql = `
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    price DECIMAL(10,2),
    qty DECIMAL(10),
    zero_scale DECIMAL(10,0),
    high_precision DECIMAL(20,8),
    amount NUMERIC(10,2)
) ENGINE=InnoDB;
        `;

        const mysqlDiagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.MYSQL,
            targetDatabaseType: DatabaseType.MYSQL,
        });
        const mariaDiagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.MARIADB,
            targetDatabaseType: DatabaseType.MARIADB,
        });

        for (const diagram of [mysqlDiagram, mariaDiagram]) {
            const products = findTable(diagram, 'products');
            const price = products?.fields.find(
                (field) => field.name === 'price'
            );
            const qty = products?.fields.find((field) => field.name === 'qty');
            const zeroScale = products?.fields.find(
                (field) => field.name === 'zero_scale'
            );
            const highPrecision = products?.fields.find(
                (field) => field.name === 'high_precision'
            );
            const amount = products?.fields.find(
                (field) => field.name === 'amount'
            );

            expect(price?.precision).toBe(10);
            expect(price?.scale).toBe(2);

            expect(qty?.precision).toBe(10);
            expect(qty?.scale).toBeUndefined();

            expect(zeroScale?.precision).toBe(10);
            expect(zeroScale?.scale).toBe(0);

            expect(highPrecision?.precision).toBe(20);
            expect(highPrecision?.scale).toBe(8);

            expect(amount?.precision).toBe(10);
            expect(amount?.scale).toBe(2);
        }
    });

    it('preserves existing MySQL composite UNIQUE as a unique DBIndex', async () => {
        const sql = `
CREATE TABLE projects (
    id BIGINT PRIMARY KEY,
    org_id BIGINT NOT NULL,
    project_key VARCHAR(64) NOT NULL,
    CONSTRAINT uq_projects_org_key UNIQUE (org_id, project_key)
) ENGINE=InnoDB;
        `;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.MYSQL,
            targetDatabaseType: DatabaseType.MYSQL,
        });

        const projects = findTable(diagram, 'projects');
        const uniqueIndex = projects?.indexes.find(
            (index) =>
                index.unique &&
                index.fieldIds.length === 2 &&
                index.fieldIds[0] === fieldId(projects, 'org_id') &&
                index.fieldIds[1] === fieldId(projects, 'project_key')
        );

        expect(uniqueIndex).toBeDefined();
        expect(uniqueIndex?.name).toBe('uq_projects_org_key');
        expect(uniqueIndex?.unique).toBe(true);
        expect(
            projects?.fields.find((field) => field.name === 'org_id')?.unique
        ).toBe(false);
        expect(
            projects?.fields.find((field) => field.name === 'project_key')
                ?.unique
        ).toBe(false);
    });

    it('imports SQLite standalone indexes onto the canonical table', async () => {
        const sql = `
CREATE TABLE articles (
    id INTEGER PRIMARY KEY,
    author_id INTEGER,
    published INTEGER,
    title TEXT UNIQUE
);

CREATE INDEX articles_author_id_idx ON articles (author_id);
CREATE INDEX articles_published_idx ON articles (author_id, published);
CREATE UNIQUE INDEX articles_title_uidx ON articles (title);
CREATE UNIQUE INDEX articles_author_title_uidx ON articles (author_id, title);
CREATE INDEX articles_partial_idx ON articles (published) WHERE published = 1;
        `;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.SQLITE,
            targetDatabaseType: DatabaseType.SQLITE,
        });

        const articles = findTable(diagram, 'articles');
        const authorId = fieldId(articles, 'author_id');
        const published = fieldId(articles, 'published');
        const title = fieldId(articles, 'title');

        const authorIndex = articles?.indexes.find(
            (index) => index.name === 'articles_author_id_idx'
        );
        const publishedIndex = articles?.indexes.find(
            (index) => index.name === 'articles_published_idx'
        );
        const uniqueTitle = articles?.indexes.find(
            (index) => index.name === 'articles_title_uidx'
        );
        const uniqueComposite = articles?.indexes.find(
            (index) => index.name === 'articles_author_title_uidx'
        );
        const partial = articles?.indexes.find(
            (index) => index.name === 'articles_partial_idx'
        );

        expect(authorIndex?.unique).toBe(false);
        expect(authorIndex?.fieldIds).toEqual([authorId]);

        expect(publishedIndex?.unique).toBe(false);
        expect(publishedIndex?.fieldIds).toEqual([authorId, published]);

        expect(uniqueTitle?.unique).toBe(true);
        expect(uniqueTitle?.fieldIds).toEqual([title]);

        expect(uniqueComposite?.unique).toBe(true);
        expect(uniqueComposite?.fieldIds).toEqual([authorId, title]);

        expect(partial).toBeUndefined();

        expect(
            articles?.fields.find((field) => field.name === 'title')?.unique
        ).toBe(true);
    });

    it('imports SQLite table-level UNIQUE without making a keyless table into a PK table', async () => {
        const sql = `
CREATE TABLE articles (
    id INTEGER PRIMARY KEY,
    title TEXT
);

CREATE TABLE article_categories (
    article_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    CONSTRAINT article_categories_unique UNIQUE(article_id, category_id)
);

CREATE TABLE tags (
    name TEXT,
    UNIQUE(name)
);
        `;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.SQLITE,
            targetDatabaseType: DatabaseType.SQLITE,
        });

        const articleCategories = findTable(diagram, 'article_categories');
        const tags = findTable(diagram, 'tags');

        expect(
            articleCategories?.fields.some((field) => field.primaryKey)
        ).toBe(false);

        const compositeUnique = articleCategories?.indexes.find(
            (index) => index.name === 'article_categories_unique'
        );
        expect(compositeUnique?.unique).toBe(true);
        expect(compositeUnique?.fieldIds).toEqual([
            fieldId(articleCategories, 'article_id'),
            fieldId(articleCategories, 'category_id'),
        ]);
        expect(
            articleCategories?.fields.find(
                (field) => field.name === 'article_id'
            )?.unique
        ).toBe(false);
        expect(
            articleCategories?.fields.find(
                (field) => field.name === 'category_id'
            )?.unique
        ).toBe(false);

        const nameUnique = tags?.indexes.find((index) => index.unique);
        expect(nameUnique?.fieldIds).toEqual([fieldId(tags, 'name')]);
        expect(
            tags?.fields.find((field) => field.name === 'name')?.unique
        ).toBe(true);
    });

    it('imports PostgreSQL CREATE TABLE named composite UNIQUE as a unique DBIndex', async () => {
        const sql = `
CREATE TABLE projects (
    id BIGINT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    CONSTRAINT projects_org_name_unique UNIQUE (organization_id, name)
);
        `;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.POSTGRESQL,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        const projects = findTable(diagram, 'projects');
        const uniqueIndex = projects?.indexes.find(
            (index) => index.name === 'projects_org_name_unique'
        );

        expect(uniqueIndex?.unique).toBe(true);
        expect(uniqueIndex?.fieldIds).toEqual([
            fieldId(projects, 'organization_id'),
            fieldId(projects, 'name'),
        ]);
        expect(
            projects?.fields.find((field) => field.name === 'organization_id')
                ?.unique
        ).toBe(false);
        expect(
            projects?.fields.find((field) => field.name === 'name')?.unique
        ).toBe(false);
        expect(
            projects?.fields.find((field) => field.name === 'id')?.primaryKey
        ).toBe(true);
    });

    it('does not regress PostgreSQL dump ALTER TABLE UNIQUE', async () => {
        const sql = `
CREATE TABLE projects (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    name text NOT NULL
);

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_org_name_unique UNIQUE (organization_id, name);
        `;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.POSTGRESQL,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        const projects = findTable(diagram, 'projects');
        const uniqueIndex = projects?.indexes.find(
            (index) => index.name === 'projects_org_name_unique'
        );

        expect(uniqueIndex?.unique).toBe(true);
        expect(uniqueIndex?.fieldIds).toEqual([
            fieldId(projects, 'organization_id'),
            fieldId(projects, 'name'),
        ]);
        expect(
            projects?.fields.find((field) => field.name === 'id')?.primaryKey
        ).toBe(true);
    });

    it('does not regress PostgreSQL CREATE UNIQUE INDEX', async () => {
        const sql = `
CREATE TABLE projects (
    id BIGINT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX projects_org_name_idx ON projects (organization_id, name);
        `;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.POSTGRESQL,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        const projects = findTable(diagram, 'projects');
        const uniqueIndex = projects?.indexes.find(
            (index) => index.name === 'projects_org_name_idx'
        );

        expect(uniqueIndex?.unique).toBe(true);
        expect(uniqueIndex?.fieldIds).toEqual([
            fieldId(projects, 'organization_id'),
            fieldId(projects, 'name'),
        ]);
    });
});

const expectNamedIndex = (
    table: DBTable | undefined,
    name: string,
    fieldNames: string[],
    unique: boolean
): void => {
    const index = table?.indexes.find((candidate) => candidate.name === name);

    expect(index).toBeDefined();
    expect(index?.unique).toBe(unique);
    expect(index?.fieldIds).toEqual(
        fieldNames.map((fieldName) => fieldId(table, fieldName))
    );
};

const importMysqlFamily = async (
    sql: string,
    databaseType: DatabaseType.MYSQL | DatabaseType.MARIADB
): Promise<Diagram> =>
    sqlImportToDiagram({
        sqlContent: sql,
        sourceDatabaseType: databaseType,
        targetDatabaseType: databaseType,
    });

describe('SQL import fidelity — MySQL/MariaDB indexes', () => {
    it('preserves MySQL CREATE TABLE named UNIQUE, KEY, INDEX, UNIQUE KEY, and UNIQUE INDEX', async () => {
        const sql = `
CREATE TABLE example (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255),
    tenant_id BIGINT,
    external_id VARCHAR(100),
    customer_id BIGINT,
    status VARCHAR(30),
    a VARCHAR(10),
    b VARCHAR(10),

    CONSTRAINT example_email_unique UNIQUE (email),
    CONSTRAINT example_tenant_external_unique UNIQUE (tenant_id, external_id),

    KEY example_customer_idx (customer_id),
    INDEX example_status_idx (status),
    KEY example_customer_status_idx (customer_id, status),

    UNIQUE KEY example_a_unique (a),
    UNIQUE KEY example_ab_unique (a, b),
    UNIQUE INDEX example_external_uidx (external_id),
    UNIQUE INDEX example_tenant_status_uidx (tenant_id, status)
) ENGINE=InnoDB;
        `;

        const diagram = await importMysqlFamily(sql, DatabaseType.MYSQL);
        const example = findTable(diagram, 'example');

        expectNamedIndex(example, 'example_email_unique', ['email'], true);
        expectNamedIndex(
            example,
            'example_tenant_external_unique',
            ['tenant_id', 'external_id'],
            true
        );
        expectNamedIndex(
            example,
            'example_customer_idx',
            ['customer_id'],
            false
        );
        expectNamedIndex(example, 'example_status_idx', ['status'], false);
        expectNamedIndex(
            example,
            'example_customer_status_idx',
            ['customer_id', 'status'],
            false
        );
        expectNamedIndex(example, 'example_a_unique', ['a'], true);
        expectNamedIndex(example, 'example_ab_unique', ['a', 'b'], true);
        expectNamedIndex(
            example,
            'example_external_uidx',
            ['external_id'],
            true
        );
        expectNamedIndex(
            example,
            'example_tenant_status_uidx',
            ['tenant_id', 'status'],
            true
        );
    });

    it('imports MySQL standalone CREATE INDEX uniqueness through the public SQL path', async () => {
        const sql = `
CREATE TABLE example (
    id BIGINT PRIMARY KEY,
    a VARCHAR(10),
    b VARCHAR(10),
    c VARCHAR(10),
    d VARCHAR(10)
) ENGINE=InnoDB;

CREATE INDEX idx_single ON example (a);
CREATE INDEX idx_composite ON example (a, b);
CREATE UNIQUE INDEX idx_unique ON example (c);
CREATE UNIQUE INDEX idx_unique_composite ON example (c, d);
        `;

        const diagram = await importMysqlFamily(sql, DatabaseType.MYSQL);
        const example = findTable(diagram, 'example');

        expectNamedIndex(example, 'idx_single', ['a'], false);
        expectNamedIndex(example, 'idx_composite', ['a', 'b'], false);
        expectNamedIndex(example, 'idx_unique', ['c'], true);
        expectNamedIndex(example, 'idx_unique_composite', ['c', 'd'], true);
    });

    it('preserves MariaDB CREATE TABLE KEY/UNIQUE KEY names through the shared fromMySQL path', async () => {
        const sql = `
CREATE TABLE example (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255),
    tenant_id BIGINT,
    customer_id BIGINT,
    status VARCHAR(30),

    CONSTRAINT example_email_unique UNIQUE (email),
    KEY example_customer_idx (customer_id),
    INDEX example_status_idx (status),
    UNIQUE KEY example_tenant_email_unique (tenant_id, email)
);
        `;

        const diagram = await importMysqlFamily(sql, DatabaseType.MARIADB);
        const example = findTable(diagram, 'example');

        expectNamedIndex(example, 'example_email_unique', ['email'], true);
        expectNamedIndex(
            example,
            'example_customer_idx',
            ['customer_id'],
            false
        );
        expectNamedIndex(example, 'example_status_idx', ['status'], false);
        expectNamedIndex(
            example,
            'example_tenant_email_unique',
            ['tenant_id', 'email'],
            true
        );
    });

    it('preserves the original MariaDB QA fixture unique names and non-unique CREATE INDEX flags', async () => {
        const sql = `
CREATE TABLE customers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT customers_email_unique UNIQUE (email)
);

CREATE TABLE products (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY (id),
    CONSTRAINT products_sku_unique UNIQUE (sku)
);

CREATE TABLE orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT orders_reference_unique UNIQUE (reference),

    CONSTRAINT orders_customer_id_fk
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

CREATE INDEX orders_customer_id_idx
    ON orders (customer_id);

CREATE INDEX orders_customer_status_idx
    ON orders (customer_id, status);

CREATE TABLE order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT order_items_order_product_unique
        UNIQUE (order_id, product_id),

    CONSTRAINT order_items_order_id_fk
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT order_items_product_id_fk
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);

CREATE INDEX order_items_order_id_idx
    ON order_items (order_id);

CREATE INDEX order_items_product_id_idx
    ON order_items (product_id);
        `;

        const diagram = await importMysqlFamily(sql, DatabaseType.MARIADB);
        const orders = findTable(diagram, 'orders');
        const orderItems = findTable(diagram, 'order_items');

        expectNamedIndex(
            orderItems,
            'order_items_order_product_unique',
            ['order_id', 'product_id'],
            true
        );
        expectNamedIndex(
            orderItems,
            'order_items_order_id_idx',
            ['order_id'],
            false
        );
        expectNamedIndex(
            orderItems,
            'order_items_product_id_idx',
            ['product_id'],
            false
        );
        expectNamedIndex(
            orders,
            'orders_reference_unique',
            ['reference'],
            true
        );
        expectNamedIndex(
            orders,
            'orders_customer_id_idx',
            ['customer_id'],
            false
        );
        expectNamedIndex(
            orders,
            'orders_customer_status_idx',
            ['customer_id', 'status'],
            false
        );

        expect(
            orderItems?.indexes.find(
                (index) => index.name === 'order_items_order_id_key'
            )
        ).toBeUndefined();
        expect(
            orders?.indexes.find(
                (index) => index.name === 'orders_reference_key'
            )
        ).toBeUndefined();
    });

    it('imports MariaDB standalone CREATE INDEX uniqueness through the public SQL path', async () => {
        const sql = `
CREATE TABLE example (
    id BIGINT PRIMARY KEY,
    a VARCHAR(10),
    b VARCHAR(10),
    c VARCHAR(10),
    d VARCHAR(10)
);

CREATE INDEX idx_single ON example (a);
CREATE INDEX idx_composite ON example (a, b);
CREATE UNIQUE INDEX idx_unique ON example (c);
CREATE UNIQUE INDEX idx_unique_composite ON example (c, d);
        `;

        const diagram = await importMysqlFamily(sql, DatabaseType.MARIADB);
        const example = findTable(diagram, 'example');

        expectNamedIndex(example, 'idx_single', ['a'], false);
        expectNamedIndex(example, 'idx_composite', ['a', 'b'], false);
        expectNamedIndex(example, 'idx_unique', ['c'], true);
        expectNamedIndex(example, 'idx_unique_composite', ['c', 'd'], true);
    });
});
