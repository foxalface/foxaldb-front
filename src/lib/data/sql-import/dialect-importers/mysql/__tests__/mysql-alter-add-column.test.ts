import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { sqlImportToDiagram } from '@/lib/data/sql-import';

describe('MySQL ALTER TABLE ADD COLUMN type metadata', () => {
    it('preserves varchar length from ALTER ADD COLUMN', async () => {
        const sql = `
CREATE TABLE \`products\` (
  \`id\` bigint NOT NULL AUTO_INCREMENT,
  \`name\` varchar(120) NOT NULL,
  PRIMARY KEY (\`id\`)
);

ALTER TABLE \`products\`
ADD COLUMN \`sku\` varchar(32) NOT NULL;
`;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.MYSQL,
            targetDatabaseType: DatabaseType.MYSQL,
        });

        const products = diagram.tables?.find(
            (table) => table.name === 'products'
        );
        const name = products?.fields?.find((field) => field.name === 'name');
        const sku = products?.fields?.find((field) => field.name === 'sku');

        expect(name?.type?.name).toBe('varchar');
        expect(name?.characterMaximumLength).toBe('120');
        expect(sku?.type?.name).toBe('varchar');
        expect(sku?.characterMaximumLength).toBe('32');
        expect(sku?.nullable).toBe(false);
    });

    it('preserves decimal precision and scale from ALTER ADD COLUMN', async () => {
        const sql = `
CREATE TABLE \`products\` (
  \`id\` bigint NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (\`id\`)
);

ALTER TABLE \`products\`
ADD COLUMN \`price\` decimal(12,2) NOT NULL;
`;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.MYSQL,
            targetDatabaseType: DatabaseType.MYSQL,
        });

        const products = diagram.tables?.find(
            (table) => table.name === 'products'
        );
        const price = products?.fields?.find((field) => field.name === 'price');

        expect(price?.type?.name).toBe('decimal');
        expect(price?.precision).toBe(12);
        expect(price?.scale).toBe(2);
        expect(price?.nullable).toBe(false);
    });
});
