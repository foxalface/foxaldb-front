import { beforeEach, describe, expect, it } from 'vitest';
import {
    isPrismaExportSupported,
    resolvePrismaDatasourceProvider,
} from '../prisma-export-capability';
import { generatePrismaSchemaFromDiagram } from '../generate-prisma-schema-from-diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    makeDiagram,
    makeField,
    makeTable,
    resetIdCounter,
    typeRef,
} from './test-helpers';

describe('Prisma export capability', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    const table = makeTable({
        name: 'users',
        fields: [
            makeField({
                name: 'id',
                type: typeRef('integer'),
                primaryKey: true,
            }),
        ],
    });

    it.each([
        [DatabaseType.POSTGRESQL, 'postgresql'],
        [DatabaseType.MYSQL, 'mysql'],
        [DatabaseType.MARIADB, 'mysql'],
        [DatabaseType.SQLITE, 'sqlite'],
        [DatabaseType.SQL_SERVER, 'sqlserver'],
        [DatabaseType.COCKROACHDB, 'cockroachdb'],
    ])('supports %s -> %s', (databaseType, provider) => {
        expect(isPrismaExportSupported(databaseType)).toBe(true);
        expect(resolvePrismaDatasourceProvider(databaseType)).toBe(provider);

        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({ databaseType, tables: [table] }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain(`provider = "${provider}"`);
    });

    it.each([
        DatabaseType.ORACLE,
        DatabaseType.CLICKHOUSE,
        DatabaseType.GENERIC,
    ])('does not support %s', (databaseType) => {
        expect(isPrismaExportSupported(databaseType)).toBe(false);
        expect(resolvePrismaDatasourceProvider(databaseType)).toBeNull();

        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({ databaseType, tables: [table] }),
            version: '7',
        });

        expect(result.success).toBe(false);
        if (result.success) return;

        expect(result.error.code).toBe('unsupported_database');
    });
});
