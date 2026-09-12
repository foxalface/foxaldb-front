import type { DBField } from '@/lib/domain/db-field';
import { escapePrismaStringLiteral } from './prisma-escape';
import type { PrismaTypeMapping } from './prisma-type-mapper';

export type PrismaDefaultMapping =
    | { kind: 'value'; expression: string }
    | { kind: 'omitted'; reason: string };

const NOW_PATTERNS = new Set([
    'current_timestamp',
    'current_timestamp()',
    'now()',
    'now',
]);

const UUID_PATTERNS = new Set(['uuid()', 'gen_random_uuid()', 'newid()']);

const normalizeDefault = (value: string): string =>
    value.trim().replace(/\s+/g, ' ').toLowerCase();

const stripWrappingQuotes = (value: string): string => {
    const trimmed = value.trim();

    if (
        (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
};

export const mapFieldDefault = (
    field: DBField,
    typeMapping: PrismaTypeMapping
): PrismaDefaultMapping => {
    if (field.increment) {
        return { kind: 'value', expression: '@default(autoincrement())' };
    }

    const rawDefault = field.default?.trim();

    if (!rawDefault) {
        return { kind: 'omitted', reason: 'no default' };
    }

    const normalized = normalizeDefault(rawDefault);

    if (normalized === 'null') {
        return { kind: 'omitted', reason: 'null default' };
    }

    if (NOW_PATTERNS.has(normalized)) {
        if (
            typeMapping.scalar === 'DateTime' ||
            typeMapping.scalar === 'DateTime[]'
        ) {
            return { kind: 'value', expression: '@default(now())' };
        }

        return {
            kind: 'omitted',
            reason: 'CURRENT_TIMESTAMP on non-DateTime field',
        };
    }

    if (UUID_PATTERNS.has(normalized)) {
        return { kind: 'value', expression: '@default(uuid())' };
    }

    if (/^(true|false)$/i.test(rawDefault)) {
        return {
            kind: 'value',
            expression: `@default(${rawDefault.toLowerCase()})`,
        };
    }

    if (/^-?\d+(\.\d+)?$/.test(rawDefault)) {
        return { kind: 'value', expression: `@default(${rawDefault})` };
    }

    const unquoted = stripWrappingQuotes(rawDefault);

    if (
        (rawDefault.startsWith("'") && rawDefault.endsWith("'")) ||
        (rawDefault.startsWith('"') && rawDefault.endsWith('"'))
    ) {
        return {
            kind: 'value',
            expression: `@default(${escapePrismaStringLiteral(unquoted)})`,
        };
    }

    if (/^[a-zA-Z_][\w.]*\(.+\)$/.test(rawDefault)) {
        return {
            kind: 'omitted',
            reason: `unsupported SQL expression: ${rawDefault}`,
        };
    }

    return {
        kind: 'value',
        expression: `@default(${escapePrismaStringLiteral(rawDefault)})`,
    };
};
