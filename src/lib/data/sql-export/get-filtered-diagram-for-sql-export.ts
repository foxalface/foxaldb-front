import { defaultSchemas } from '@/lib/data/default-schemas';
import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseType } from '@/lib/domain/database-type';
import {
    filterDependency,
    filterRelationship,
    filterTable,
} from '@/lib/domain/diagram-filter/filter';
import type { DiagramFilter } from '@/lib/domain/diagram-filter/diagram-filter';

export const getFilteredDiagramForSqlExport = (
    diagram: Diagram,
    filter: DiagramFilter,
    targetDatabaseType: DatabaseType
): Diagram => ({
    ...diagram,
    tables: diagram.tables?.filter((table) =>
        filterTable({
            table: {
                id: table.id,
                schema: table.schema,
            },
            filter,
            options: {
                defaultSchema: defaultSchemas[targetDatabaseType],
            },
        })
    ),
    relationships: diagram.relationships?.filter((rel) => {
        const sourceTable = diagram.tables?.find(
            (table) => table.id === rel.sourceTableId
        );
        const targetTable = diagram.tables?.find(
            (table) => table.id === rel.targetTableId
        );

        return (
            sourceTable &&
            targetTable &&
            filterRelationship({
                tableA: {
                    id: sourceTable.id,
                    schema: sourceTable.schema,
                },
                tableB: {
                    id: targetTable.id,
                    schema: targetTable.schema,
                },
                filter,
                options: {
                    defaultSchema: defaultSchemas[targetDatabaseType],
                },
            })
        );
    }),
    dependencies: diagram.dependencies?.filter((dep) => {
        const table = diagram.tables?.find((item) => item.id === dep.tableId);
        const dependentTable = diagram.tables?.find(
            (item) => item.id === dep.dependentTableId
        );

        return (
            table &&
            dependentTable &&
            filterDependency({
                tableA: {
                    id: table.id,
                    schema: table.schema,
                },
                tableB: {
                    id: dependentTable.id,
                    schema: dependentTable.schema,
                },
                filter,
                options: {
                    defaultSchema: defaultSchemas[targetDatabaseType],
                },
            })
        );
    }),
});
