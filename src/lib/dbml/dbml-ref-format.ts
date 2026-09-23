export type DbmlRefFormat = 'inline' | 'standard';

export const DEFAULT_DBML_REF_FORMAT: DbmlRefFormat = 'standard';

export const getDbmlForRefFormat = (
    format: DbmlRefFormat,
    inlineDbml: string,
    standardDbml: string
): string => (format === 'inline' ? inlineDbml : standardDbml);
