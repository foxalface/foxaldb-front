import type {
    RailsColumnDefinition,
    RailsColumnOptions,
    RailsForeignKeyDefinition,
    RailsIndexDefinition,
    RailsSchemaDocument,
    RailsTableDefinition,
    RailsTableOptions,
} from './rails-schema-ast';
import { RailsRubyScanner } from './rails-ruby-scanner';

export class RailsSchemaParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RailsSchemaParseError';
    }
}

const COLUMN_HELPERS = new Set([
    'string',
    'text',
    'integer',
    'bigint',
    'smallint',
    'float',
    'decimal',
    'boolean',
    'date',
    'datetime',
    'timestamp',
    'time',
    'binary',
    'json',
    'jsonb',
    'uuid',
    'references',
    'belongs_to',
    'column',
]);

const measureDelimiterDepth = (value: string): number => {
    let depth = 0;
    let inString: '"' | "'" | null = null;

    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];

        if (inString) {
            if (char === '\\') {
                index += 1;
                continue;
            }
            if (char === inString) {
                inString = null;
            }
            continue;
        }

        if (char === '#') {
            break;
        }

        if (char === '"' || char === "'") {
            inString = char;
            continue;
        }

        if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
        }
    }

    return depth;
};

const splitStatements = (body: string): string[] => {
    const lines = body
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'));

    const statements: string[] = [];
    let current = '';

    for (const line of lines) {
        current = current.length === 0 ? line : `${current} ${line}`;
        const depth = measureDelimiterDepth(current);
        const continuesOnNextLine = line.endsWith(',');

        if (depth === 0 && !continuesOnNextLine) {
            statements.push(current.trim());
            current = '';
        }
    }

    if (current.trim().length > 0) {
        statements.push(current.trim());
    }

    return statements;
};

const readQuotedStrings = (value: string): string[] => {
    const matches = value.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g) ?? [];

    return matches.map((entry) => {
        const inner = entry.slice(1, -1);

        return inner.replace(/\\(.)/g, '$1');
    });
};

const readStringArray = (value: string): string[] => {
    const arrayStart = value.indexOf('[');
    if (arrayStart === -1) {
        return [];
    }

    const scanner = new RailsRubyScanner(value);
    const arrayBody = scanner.extractBalanced(arrayStart, '[', ']');

    if (!arrayBody) {
        return [];
    }

    return readQuotedStrings(arrayBody);
};

const parseSymbol = (value: string): string | undefined => {
    const trimmed = value.trim();
    const symbolMatch = trimmed.match(/^:([A-Za-z_][\w]*)$/);
    if (symbolMatch) {
        return symbolMatch[1];
    }

    const quotedSymbolMatch = trimmed.match(/^:"([^"]+)"$/);
    return quotedSymbolMatch?.[1];
};

const parseLiteral = (
    value: string
): string | number | boolean | null | undefined => {
    const trimmed = value.trim();

    if (trimmed === 'nil' || trimmed === 'null') {
        return null;
    }

    if (trimmed === 'true') {
        return true;
    }

    if (trimmed === 'false') {
        return false;
    }

    const symbol = parseSymbol(trimmed);
    if (symbol) {
        return symbol;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
        return Number(trimmed);
    }

    const quoted = readQuotedStrings(trimmed);
    if (quoted.length === 1 && trimmed.startsWith('"')) {
        return quoted[0];
    }

    return undefined;
};

const parseOptionPairs = (args: string): Record<string, unknown> => {
    const options: Record<string, unknown> = {};
    const openIndex = args.indexOf('{');
    const scanner = new RailsRubyScanner(args);
    const hashBody =
        openIndex !== -1 ? scanner.extractBalanced(openIndex, '{', '}') : null;

    const source = hashBody ?? args;
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    let inString: '"' | "'" | null = null;

    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];

        if (inString) {
            current += char;
            if (char === '\\') {
                const next = source[index + 1];
                if (next !== undefined) {
                    current += next;
                    index += 1;
                }
                continue;
            }
            if (char === inString) {
                inString = null;
            }
            continue;
        }

        if (char === '"' || char === "'") {
            inString = char;
            current += char;
            continue;
        }

        if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
        }

        if (char === ',' && depth === 0) {
            parts.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim().length > 0) {
        parts.push(current.trim());
    }

    for (const part of parts) {
        const colonIndex = part.indexOf(':');
        if (colonIndex === -1) {
            continue;
        }

        const key = part.slice(0, colonIndex).trim();
        const rawValue = part.slice(colonIndex + 1).trim();

        if (key.length === 0) {
            continue;
        }

        if (rawValue.startsWith('->')) {
            options[key] = rawValue;
            continue;
        }

        const literal = parseLiteral(rawValue);
        options[key] = literal ?? rawValue;
    }

    return options;
};

const toColumnOptions = (
    options: Record<string, unknown>
): RailsColumnOptions => ({
    ...(options.null !== undefined ? { null: options.null === true } : {}),
    ...(options.default !== undefined
        ? {
              default: options.default as string | number | boolean | null,
          }
        : {}),
    ...(typeof options.limit === 'number' ? { limit: options.limit } : {}),
    ...(typeof options.precision === 'number'
        ? { precision: options.precision }
        : {}),
    ...(typeof options.scale === 'number' ? { scale: options.scale } : {}),
    ...(typeof options.comment === 'string'
        ? { comment: options.comment }
        : {}),
    ...(typeof options.collation === 'string'
        ? { collation: options.collation }
        : {}),
    ...(options.primary_key === true || options.primaryKey === true
        ? { primaryKey: true }
        : {}),
    ...(options.foreign_key !== undefined
        ? {
              foreignKey:
                  typeof options.foreign_key === 'string'
                      ? options.foreign_key
                      : options.foreign_key === true,
          }
        : {}),
});

const toTableOptions = (
    options: Record<string, unknown>
): RailsTableOptions => ({
    ...(options.id === false ? { id: false } : {}),
    ...(typeof options.primary_key === 'string'
        ? { primaryKey: options.primary_key }
        : {}),
    ...(options.force !== undefined
        ? {
              force:
                  typeof options.force === 'string' ||
                  typeof options.force === 'boolean'
                      ? options.force
                      : String(options.force),
          }
        : {}),
    ...(typeof options.comment === 'string'
        ? { comment: options.comment }
        : {}),
});

const parseTableOptions = (args: string): RailsTableOptions => {
    const options: Record<string, unknown> = {};

    if (args.includes('id: false')) {
        options.id = false;
    }

    const primaryKeyMatch = args.match(/primary_key:\s*"([^"]+)"/);
    if (primaryKeyMatch) {
        options.primary_key = primaryKeyMatch[1];
    }

    const commentMatch = args.match(/comment:\s*"([^"]+)"/);
    if (commentMatch) {
        options.comment = commentMatch[1];
    }

    const forceSymbolMatch = args.match(/force:\s*:([A-Za-z_]\w*)/);
    if (forceSymbolMatch) {
        options.force = forceSymbolMatch[1];
    }

    return toTableOptions({ ...options, ...parseOptionPairs(args) });
};

const parseColumnStatement = (
    statement: string
): RailsColumnDefinition | null => {
    const match = statement.match(/^t\.([A-Za-z_]\w*)\s+(.*)$/s);

    if (!match) {
        return null;
    }

    const method = match[1];
    const args = match[2].trim();

    if (!COLUMN_HELPERS.has(method)) {
        return null;
    }

    if (method === 'references' || method === 'belongs_to') {
        const strings = readQuotedStrings(args);
        const symbolMatch = args.match(/:([A-Za-z_]\w*)/);
        const referenceName = strings[0] ?? symbolMatch?.[1];

        if (!referenceName) {
            return null;
        }

        const options = toColumnOptions(parseOptionPairs(args));
        const columnName = `${referenceName.replace(/_id$/, '')}_id`;

        return {
            name: columnName,
            type: 'bigint',
            options,
        };
    }

    if (method === 'column') {
        const strings = readQuotedStrings(args);
        const typeMatch = args.match(/,\s*"([^"]+)"/);
        const name = strings[0];
        const type = typeMatch?.[1];

        if (!name || !type) {
            return null;
        }

        return {
            name,
            type,
            options: toColumnOptions(parseOptionPairs(args)),
        };
    }

    const strings = readQuotedStrings(args);
    const name = strings[0];

    if (!name) {
        return null;
    }

    return {
        name,
        type: method,
        options: toColumnOptions(parseOptionPairs(args)),
    };
};

const parseInlineIndex = (
    statement: string,
    tableName: string
): RailsIndexDefinition | null => {
    const match = statement.match(/^t\.index\s+(.*)$/s);
    if (!match) {
        return null;
    }

    const args = match[1].trim();
    const columns = readStringArray(args);
    const options = parseOptionPairs(args);

    if (columns.length === 0) {
        return null;
    }

    return {
        tableName,
        columns,
        unique: options.unique === true,
        name: typeof options.name === 'string' ? options.name : undefined,
    };
};

const parseCreateTable = (
    source: string,
    startIndex: number,
    scanner: RailsRubyScanner
): { table: RailsTableDefinition; endIndex: number } | null => {
    const slice = source.slice(startIndex);
    const match = slice.match(/^create_table\s+"([^"]+)"\s*(.*?)\s+do\b/s);

    if (!match) {
        return null;
    }

    const tableName = match[1];
    const args = match[2] ?? '';
    const relativeDoIndex = match[0].search(/\bdo\b/);

    if (relativeDoIndex === -1) {
        return null;
    }

    const doIndex = startIndex + relativeDoIndex;
    const endIndex = scanner.findMatchingDoEnd(doIndex);

    if (endIndex === -1) {
        return null;
    }

    const lineEnd = source.indexOf('\n', doIndex);
    const bodyStart = lineEnd === -1 ? doIndex + 2 : lineEnd + 1;
    const body = source.slice(bodyStart, endIndex);
    const statements = splitStatements(body);
    const columns: RailsColumnDefinition[] = [];
    const inlineIndexes: RailsIndexDefinition[] = [];

    for (const statement of statements) {
        const trimmed = statement.trim();

        if (trimmed.startsWith('t.index')) {
            const index = parseInlineIndex(trimmed, tableName);
            if (index) {
                inlineIndexes.push(index);
            }
            continue;
        }

        const column = parseColumnStatement(trimmed);
        if (column) {
            columns.push(column);
        }
    }

    return {
        table: {
            name: tableName,
            options: parseTableOptions(args),
            columns,
            inlineIndexes,
        },
        endIndex: endIndex + 3,
    };
};

const parseAddIndex = (statement: string): RailsIndexDefinition | null => {
    const match = statement.match(/^add_index\s+"([^"]+)"\s*,\s*(.*)$/s);
    if (!match) {
        return null;
    }

    const tableName = match[1];
    const args = match[2] ?? '';
    const columns = readStringArray(args);
    const options = parseOptionPairs(args);

    if (columns.length === 0) {
        return null;
    }

    return {
        tableName,
        columns,
        unique: options.unique === true,
        name: typeof options.name === 'string' ? options.name : undefined,
    };
};

const parseAddForeignKey = (
    statement: string
): RailsForeignKeyDefinition | null => {
    const match = statement.match(
        /^add_foreign_key\s+"([^"]+)"\s*,\s*"([^"]+)"(.*)$/s
    );
    if (!match) {
        return null;
    }

    const options = parseOptionPairs(match[3] ?? '');

    return {
        fromTable: match[1],
        toTable: match[2],
        column: typeof options.column === 'string' ? options.column : undefined,
        primaryKey:
            typeof options.primary_key === 'string'
                ? options.primary_key
                : undefined,
        onDelete:
            typeof options.on_delete === 'string'
                ? options.on_delete
                : undefined,
        onUpdate:
            typeof options.on_update === 'string'
                ? options.on_update
                : undefined,
        name: typeof options.name === 'string' ? options.name : undefined,
    };
};

const extractSchemaBody = (
    source: string,
    scanner: RailsRubyScanner
): string | null => {
    const defineIndex = source.search(/\.define\s*\(/);
    if (defineIndex === -1) {
        return null;
    }

    const doIndex = source.indexOf('do', defineIndex);
    if (doIndex === -1) {
        return null;
    }

    const endIndex = scanner.findMatchingDoEnd(doIndex);
    if (endIndex === -1) {
        return null;
    }

    return source.slice(doIndex + 2, endIndex);
};

const parseVersion = (source: string): string | undefined => {
    const match = source.match(/version:\s*([0-9_]+)/);
    return match?.[1];
};

export const parseRailsSchema = (source: string): RailsSchemaDocument => {
    if (!source.includes('ActiveRecord::Schema')) {
        throw new RailsSchemaParseError(
            'The submitted file does not appear to be a Rails schema.rb dump.'
        );
    }

    const scanner = new RailsRubyScanner(source);
    const body = extractSchemaBody(source, scanner);

    if (!body) {
        throw new RailsSchemaParseError(
            'Could not locate the ActiveRecord::Schema definition block.'
        );
    }

    const bodyScanner = new RailsRubyScanner(body);

    const document: RailsSchemaDocument = {
        version: parseVersion(source),
        tables: [],
        indexes: [],
        foreignKeys: [],
    };

    let index = 0;

    while (index < body.length) {
        const createTableIndex = body.indexOf('create_table', index);
        const addIndexIndex = body.indexOf('add_index', index);
        const addForeignKeyIndex = body.indexOf('add_foreign_key', index);

        const candidates = [
            createTableIndex,
            addIndexIndex,
            addForeignKeyIndex,
        ].filter((value) => value !== -1);

        if (candidates.length === 0) {
            break;
        }

        const nextIndex = Math.min(...candidates);

        if (nextIndex === createTableIndex) {
            const parsed = parseCreateTable(body, nextIndex, bodyScanner);
            if (parsed) {
                document.tables.push(parsed.table);
                index = parsed.endIndex;
                continue;
            }
        }

        if (nextIndex === addIndexIndex) {
            const statementEnd = body.indexOf('\n', nextIndex);
            const statement = body
                .slice(
                    nextIndex,
                    statementEnd === -1 ? body.length : statementEnd
                )
                .trim();
            const parsed = parseAddIndex(statement);
            if (parsed) {
                document.indexes.push(parsed);
            }
            index = nextIndex + 9;
            continue;
        }

        if (nextIndex === addForeignKeyIndex) {
            const statementEnd = body.indexOf('\n', nextIndex);
            const statement = body
                .slice(
                    nextIndex,
                    statementEnd === -1 ? body.length : statementEnd
                )
                .trim();
            const parsed = parseAddForeignKey(statement);
            if (parsed) {
                document.foreignKeys.push(parsed);
            }
            index = nextIndex + 15;
            continue;
        }

        index = nextIndex + 1;
    }

    return document;
};
