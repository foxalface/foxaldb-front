import { genericDataTypes } from '@/lib/data/data-types/generic-data-types';
import type { DataType } from '@/lib/data/data-types/data-types';
import type { ColumnSnapshot } from '@/types/laravel-migration';
import { normalizeColumnName } from './normalize-identifier';
import type { ApplyValidationIssue, PlannedFieldPayload } from './types';

const SUPPORTED_LARAVEL_COLUMN_TYPES = new Set([
    'string',
    'text',
    'mediumtext',
    'longtext',
    'integer',
    'tinyinteger',
    'smallinteger',
    'bigint',
    'biginteger',
    'unsignedinteger',
    'unsignedbiginteger',
    'boolean',
    'decimal',
    'float',
    'double',
    'enum',
    'date',
    'time',
    'year',
    'datetime',
    'datetimetz',
    'timestamp',
    'timestamptz',
    'uuid',
    'ulid',
    'json',
    'jsonb',
]);

const findGenericType = (typeId: string): DataType | null =>
    genericDataTypes.find((type) => type.id === typeId) ?? null;

const normalizeLaravelColumnType = (type: string): string =>
    type.trim().toLowerCase();

const mapLaravelTypeToDataType = (type: string): DataType | null => {
    const normalizedType = normalizeLaravelColumnType(type);

    switch (normalizedType) {
        case 'string':
            return findGenericType('varchar');
        case 'text':
        case 'mediumtext':
        case 'longtext':
            return findGenericType('text');
        case 'integer':
            return findGenericType('int');
        case 'tinyinteger':
            return findGenericType('smallint');
        case 'smallinteger':
            return findGenericType('smallint');
        case 'bigint':
        case 'biginteger':
            return findGenericType('bigint');
        case 'unsignedinteger':
            return findGenericType('int');
        case 'unsignedbiginteger':
            return findGenericType('bigint');
        case 'boolean':
            return findGenericType('boolean');
        case 'decimal':
            return findGenericType('decimal');
        case 'float':
            return findGenericType('float');
        case 'double':
            return findGenericType('double');
        case 'enum':
            return findGenericType('enum');
        case 'date':
            return findGenericType('date');
        case 'time':
            return findGenericType('time');
        case 'year':
            return findGenericType('smallint');
        case 'datetime':
            return findGenericType('datetime');
        case 'datetimetz':
        case 'timestamp':
        case 'timestamptz':
            return findGenericType('timestamp');
        case 'uuid':
            return findGenericType('uuid');
        case 'ulid':
            return findGenericType('varchar');
        case 'json':
        case 'jsonb':
            return findGenericType('json');
        default:
            return null;
    }
};

const formatDefaultValue = (value: unknown): string | null => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return null;
};

export interface MapColumnSnapshotResult {
    fieldPayload: PlannedFieldPayload | null;
    issues: ApplyValidationIssue[];
}

export const mapColumnSnapshotToField = (
    column: ColumnSnapshot
): MapColumnSnapshotResult => {
    const normalizedType = normalizeLaravelColumnType(column.type);
    const mappedType = mapLaravelTypeToDataType(column.type);

    if (
        !SUPPORTED_LARAVEL_COLUMN_TYPES.has(normalizedType) ||
        mappedType === null
    ) {
        return {
            fieldPayload: null,
            issues: [
                {
                    severity: 'error',
                    code: 'unknown_column_type',
                    message: `Unsupported Laravel column type "${column.type}" for column "${column.name}".`,
                    context: {
                        columnName: column.name,
                        columnType: column.type,
                    },
                },
            ],
        };
    }

    return {
        fieldPayload: {
            name: normalizeColumnName(column.name),
            type: mappedType,
            primaryKey: column.primary,
            unique: column.unique,
            nullable: column.nullable,
            increment: column.autoIncrement,
            characterMaximumLength:
                column.length !== null ? String(column.length) : null,
            precision: column.precision,
            scale: column.scale,
            default: formatDefaultValue(column.default),
        },
        issues: [],
    };
};
