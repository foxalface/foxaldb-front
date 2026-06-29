import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type {
    ForeignKeySnapshot,
    IndexSnapshot,
} from '@/types/laravel-migration';
import { buildDiagramEntityIndex } from './build-diagram-entity-index';
import {
    foreignKeyMatchKey,
    indexMatchKey,
    tableColumnMatchKey,
    tableMatchKey,
} from './snapshot-match-key';

export class ApplyIdResolver {
    private readonly tableIdByMatchKey = new Map<string, string>();
    private readonly fieldIdByMatchKey = new Map<string, string>();
    private readonly indexIdByMatchKey = new Map<string, string>();
    private readonly relationshipIdByFkKey = new Map<string, string>();

    constructor({
        tables,
        relationships,
    }: {
        tables: DBTable[];
        relationships: DBRelationship[];
    }) {
        const entityIndex = buildDiagramEntityIndex({ tables, relationships });

        for (const [matchKey, table] of entityIndex.tableByName) {
            this.tableIdByMatchKey.set(matchKey, table.id);
        }

        for (const [matchKey, field] of entityIndex.fieldByTableAndName) {
            this.fieldIdByMatchKey.set(matchKey, field.id);
        }

        for (const [matchKey, resolved] of entityIndex.indexByTableAndKey) {
            this.indexIdByMatchKey.set(matchKey, resolved.index.id);
        }

        for (const [matchKey, resolved] of entityIndex.relationshipByFkKey) {
            this.relationshipIdByFkKey.set(matchKey, resolved.relationship.id);
        }
    }

    registerTable(tableName: string, tableId: string): void {
        this.tableIdByMatchKey.set(tableMatchKey(tableName), tableId);
    }

    registerField(
        tableName: string,
        columnName: string,
        fieldId: string
    ): void {
        this.fieldIdByMatchKey.set(
            tableColumnMatchKey(tableName, columnName),
            fieldId
        );
    }

    registerIndex(
        tableName: string,
        index: IndexSnapshot,
        indexId: string
    ): void {
        this.indexIdByMatchKey.set(indexMatchKey(tableName, index), indexId);
    }

    registerForeignKey(
        foreignKey: ForeignKeySnapshot,
        relationshipId: string
    ): void {
        this.relationshipIdByFkKey.set(
            foreignKeyMatchKey(foreignKey),
            relationshipId
        );
    }

    resolveTableId(
        tableName: string,
        fallbackId: string | null,
        errorMessage: string
    ): string {
        if (fallbackId !== null && fallbackId !== '') {
            return fallbackId;
        }

        const resolved = this.tableIdByMatchKey.get(tableMatchKey(tableName));

        if (!resolved) {
            throw new Error(errorMessage);
        }

        return resolved;
    }

    resolveFieldId(
        tableName: string,
        columnName: string,
        fallbackId: string | null,
        errorMessage: string
    ): string {
        if (fallbackId !== null && fallbackId !== '') {
            return fallbackId;
        }

        const resolved = this.fieldIdByMatchKey.get(
            tableColumnMatchKey(tableName, columnName)
        );

        if (!resolved) {
            throw new Error(errorMessage);
        }

        return resolved;
    }

    resolveIndexFieldIds(
        tableName: string,
        fieldIds: string[],
        columnNames: string[],
        errorMessage: string
    ): string[] {
        return columnNames.map((columnName, index) =>
            this.resolveFieldId(
                tableName,
                columnName,
                fieldIds[index] ?? null,
                errorMessage
            )
        );
    }
}
