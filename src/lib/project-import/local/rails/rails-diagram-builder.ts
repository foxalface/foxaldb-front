import { defaultTableColor } from '@/lib/colors';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type {
    DBRelationship,
    ForeignKeyOnDeleteAction,
    ForeignKeyOnUpdateAction,
} from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { ProjectImportDiagnostic } from '../../project-execution-types';
import type {
    RailsForeignKeyDefinition,
    RailsIndexDefinition,
    RailsSchemaDocument,
    RailsTableDefinition,
} from './rails-schema-ast';
import { mapRailsColumnType } from './rails-type-mapper';

export interface RailsDiagramBuildResult {
    diagram: Diagram;
    diagnostics: ProjectImportDiagnostic[];
}

const stableId = (namespace: string, ...parts: string[]): string => {
    const input = [namespace, ...parts].join('\0');
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
    let hash = 2166136261;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    let value = hash >>> 0;
    let id = '';

    for (let index = 0; index < 25; index += 1) {
        id += alphabet[value % 36];
        value = Math.imul(hash, 16777619) ^ (value >>> 7);
    }

    return id;
};

const addDiagnostic = (
    diagnostics: ProjectImportDiagnostic[],
    severity: ProjectImportDiagnostic['severity'],
    code: string,
    message: string,
    path?: string
): void => {
    diagnostics.push({ severity, code, message, ...(path ? { path } : {}) });
};

const inferForeignKeyColumn = (targetTable: string): string => {
    if (targetTable.endsWith('ies')) {
        return `${targetTable.slice(0, -3)}y_id`;
    }

    if (targetTable.endsWith('s')) {
        return `${targetTable.slice(0, -1)}_id`;
    }

    return `${targetTable}_id`;
};

const mapOnDelete = (value?: string): ForeignKeyOnDeleteAction | null => {
    switch (value) {
        case 'cascade':
            return 'cascade';
        case 'nullify':
            return 'set_null';
        case 'restrict':
            return 'restrict';
        default:
            return null;
    }
};

const mapOnUpdate = (value?: string): ForeignKeyOnUpdateAction | null => {
    switch (value) {
        case 'cascade':
            return 'cascade';
        case 'restrict':
            return 'restrict';
        default:
            return null;
    }
};

const indexSignature = (index: RailsIndexDefinition): string =>
    [
        index.tableName,
        index.columns.join(','),
        index.unique ? '1' : '0',
        index.name ?? '',
    ].join('|');

const resolvePrimaryKeyColumns = (table: RailsTableDefinition): string[] => {
    if (table.options.primaryKey) {
        return [table.options.primaryKey];
    }

    const explicitPk = table.columns
        .filter((column) => column.options.primaryKey)
        .map((column) => column.name);

    if (explicitPk.length > 0) {
        return explicitPk;
    }

    if (table.options.id === false) {
        return [];
    }

    const hasIdColumn = table.columns.some((column) => column.name === 'id');
    return hasIdColumn ? ['id'] : ['id'];
};

const buildFields = (
    table: RailsTableDefinition,
    targetDatabaseType: DatabaseType,
    createdAt: number,
    primaryKeyColumns: string[]
): DBField[] => {
    const fields: DBField[] = [];
    const hasExplicitId = table.columns.some((column) => column.name === 'id');
    const implicitId =
        table.options.id !== false &&
        !hasExplicitId &&
        primaryKeyColumns.includes('id');

    if (implicitId) {
        const type = mapRailsColumnType('bigint', targetDatabaseType);
        fields.push({
            id: stableId('field', table.name, 'id'),
            name: 'id',
            type,
            primaryKey: true,
            unique: false,
            nullable: false,
            increment: true,
            createdAt,
        });
    }

    for (const column of table.columns) {
        const isPrimaryKey = primaryKeyColumns.includes(column.name);
        const type = mapRailsColumnType(column.type, targetDatabaseType);
        const nullable =
            column.options.null !== undefined ? column.options.null : true;

        const field: DBField = {
            id: stableId('field', table.name, column.name),
            name: column.name,
            type,
            primaryKey: isPrimaryKey,
            unique: false,
            nullable,
            increment:
                isPrimaryKey &&
                (column.type === 'integer' || column.type === 'bigint'),
            createdAt,
        };

        if (column.options.limit !== undefined) {
            field.characterMaximumLength = String(column.options.limit);
        }

        if (column.options.precision !== undefined) {
            field.precision = column.options.precision;
        }

        if (column.options.scale !== undefined) {
            field.scale = column.options.scale;
        }

        if (
            column.options.default !== undefined &&
            column.options.default !== null &&
            typeof column.options.default !== 'object'
        ) {
            field.default = String(column.options.default);
        }

        if (column.options.comment) {
            field.comments = column.options.comment;
        }

        fields.push(field);
    }

    return fields;
};

const buildIndexes = (
    indexes: RailsIndexDefinition[],
    tableName: string,
    fieldIdsByName: Map<string, string>,
    createdAt: number
): DBIndex[] => {
    const built: DBIndex[] = [];

    for (const index of indexes) {
        const fieldIds = index.columns
            .map((column) => fieldIdsByName.get(column))
            .filter((fieldId): fieldId is string => Boolean(fieldId));

        if (fieldIds.length !== index.columns.length) {
            continue;
        }

        built.push({
            id: stableId(
                'index',
                tableName,
                index.columns.join(','),
                index.name ?? ''
            ),
            name:
                index.name ??
                `${index.columns.join('_')}${index.unique ? '_unique' : '_index'}`,
            unique: index.unique,
            fieldIds,
            createdAt,
        });
    }

    return built;
};

const resolveDiagramName = (rootPath: string): string => {
    const normalized = rootPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');

    if (normalized.length === 0) {
        return 'Rails Import';
    }

    const segments = normalized.split('/');
    const basename = segments[segments.length - 1];

    return basename ? `${basename} Import` : 'Rails Import';
};

export const buildDiagramFromRailsSchema = (
    document: RailsSchemaDocument,
    targetDatabaseType: DatabaseType,
    rootPath: string
): RailsDiagramBuildResult => {
    const diagnostics: ProjectImportDiagnostic[] = [];
    const createdAt = Date.now();
    const tables: DBTable[] = [];
    const tableIdsByName = new Map<string, string>();
    const fieldIdsByTableAndColumn = new Map<string, Map<string, string>>();
    const primaryKeyByTable = new Map<string, string[]>();

    document.tables.forEach((table, tableOrder) => {
        const tableId = stableId('table', table.name);
        tableIdsByName.set(table.name, tableId);

        const primaryKeyColumns = resolvePrimaryKeyColumns(table);
        primaryKeyByTable.set(table.name, primaryKeyColumns);

        const fields = buildFields(
            table,
            targetDatabaseType,
            createdAt,
            primaryKeyColumns
        );

        const fieldIdsByName = new Map(
            fields.map((field) => [field.name, field.id])
        );
        fieldIdsByTableAndColumn.set(table.name, fieldIdsByName);

        const mergedIndexes = new Map<string, RailsIndexDefinition>();
        for (const index of [...table.inlineIndexes, ...document.indexes]) {
            if (index.tableName !== table.name) {
                continue;
            }

            mergedIndexes.set(indexSignature(index), index);
        }

        const indexes = buildIndexes(
            Array.from(mergedIndexes.values()),
            table.name,
            fieldIdsByName,
            createdAt
        );

        const pkFieldIds = primaryKeyColumns
            .map((column) => fieldIdsByName.get(column))
            .filter((fieldId): fieldId is string => Boolean(fieldId));

        if (pkFieldIds.length > 0) {
            indexes.unshift({
                id: stableId('index', table.name, 'pk'),
                name: '',
                unique: true,
                fieldIds: pkFieldIds,
                isPrimaryKey: true,
                createdAt,
            });
        }

        tables.push({
            id: tableId,
            name: table.name,
            schema: null,
            x: 100 + (tableOrder % 4) * 320,
            y: 100 + Math.floor(tableOrder / 4) * 240,
            fields,
            indexes,
            color: defaultTableColor,
            isView: false,
            createdAt,
            order: tableOrder,
            ...(table.options.comment
                ? { comments: table.options.comment }
                : {}),
        });
    });

    const relationships: DBRelationship[] = [];

    for (const foreignKey of document.foreignKeys) {
        const relationship = mapForeignKey(
            foreignKey,
            tableIdsByName,
            fieldIdsByTableAndColumn,
            primaryKeyByTable,
            createdAt,
            diagnostics
        );

        if (relationship) {
            relationships.push(relationship);
        }
    }

    return {
        diagram: {
            id: '',
            name: resolveDiagramName(rootPath),
            databaseType: targetDatabaseType,
            tables,
            relationships,
            dependencies: [],
            areas: [],
            customTypes: [],
            notes: [],
            createdAt: new Date(createdAt),
            updatedAt: new Date(createdAt),
        },
        diagnostics,
    };
};

const mapForeignKey = (
    foreignKey: RailsForeignKeyDefinition,
    tableIdsByName: Map<string, string>,
    fieldIdsByTableAndColumn: Map<string, Map<string, string>>,
    primaryKeyByTable: Map<string, string[]>,
    createdAt: number,
    diagnostics: ProjectImportDiagnostic[]
): DBRelationship | null => {
    const sourceTableId = tableIdsByName.get(foreignKey.fromTable);
    const targetTableId = tableIdsByName.get(foreignKey.toTable);

    if (!sourceTableId || !targetTableId) {
        addDiagnostic(
            diagnostics,
            'warning',
            'rails_unresolved_foreign_key',
            `Could not resolve tables for foreign key ${foreignKey.fromTable} -> ${foreignKey.toTable}.`,
            'db/schema.rb'
        );
        return null;
    }

    const sourceColumn =
        foreignKey.column ?? inferForeignKeyColumn(foreignKey.toTable);
    const targetPrimaryKey =
        foreignKey.primaryKey ??
        primaryKeyByTable.get(foreignKey.toTable)?.[0] ??
        'id';

    const sourceFieldId = fieldIdsByTableAndColumn
        .get(foreignKey.fromTable)
        ?.get(sourceColumn);
    const targetFieldId = fieldIdsByTableAndColumn
        .get(foreignKey.toTable)
        ?.get(targetPrimaryKey);

    if (!sourceFieldId || !targetFieldId) {
        addDiagnostic(
            diagnostics,
            'warning',
            'rails_unresolved_foreign_key',
            `Could not resolve foreign key fields for ${foreignKey.fromTable}.${sourceColumn} -> ${foreignKey.toTable}.${targetPrimaryKey}.`,
            'db/schema.rb'
        );
        return null;
    }

    return {
        id: stableId(
            'relationship',
            foreignKey.fromTable,
            sourceColumn,
            foreignKey.toTable,
            targetPrimaryKey
        ),
        name: `${foreignKey.fromTable}_${sourceColumn}_foreign`,
        sourceTableId,
        targetTableId,
        sourceFieldId,
        targetFieldId,
        sourceCardinality: 'many',
        targetCardinality: 'one',
        onDelete: mapOnDelete(foreignKey.onDelete),
        onUpdate: mapOnUpdate(foreignKey.onUpdate),
        createdAt,
    };
};
