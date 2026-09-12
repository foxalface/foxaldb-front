import type { DBField } from '@/lib/domain/db-field';
import { DatabaseType } from '@/lib/domain/database-type';
import type { PrismaDatasourceProvider } from './prisma-export-capability';

export type PrismaTypeMappingKind = 'exact' | 'lossy' | 'unsupported';

export interface PrismaTypeMapping {
    scalar: string;
    nativeAnnotation?: string;
    kind: PrismaTypeMappingKind;
}

const SPATIAL_TYPE_IDS = new Set([
    'geometry',
    'point',
    'linestring',
    'polygon',
    'multipoint',
    'multilinestring',
    'multipolygon',
    'geometrycollection',
    'geography',
]);

const normalizeTypeId = (typeId: string): string => typeId.toLowerCase().trim();

export const providerSupportsArrays = (
    provider: PrismaDatasourceProvider
): boolean => provider === 'postgresql' || provider === 'cockroachdb';

const buildNativeAnnotation = (name: string, args?: string): string =>
    args ? `@db.${name}(${args})` : `@db.${name}`;

export const mapFieldToPrismaType = (
    field: DBField,
    databaseType: DatabaseType,
    provider: PrismaDatasourceProvider,
    enumTypeNames: ReadonlySet<string>
): PrismaTypeMapping => {
    const typeId = normalizeTypeId(field.type.id);
    const typeName = normalizeTypeId(field.type.name);

    if (
        enumTypeNames.has(field.type.name) ||
        enumTypeNames.has(field.type.id)
    ) {
        const enumName = field.type.name;

        return {
            scalar: enumName,
            kind: 'exact',
        };
    }

    if (field.isArray) {
        if (!providerSupportsArrays(provider)) {
            return { scalar: 'Unsupported', kind: 'unsupported' };
        }
    }

    if (SPATIAL_TYPE_IDS.has(typeId) || SPATIAL_TYPE_IDS.has(typeName)) {
        return { scalar: 'Unsupported', kind: 'unsupported' };
    }

    const mapping = mapScalarType(
        typeId,
        typeName,
        field,
        provider,
        databaseType
    );

    if (mapping.kind === 'unsupported') {
        return mapping;
    }

    if (field.isArray && providerSupportsArrays(provider)) {
        return {
            ...mapping,
            scalar: `${mapping.scalar}[]`,
        };
    }

    return mapping;
};

const mapScalarType = (
    typeId: string,
    typeName: string,
    field: DBField,
    provider: PrismaDatasourceProvider,
    databaseType: DatabaseType
): PrismaTypeMapping => {
    const id = typeId || typeName;

    if (
        id === 'int' ||
        id === 'integer' ||
        id === 'tinyint' ||
        id === 'smallint' ||
        id === 'mediumint' ||
        id === 'serial' ||
        id === 'int4'
    ) {
        return mapIntegerNative(id, field, provider);
    }

    if (id === 'bigint' || id === 'bigserial' || id === 'int8') {
        return { scalar: 'BigInt', kind: 'exact' };
    }

    if (
        id === 'varchar' ||
        id === 'nvarchar' ||
        id === 'varchar2' ||
        id === 'character varying' ||
        id === 'nvarchar2'
    ) {
        return mapStringNative('VarChar', field, provider);
    }

    if (id === 'char' || id === 'nchar' || id === 'character') {
        return mapStringNative('Char', field, provider);
    }

    if (
        id === 'text' ||
        id === 'tinytext' ||
        id === 'mediumtext' ||
        id === 'longtext' ||
        id === 'ntext' ||
        id === 'clob'
    ) {
        return mapTextNative(id, field, provider);
    }

    if (id === 'boolean' || id === 'bool' || id === 'bit') {
        return mapBooleanNative(provider);
    }

    if (id === 'decimal' || id === 'numeric' || id === 'number') {
        return mapDecimalNative(field, provider);
    }

    if (id === 'float' || id === 'real') {
        return mapFloatNative(provider);
    }

    if (id === 'double' || id === 'double precision') {
        return mapDoubleNative(provider);
    }

    if (id === 'date') {
        return mapDateNative(provider);
    }

    if (id === 'datetime' || id === 'datetime2' || id === 'smalldatetime') {
        return mapDateTimeNative(field, provider, false);
    }

    if (
        id === 'timestamp' ||
        id === 'timestamp without time zone' ||
        id === 'timestamp with local time zone'
    ) {
        return mapDateTimeNative(field, provider, false);
    }

    if (
        id === 'timestamptz' ||
        id === 'timestamp with time zone' ||
        id === 'datetimeoffset'
    ) {
        return mapDateTimeNative(field, provider, true);
    }

    if (id === 'time' || id === 'timetz') {
        return { scalar: 'Unsupported', kind: 'unsupported' };
    }

    if (id === 'uuid' || id === 'uniqueidentifier') {
        return mapUuidNative(provider);
    }

    if (id === 'json') {
        return mapJsonNative(false, provider);
    }

    if (id === 'jsonb') {
        return mapJsonNative(true, provider);
    }

    if (
        id === 'binary' ||
        id === 'varbinary' ||
        id === 'blob' ||
        id === 'tinyblob' ||
        id === 'mediumblob' ||
        id === 'longblob' ||
        id === 'bytea' ||
        id === 'image'
    ) {
        return mapBytesNative(id, provider);
    }

    if (
        databaseType === DatabaseType.ORACLE ||
        databaseType === DatabaseType.CLICKHOUSE
    ) {
        return { scalar: 'Unsupported', kind: 'unsupported' };
    }

    return { scalar: 'Unsupported', kind: 'unsupported' };
};

const mapIntegerNative = (
    id: string,
    _field: DBField,
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'mysql' && (id === 'tinyint' || id === 'smallint')) {
        return {
            scalar: 'Int',
            nativeAnnotation: buildNativeAnnotation(
                id === 'tinyint' ? 'TinyInt' : 'SmallInt'
            ),
            kind: 'lossy',
        };
    }

    return { scalar: 'Int', kind: 'exact' };
};

const mapStringNative = (
    nativeName: 'VarChar' | 'Char',
    field: DBField,
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    const length = field.characterMaximumLength;

    if (
        provider === 'postgresql' ||
        provider === 'cockroachdb' ||
        provider === 'mysql' ||
        provider === 'sqlserver'
    ) {
        if (length) {
            return {
                scalar: 'String',
                nativeAnnotation: buildNativeAnnotation(nativeName, length),
                kind: 'exact',
            };
        }
    }

    return { scalar: 'String', kind: 'exact' };
};

const mapTextNative = (
    id: string,
    _field: DBField,
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'mysql') {
        const nativeMap: Record<string, string> = {
            tinytext: 'TinyText',
            mediumtext: 'MediumText',
            longtext: 'LongText',
            text: 'Text',
        };
        const native = nativeMap[id] ?? 'Text';

        return {
            scalar: 'String',
            nativeAnnotation: buildNativeAnnotation(native),
            kind: 'exact',
        };
    }

    if (
        provider === 'postgresql' ||
        provider === 'cockroachdb' ||
        provider === 'sqlserver'
    ) {
        return {
            scalar: 'String',
            nativeAnnotation: buildNativeAnnotation('Text'),
            kind: 'exact',
        };
    }

    return { scalar: 'String', kind: 'lossy' };
};

const mapBooleanNative = (
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'sqlserver') {
        return {
            scalar: 'Boolean',
            nativeAnnotation: buildNativeAnnotation('Bit'),
            kind: 'lossy',
        };
    }

    return { scalar: 'Boolean', kind: 'exact' };
};

const mapDecimalNative = (
    field: DBField,
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    const precision = field.precision;
    const scale = field.scale;

    if (
        precision !== null &&
        precision !== undefined &&
        scale !== null &&
        scale !== undefined &&
        (provider === 'postgresql' ||
            provider === 'cockroachdb' ||
            provider === 'mysql' ||
            provider === 'sqlserver')
    ) {
        return {
            scalar: 'Decimal',
            nativeAnnotation: buildNativeAnnotation(
                'Decimal',
                `${precision}, ${scale}`
            ),
            kind: 'exact',
        };
    }

    return { scalar: 'Decimal', kind: 'exact' };
};

const mapFloatNative = (
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'sqlite') {
        return {
            scalar: 'Float',
            nativeAnnotation: buildNativeAnnotation('Real'),
            kind: 'exact',
        };
    }

    return { scalar: 'Float', kind: 'exact' };
};

const mapDoubleNative = (
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'mysql') {
        return {
            scalar: 'Float',
            nativeAnnotation: buildNativeAnnotation('Double'),
            kind: 'exact',
        };
    }

    return { scalar: 'Float', kind: 'lossy' };
};

const mapDateNative = (
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'postgresql' || provider === 'cockroachdb') {
        return {
            scalar: 'DateTime',
            nativeAnnotation: buildNativeAnnotation('Date'),
            kind: 'exact',
        };
    }

    return { scalar: 'DateTime', kind: 'lossy' };
};

const mapDateTimeNative = (
    field: DBField,
    provider: PrismaDatasourceProvider,
    withTimezone: boolean
): PrismaTypeMapping => {
    if (provider === 'postgresql' || provider === 'cockroachdb') {
        if (withTimezone) {
            return {
                scalar: 'DateTime',
                nativeAnnotation: buildNativeAnnotation('Timestamptz'),
                kind: 'exact',
            };
        }

        const precision = field.precision ?? field.scale;

        if (precision !== null && precision !== undefined) {
            return {
                scalar: 'DateTime',
                nativeAnnotation: buildNativeAnnotation(
                    'Timestamp',
                    String(precision)
                ),
                kind: 'exact',
            };
        }

        return {
            scalar: 'DateTime',
            nativeAnnotation: buildNativeAnnotation('Timestamp'),
            kind: 'exact',
        };
    }

    if (provider === 'mysql') {
        return {
            scalar: 'DateTime',
            nativeAnnotation: buildNativeAnnotation('DateTime'),
            kind: 'exact',
        };
    }

    if (provider === 'sqlserver') {
        return {
            scalar: 'DateTime',
            nativeAnnotation: buildNativeAnnotation('DateTime2'),
            kind: 'lossy',
        };
    }

    return { scalar: 'DateTime', kind: 'lossy' };
};

const mapUuidNative = (
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'postgresql' || provider === 'cockroachdb') {
        return {
            scalar: 'String',
            nativeAnnotation: buildNativeAnnotation('Uuid'),
            kind: 'exact',
        };
    }

    if (provider === 'sqlserver') {
        return {
            scalar: 'String',
            nativeAnnotation: buildNativeAnnotation('UniqueIdentifier'),
            kind: 'exact',
        };
    }

    return { scalar: 'String', kind: 'lossy' };
};

const mapJsonNative = (
    isJsonb: boolean,
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'postgresql' || provider === 'cockroachdb') {
        return {
            scalar: 'Json',
            nativeAnnotation: buildNativeAnnotation(isJsonb ? 'JsonB' : 'Json'),
            kind: 'exact',
        };
    }

    return { scalar: 'Json', kind: 'exact' };
};

const mapBytesNative = (
    id: string,
    provider: PrismaDatasourceProvider
): PrismaTypeMapping => {
    if (provider === 'postgresql' || provider === 'cockroachdb') {
        return {
            scalar: 'Bytes',
            nativeAnnotation: buildNativeAnnotation('ByteA'),
            kind: 'exact',
        };
    }

    if (provider === 'mysql') {
        const nativeMap: Record<string, string> = {
            tinyblob: 'TinyBlob',
            blob: 'Blob',
            mediumblob: 'MediumBlob',
            longblob: 'LongBlob',
            binary: 'Binary',
            varbinary: 'VarBinary',
        };

        return {
            scalar: 'Bytes',
            nativeAnnotation: buildNativeAnnotation(nativeMap[id] ?? 'Blob'),
            kind: 'exact',
        };
    }

    if (provider === 'sqlserver') {
        return {
            scalar: 'Bytes',
            nativeAnnotation: buildNativeAnnotation('VarBinary'),
            kind: 'lossy',
        };
    }

    return { scalar: 'Bytes', kind: 'exact' };
};
