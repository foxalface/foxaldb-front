import { defaultSchemas } from '@/lib/data/default-schemas';
import type { DatabaseType } from '@/lib/domain/database-type';
import { schemaNameToSchemaId } from '@/lib/domain/db-schema';

export interface EditorSchemaOption {
    id: string;
    name: string;
}

const resolvedSchemaName = (
    schema: string | null | undefined,
    defaultSchema: string | undefined
): string | undefined => schema ?? defaultSchema ?? undefined;

/**
 * Schema options use `schemaNameToSchemaId(table.schema ?? default schema)`.
 * A missing schema with no default is not an option.
 */
export const listDiagramSchemaOptions = (
    tables: readonly { schema?: string | null }[] | undefined,
    databaseType: DatabaseType | undefined
): EditorSchemaOption[] => {
    const defaultSchema = databaseType
        ? defaultSchemas[databaseType]
        : undefined;
    const namesById = new Map<string, string>();

    for (const table of tables ?? []) {
        const name = resolvedSchemaName(table.schema, defaultSchema);

        if (!name) {
            continue;
        }

        const id = schemaNameToSchemaId(name);

        if (!namesById.has(id)) {
            namesById.set(id, name);
        }
    }

    return [...namesById.entries()]
        .map(([id, name]) => ({ id, name }))
        .sort((left, right) => left.name.localeCompare(right.name));
};

/** Empty selection is no constraint. Several areas match with OR. */
export const tablePassesAreaConstraint = (
    parentAreaId: string | null | undefined,
    selectedAreaIds: readonly string[]
): boolean => {
    if (selectedAreaIds.length === 0) {
        return true;
    }

    return !!parentAreaId && selectedAreaIds.includes(parentAreaId);
};

/** Empty selection is no constraint. Several schemas match with OR. */
export const tablePassesSchemaConstraint = (
    table: { schema?: string | null },
    selectedSchemaIds: readonly string[],
    defaultSchema: string | undefined
): boolean => {
    if (selectedSchemaIds.length === 0) {
        return true;
    }

    const name = resolvedSchemaName(table.schema, defaultSchema);

    if (!name) {
        return false;
    }

    return selectedSchemaIds.includes(schemaNameToSchemaId(name));
};
