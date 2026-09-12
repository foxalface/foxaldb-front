import { defaultTableColor } from '@/lib/colors';
import {
    DBCustomTypeKind,
    type DBCustomType,
} from '@/lib/domain/db-custom-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseType } from '@/lib/domain/database-type';

let idCounter = 0;

export const nextId = (prefix: string): string => {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
};

export const resetIdCounter = (): void => {
    idCounter = 0;
};

export const makeField = (
    overrides: Partial<DBField> & Pick<DBField, 'name' | 'type'>
): DBField => ({
    id: overrides.id ?? nextId('field'),
    name: overrides.name,
    type: overrides.type,
    primaryKey: overrides.primaryKey ?? false,
    unique: overrides.unique ?? false,
    nullable: overrides.nullable ?? false,
    increment: overrides.increment ?? null,
    isArray: overrides.isArray ?? null,
    createdAt: overrides.createdAt ?? 0,
    characterMaximumLength: overrides.characterMaximumLength ?? null,
    precision: overrides.precision ?? null,
    scale: overrides.scale ?? null,
    default: overrides.default ?? null,
    collation: overrides.collation ?? null,
    comments: overrides.comments ?? null,
    check: overrides.check ?? null,
});

export const makeTable = (
    overrides: Partial<DBTable> & Pick<DBTable, 'name' | 'fields'>
): DBTable => ({
    id: overrides.id ?? nextId('table'),
    name: overrides.name,
    schema: overrides.schema ?? null,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    fields: overrides.fields,
    indexes: overrides.indexes ?? [],
    checkConstraints: overrides.checkConstraints ?? null,
    color: overrides.color ?? defaultTableColor,
    isView: overrides.isView ?? false,
    isMaterializedView: overrides.isMaterializedView ?? null,
    createdAt: overrides.createdAt ?? 0,
    width: overrides.width ?? null,
    comments: overrides.comments ?? null,
    order: overrides.order ?? null,
    expanded: overrides.expanded ?? null,
    parentAreaId: overrides.parentAreaId ?? null,
});

export const makeRelationship = (
    overrides: Partial<DBRelationship> &
        Pick<
            DBRelationship,
            | 'sourceTableId'
            | 'targetTableId'
            | 'sourceFieldId'
            | 'targetFieldId'
        >
): DBRelationship => ({
    id: overrides.id ?? nextId('relationship'),
    name: overrides.name ?? 'fk',
    sourceSchema: overrides.sourceSchema ?? null,
    sourceTableId: overrides.sourceTableId,
    targetSchema: overrides.targetSchema ?? null,
    targetTableId: overrides.targetTableId,
    sourceFieldId: overrides.sourceFieldId,
    targetFieldId: overrides.targetFieldId,
    sourceCardinality: overrides.sourceCardinality ?? 'many',
    targetCardinality: overrides.targetCardinality ?? 'one',
    onDelete: overrides.onDelete ?? null,
    onUpdate: overrides.onUpdate ?? null,
    createdAt: overrides.createdAt ?? 0,
});

export const makeEnum = (
    name: string,
    values: string[],
    overrides: Partial<DBCustomType> = {}
): DBCustomType => ({
    id: overrides.id ?? nextId('enum'),
    name,
    kind: DBCustomTypeKind.enum,
    values,
    order: overrides.order ?? null,
    schema: overrides.schema ?? null,
});

export const makeDiagram = (
    overrides: Partial<Diagram> & {
        databaseType: DatabaseType;
        tables?: DBTable[];
    }
): Diagram => ({
    id: overrides.id ?? 'diagram-1',
    name: overrides.name ?? 'Test Diagram',
    databaseType: overrides.databaseType,
    databaseEdition: overrides.databaseEdition,
    tables: overrides.tables ?? [],
    relationships: overrides.relationships ?? [],
    dependencies: overrides.dependencies ?? [],
    areas: overrides.areas ?? [],
    customTypes: overrides.customTypes ?? [],
    notes: overrides.notes ?? [],
    createdAt: overrides.createdAt ?? new Date(0),
    updatedAt: overrides.updatedAt ?? new Date(0),
});

export const typeRef = (id: string, name?: string) => ({
    id,
    name: name ?? id,
});

export const makePkIndex = (
    _tableId: string,
    fieldIds: string[],
    overrides: Partial<DBIndex> = {}
): DBIndex => ({
    id: overrides.id ?? nextId('index'),
    name: overrides.name ?? '',
    unique: true,
    fieldIds,
    createdAt: overrides.createdAt ?? 0,
    isPrimaryKey: true,
    type: overrides.type ?? null,
    comments: overrides.comments ?? null,
});
