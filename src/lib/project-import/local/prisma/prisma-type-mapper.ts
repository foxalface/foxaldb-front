import type { DataType } from '@/lib/data/data-types/data-types';
import { findDataTypeDataById } from '@/lib/data/data-types/data-types';
import { DatabaseType } from '@/lib/domain/database-type';
import type { PrismaAttribute } from './prisma-ast';

export interface PrismaNativeTypeInfo {
    name: string;
    length?: string;
    precision?: number;
    scale?: number;
}

export const parseNativeDbAttribute = (
    attribute?: PrismaAttribute
): PrismaNativeTypeInfo | null => {
    if (!attribute || !attribute.name.startsWith('@db.')) {
        return null;
    }

    const nativeName = attribute.name.slice(4);
    const args = attribute.args.map((arg) => arg.value);

    if (nativeName === 'Decimal' && args.length >= 2) {
        return {
            name: nativeName,
            precision: Number(args[0]),
            scale: Number(args[1]),
        };
    }

    if (
        (nativeName === 'VarChar' ||
            nativeName === 'Char' ||
            nativeName === 'NVarChar') &&
        args.length >= 1
    ) {
        return {
            name: nativeName,
            length: String(args[0]),
        };
    }

    return { name: nativeName };
};

export const mapPrismaScalarToDataType = (
    scalarType: string,
    targetDatabaseType: DatabaseType,
    nativeType: PrismaNativeTypeInfo | null
): {
    dataType: DataType;
    length?: string;
    precision?: number;
    scale?: number;
} => {
    if (nativeType) {
        const mapped = mapNativeType(nativeType, targetDatabaseType);
        if (mapped) {
            return mapped;
        }
    }

    const typeId = mapScalarTypeId(scalarType, targetDatabaseType);
    const typeData = findDataTypeDataById(typeId, targetDatabaseType);

    return {
        dataType: {
            id: typeData?.id ?? typeId,
            name: typeData?.name ?? typeId,
        },
    };
};

const mapScalarTypeId = (
    scalarType: string,
    targetDatabaseType: DatabaseType
): string => {
    switch (scalarType) {
        case 'String':
            return 'varchar';
        case 'Boolean':
            return mapBooleanType(targetDatabaseType);
        case 'Int':
            return 'integer';
        case 'BigInt':
            return 'bigint';
        case 'Float':
            return mapFloatType(targetDatabaseType);
        case 'Decimal':
            return 'decimal';
        case 'DateTime':
            return mapDateTimeType(targetDatabaseType);
        case 'Json':
            return mapJsonType(targetDatabaseType);
        case 'Bytes':
            return mapBytesType(targetDatabaseType);
        default:
            return 'varchar';
    }
};

const mapBooleanType = (targetDatabaseType: DatabaseType): string => {
    if (targetDatabaseType === DatabaseType.SQL_SERVER) {
        return 'bit';
    }

    return 'boolean';
};

const mapFloatType = (targetDatabaseType: DatabaseType): string => {
    if (targetDatabaseType === DatabaseType.SQLITE) {
        return 'real';
    }

    return 'double';
};

const mapDateTimeType = (targetDatabaseType: DatabaseType): string => {
    switch (targetDatabaseType) {
        case DatabaseType.POSTGRESQL:
        case DatabaseType.COCKROACHDB:
            return 'timestamp without time zone';
        case DatabaseType.SQL_SERVER:
            return 'datetime2';
        case DatabaseType.SQLITE:
            return 'datetime';
        case DatabaseType.ORACLE:
            return 'timestamp';
        default:
            return 'datetime';
    }
};

const mapJsonType = (targetDatabaseType: DatabaseType): string => {
    switch (targetDatabaseType) {
        case DatabaseType.POSTGRESQL:
        case DatabaseType.COCKROACHDB:
            return 'jsonb';
        case DatabaseType.SQLITE:
            return 'text';
        default:
            return 'json';
    }
};

const mapBytesType = (targetDatabaseType: DatabaseType): string => {
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

const mapNativeType = (
    nativeType: PrismaNativeTypeInfo,
    targetDatabaseType: DatabaseType
): {
    dataType: DataType;
    length?: string;
    precision?: number;
    scale?: number;
} | null => {
    const resolve = (typeId: string) => {
        const typeData = findDataTypeDataById(typeId, targetDatabaseType);

        return {
            dataType: {
                id: typeData?.id ?? typeId,
                name: typeData?.name ?? typeId,
            },
            ...(nativeType.length ? { length: nativeType.length } : {}),
            ...(nativeType.precision !== undefined
                ? { precision: nativeType.precision }
                : {}),
            ...(nativeType.scale !== undefined
                ? { scale: nativeType.scale }
                : {}),
        };
    };

    switch (nativeType.name) {
        case 'VarChar':
        case 'NVarChar':
            return resolve('varchar');
        case 'Char':
            return resolve('char');
        case 'Text':
        case 'LongText':
        case 'MediumText':
        case 'TinyText':
            return resolve('text');
        case 'Uuid':
            return resolve('uuid');
        case 'Decimal':
            return resolve('decimal');
        case 'ByteA':
            return resolve(mapBytesType(targetDatabaseType));
        case 'Json':
        case 'JsonB':
            return resolve(mapJsonType(targetDatabaseType));
        case 'Boolean':
            return resolve(mapBooleanType(targetDatabaseType));
        case 'Int':
        case 'Integer':
            return resolve('integer');
        case 'BigInt':
            return resolve('bigint');
        case 'Float':
        case 'Double':
            return resolve(mapFloatType(targetDatabaseType));
        case 'DateTime':
        case 'Timestamp':
            return resolve(mapDateTimeType(targetDatabaseType));
        default:
            return null;
    }
};

export const mapEnumFieldType = (
    enumName: string,
    targetDatabaseType: DatabaseType
): DataType => {
    const fallback = findDataTypeDataById('varchar', targetDatabaseType);

    return {
        id: enumName,
        name: enumName,
        ...(fallback ? {} : {}),
    };
};
