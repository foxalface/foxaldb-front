const CAMEL_LOWER_BOUNDARY = /(?<=[a-z])(?=[A-Z])/g;
const CAMEL_UPPER_BOUNDARY = /(?<=[A-Z])(?=[A-Z][a-z])/g;
const NON_IDENTIFIER_CHARS = /[^a-z0-9_]+/g;
const COLLAPSED_UNDERSCORES = /_+/g;

const normalize = (name: string | null | undefined): string => {
    if (name == null) {
        return '';
    }

    let normalized = name.trim();
    normalized = normalized.replace(CAMEL_LOWER_BOUNDARY, '_');
    normalized = normalized.replace(CAMEL_UPPER_BOUNDARY, '_');
    normalized = normalized.toLowerCase();
    normalized = normalized.replace(NON_IDENTIFIER_CHARS, '_');
    normalized = normalized.replace(COLLAPSED_UNDERSCORES, '_');

    return normalized.replace(/^_+|_+$/g, '');
};

export const normalizeTableName = (name: string | null | undefined): string => {
    const normalized = normalize(name);

    return normalized !== '' ? normalized : 'unnamed';
};

export const normalizeColumnName = (
    name: string | null | undefined
): string => {
    const normalized = normalize(name);

    return normalized !== '' ? normalized : 'column';
};
