/** Sentinel used in tests to ensure schema source never leaks into errors or diagnostics. */
export const FOXALDB_DO_NOT_EXPOSE_PRISMA_SOURCE =
    'FOXALDB_DO_NOT_EXPOSE_PRISMA_SOURCE_SENTINEL_VALUE';

export const PRISMA_SCALAR_TYPES = new Set([
    'String',
    'Boolean',
    'Int',
    'BigInt',
    'Float',
    'Decimal',
    'DateTime',
    'Json',
    'Bytes',
]);

export const PRISMA_GENERATED_DEFAULTS = new Set([
    'autoincrement',
    'uuid',
    'cuid',
    'now',
]);
