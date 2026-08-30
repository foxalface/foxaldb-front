import type { DataType } from '@/lib/data/data-types/data-types';
import { findDataTypeDataById } from '@/lib/data/data-types/data-types';
import { DatabaseType } from '@/lib/domain/database-type';

export const mapRailsColumnType = (
    railsType: string,
    targetDatabaseType: DatabaseType,
    columnTypeOverride?: string
): DataType => {
    if (columnTypeOverride) {
        const mapped = mapExplicitColumnType(
            columnTypeOverride,
            targetDatabaseType
        );
        if (mapped) {
            return mapped;
        }
    }

    const typeId = mapRailsTypeId(railsType, targetDatabaseType);
    const typeData = findDataTypeDataById(typeId, targetDatabaseType);

    return {
        id: typeData?.id ?? typeId,
        name: typeData?.name ?? typeId,
    };
};

const mapExplicitColumnType = (
    columnType: string,
    targetDatabaseType: DatabaseType
): DataType | null => {
    const normalized = columnType.toLowerCase();

    if (normalized.includes('varchar') || normalized.includes('character')) {
        return toDataType('varchar', targetDatabaseType);
    }

    if (normalized === 'text' || normalized.includes('text')) {
        return toDataType('text', targetDatabaseType);
    }

    if (normalized.includes('int')) {
        return toDataType(
            normalized.includes('bigint') ? 'bigint' : 'integer',
            targetDatabaseType
        );
    }

    if (normalized.includes('bool')) {
        return toDataType(
            mapBooleanType(targetDatabaseType),
            targetDatabaseType
        );
    }

    if (normalized.includes('timestamp') || normalized.includes('datetime')) {
        return toDataType(
            mapDateTimeType(targetDatabaseType),
            targetDatabaseType
        );
    }

    if (normalized.includes('decimal') || normalized.includes('numeric')) {
        return toDataType('decimal', targetDatabaseType);
    }

    if (normalized.includes('json')) {
        return toDataType(mapJsonType(targetDatabaseType), targetDatabaseType);
    }

    if (normalized.includes('uuid')) {
        return toDataType(mapUuidType(targetDatabaseType), targetDatabaseType);
    }

    if (
        normalized.includes('blob') ||
        normalized.includes('bytea') ||
        normalized.includes('binary')
    ) {
        return toDataType(
            mapBinaryType(targetDatabaseType),
            targetDatabaseType
        );
    }

    return null;
};

const mapRailsTypeId = (
    railsType: string,
    targetDatabaseType: DatabaseType
): string => {
    switch (railsType) {
        case 'string':
            return 'varchar';
        case 'text':
            return 'text';
        case 'integer':
        case 'smallint':
            return 'integer';
        case 'bigint':
            return 'bigint';
        case 'float':
            return mapFloatType(targetDatabaseType);
        case 'decimal':
            return 'decimal';
        case 'boolean':
            return mapBooleanType(targetDatabaseType);
        case 'date':
            return 'date';
        case 'datetime':
        case 'timestamp':
            return mapDateTimeType(targetDatabaseType);
        case 'time':
            return 'time';
        case 'binary':
            return mapBinaryType(targetDatabaseType);
        case 'json':
            return mapJsonType(targetDatabaseType);
        case 'jsonb':
            return targetDatabaseType === DatabaseType.POSTGRESQL
                ? 'jsonb'
                : mapJsonType(targetDatabaseType);
        case 'uuid':
            return mapUuidType(targetDatabaseType);
        default:
            return 'varchar';
    }
};

const toDataType = (
    typeId: string,
    targetDatabaseType: DatabaseType
): DataType => {
    const typeData = findDataTypeDataById(typeId, targetDatabaseType);

    return {
        id: typeData?.id ?? typeId,
        name: typeData?.name ?? typeId,
    };
};

const mapBooleanType = (targetDatabaseType: DatabaseType): string =>
    targetDatabaseType === DatabaseType.SQL_SERVER ? 'bit' : 'boolean';

const mapFloatType = (targetDatabaseType: DatabaseType): string =>
    targetDatabaseType === DatabaseType.SQL_SERVER ? 'float' : 'double';

const mapDateTimeType = (targetDatabaseType: DatabaseType): string => {
    switch (targetDatabaseType) {
        case DatabaseType.MYSQL:
        case DatabaseType.MARIADB:
            return 'datetime';
        case DatabaseType.SQL_SERVER:
            return 'datetime2';
        case DatabaseType.ORACLE:
            return 'timestamp';
        default:
            return 'timestamp';
    }
};

const mapJsonType = (targetDatabaseType: DatabaseType): string => {
    switch (targetDatabaseType) {
        case DatabaseType.POSTGRESQL:
        case DatabaseType.COCKROACHDB:
            return 'jsonb';
        case DatabaseType.MYSQL:
        case DatabaseType.MARIADB:
            return 'json';
        case DatabaseType.SQL_SERVER:
            return 'nvarchar';
        default:
            return 'text';
    }
};

const mapBinaryType = (targetDatabaseType: DatabaseType): string => {
    switch (targetDatabaseType) {
        case DatabaseType.POSTGRESQL:
        case DatabaseType.COCKROACHDB:
            return 'bytea';
        case DatabaseType.SQL_SERVER:
            return 'varbinary';
        default:
            return 'blob';
    }
};

const mapUuidType = (targetDatabaseType: DatabaseType): string => {
    switch (targetDatabaseType) {
        case DatabaseType.POSTGRESQL:
        case DatabaseType.COCKROACHDB:
            return 'uuid';
        case DatabaseType.SQL_SERVER:
            return 'uniqueidentifier';
        default:
            return 'char';
    }
};
