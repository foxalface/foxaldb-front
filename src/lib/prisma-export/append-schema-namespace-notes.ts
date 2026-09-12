import type { DBTable } from '@/lib/domain/db-table';
import type { PrismaExportNote } from './prisma-export-types';

export const appendSchemaNamespaceNotes = (
    tables: DBTable[],
    notes: PrismaExportNote[]
): void => {
    const tablesBySchema = new Map<string, string[]>();

    for (const table of tables) {
        if (!table.schema) {
            continue;
        }

        const paths = tablesBySchema.get(table.schema) ?? [];
        paths.push(table.name);
        tablesBySchema.set(table.schema, paths);
    }

    const sortedSchemas = [...tablesBySchema.keys()].sort();

    for (const schema of sortedSchemas) {
        const affectedPaths = [...(tablesBySchema.get(schema) ?? [])].sort();
        const count = affectedPaths.length;

        notes.push({
            code: 'schema_namespace_unsupported',
            message:
                count === 1
                    ? `Table "${affectedPaths[0]}" schema "${schema}" is not exported to Prisma @@schema in V1.`
                    : `Table schemas in "${schema}" are not exported to Prisma @@schema in V1 (${count} tables).`,
            path: schema,
            metadata: {
                count,
                affectedPaths,
            },
        });
    }
};
