import type {
    PrismaAttribute,
    PrismaAttributeArg,
    PrismaEnumBlock,
    PrismaEnumValue,
    PrismaFieldDefinition,
    PrismaModelBlock,
    PrismaSchemaDocument,
    PrismaValue,
} from './prisma-ast';
import { PRISMA_SCALAR_TYPES } from './prisma-constants';
import {
    PrismaSchemaTokenizer,
    extractTopLevelBlocks,
    type PrismaToken,
} from './prisma-schema-tokenizer';

export class PrismaSchemaParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PrismaSchemaParseError';
    }
}

export const parsePrismaSchema = (source: string): PrismaSchemaDocument => {
    const blocks = extractTopLevelBlocks(source);
    const document: PrismaSchemaDocument = {
        models: [],
        enums: [],
        unsupportedBlocks: [],
    };

    for (const block of blocks) {
        switch (block.kind) {
            case 'datasource':
                document.datasourceProvider = parseDatasourceProvider(
                    block.body
                );
                break;
            case 'model':
                document.models.push(parseModelBlock(block.name, block.body));
                break;
            case 'enum':
                document.enums.push(parseEnumBlock(block.name, block.body));
                break;
            case 'generator':
                break;
            case 'type':
                document.unsupportedBlocks.push(`type ${block.name}`);
                break;
            default:
                document.unsupportedBlocks.push(`${block.kind} ${block.name}`);
        }
    }

    return document;
};

export const parsePrismaSchemaDocument = (
    source: string
): PrismaSchemaDocument => {
    const document = parsePrismaSchema(source);

    return reclassifyDocumentFieldKinds(document);
};

const parseDatasourceProvider = (body: string): string | undefined => {
    const match = body.match(/provider\s*=\s*"([^"]+)"/);

    return match?.[1];
};

const parseModelBlock = (name: string, body: string): PrismaModelBlock => {
    const statements = splitBlockStatements(body);
    const fields: PrismaFieldDefinition[] = [];
    const blockAttributes: PrismaAttribute[] = [];
    let mapName: string | undefined;
    let documentation: string | undefined;

    for (const statement of statements) {
        const trimmed = statement.trim();

        if (!trimmed) {
            continue;
        }

        if (trimmed.startsWith('@@')) {
            const attribute = parseAttribute(trimmed);

            if (attribute.name === '@@map') {
                const mapped = readSingleStringArg(attribute);
                if (mapped) {
                    mapName = mapped;
                }
            } else {
                blockAttributes.push(attribute);
            }

            continue;
        }

        const docMatch = trimmed.match(/^\/\/\/\s*(.+)$/);
        if (docMatch) {
            documentation = docMatch[1].trim();
            continue;
        }

        fields.push(parseFieldDefinition(trimmed, documentation));
        documentation = undefined;
    }

    return {
        name,
        mapName,
        fields,
        blockAttributes,
        documentation,
    };
};

const parseEnumBlock = (name: string, body: string): PrismaEnumBlock => {
    const statements = splitBlockStatements(body);
    const values: PrismaEnumValue[] = [];
    let mapName: string | undefined;

    for (const statement of statements) {
        const trimmed = statement.trim();

        if (!trimmed || trimmed.startsWith('//')) {
            continue;
        }

        if (trimmed.startsWith('@@map')) {
            const attribute = parseAttribute(trimmed);
            mapName = readSingleStringArg(attribute);
            continue;
        }

        const valueMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
        if (!valueMatch) {
            continue;
        }

        const enumValue: PrismaEnumValue = { name: valueMatch[1] };
        const mapAttribute = trimmed.match(/@map\("([^"]+)"\)/);

        if (mapAttribute) {
            enumValue.mapValue = mapAttribute[1];
        }

        values.push(enumValue);
    }

    return { name, values, mapName };
};

const parseFieldDefinition = (
    statement: string,
    documentation?: string
): PrismaFieldDefinition => {
    const tokens = new PrismaSchemaTokenizer(statement).tokenize();
    const reader = new TokenReader(tokens);

    const nameToken = reader.expectIdentifier();
    const typeInfo = readFieldType(reader);

    const attributes: PrismaAttribute[] = [];

    while (!reader.isAtEnd()) {
        const token = reader.peek();

        if (token?.type === 'identifier' && token.value.startsWith('@')) {
            attributes.push(parseAttributeFromReader(reader));
            continue;
        }

        reader.advance();
    }

    const kind = resolveFieldKind(typeInfo.typeName);

    return {
        name: nameToken.value,
        typeName: typeInfo.typeName,
        kind,
        optional: typeInfo.optional,
        list: typeInfo.list,
        attributes,
        documentation,
    };
};

const resolveFieldKind = (typeName: string): PrismaFieldDefinition['kind'] => {
    if (PRISMA_SCALAR_TYPES.has(typeName)) {
        return 'scalar';
    }

    if (typeName === 'Unsupported') {
        return 'unsupported';
    }

    if (typeName[0] === typeName[0]?.toUpperCase()) {
        return 'enum';
    }

    return 'object';
};

class TokenReader {
    private index = 0;

    constructor(private readonly tokens: PrismaToken[]) {}

    peek(): PrismaToken | undefined {
        return this.tokens[this.index];
    }

    peekAhead(offset: number): PrismaToken | undefined {
        return this.tokens[this.index + offset];
    }

    advance(): PrismaToken {
        const token = this.tokens[this.index];
        this.index += 1;
        return token;
    }

    isAtEnd(): boolean {
        return this.peek()?.type === 'eof';
    }

    expectIdentifier(): PrismaToken {
        const token = this.advance();

        if (token.type !== 'identifier') {
            throw new PrismaSchemaParseError('Expected identifier.');
        }

        return token;
    }
}

const readFieldType = (
    reader: TokenReader
): { typeName: string; optional: boolean; list: boolean } => {
    const typeToken = reader.expectIdentifier();
    let optional = false;
    let list = false;

    while (!reader.isAtEnd()) {
        const token = reader.peek();

        if (token?.type === 'symbol' && token.value === '?') {
            optional = true;
            reader.advance();
            continue;
        }

        if (token?.type === 'symbol' && token.value === '[') {
            reader.advance();
            const close = reader.advance();
            if (close.type !== 'symbol' || close.value !== ']') {
                throw new PrismaSchemaParseError('Expected closing bracket.');
            }
            list = true;
            continue;
        }

        break;
    }

    return { typeName: typeToken.value, optional, list };
};

const parseAttribute = (statement: string): PrismaAttribute => {
    const tokens = new PrismaSchemaTokenizer(statement).tokenize();
    const reader = new TokenReader(tokens);

    return parseAttributeFromReader(reader);
};

const parseAttributeFromReader = (reader: TokenReader): PrismaAttribute => {
    const nameToken = reader.expectIdentifier();

    const args: PrismaAttributeArg[] = [];

    const next = reader.peek();

    if (next?.type === 'symbol' && next.value === '(') {
        reader.advance();
        args.push(...parseAttributeArgs(reader));
        const close = reader.advance();
        if (close.type !== 'symbol' || close.value !== ')') {
            throw new PrismaSchemaParseError('Expected closing parenthesis.');
        }
    }

    return { name: nameToken.value, args };
};

const parseAttributeArgs = (reader: TokenReader): PrismaAttributeArg[] => {
    const args: PrismaAttributeArg[] = [];

    while (!reader.isAtEnd()) {
        const token = reader.peek();

        if (token?.type === 'symbol' && token.value === ')') {
            break;
        }

        if (token?.type === 'symbol' && token.value === ',') {
            reader.advance();
            continue;
        }

        const nameToken = reader.peek();

        if (nameToken?.type === 'identifier') {
            const lookahead = reader.peekAhead(1);
            if (lookahead?.type === 'symbol' && lookahead.value === ':') {
                reader.advance();
                reader.advance();
                args.push({
                    name: nameToken.value,
                    value: readValue(reader),
                });
                continue;
            }
        }

        args.push({ value: readValue(reader) });
    }

    return args;
};

const readValue = (reader: TokenReader): PrismaValue => {
    const token = reader.peek();

    if (!token || token.type === 'eof') {
        throw new PrismaSchemaParseError('Expected attribute value.');
    }

    if (token.type === 'string') {
        reader.advance();
        return token.value;
    }

    if (token.type === 'number') {
        reader.advance();
        return Number(token.value);
    }

    if (token.type === 'identifier') {
        const next = reader.peekAhead(1);
        if (next?.type === 'symbol' && next.value === '(') {
            reader.advance();
            reader.advance();
            skipBalancedArguments(reader);
            const close = reader.advance();
            if (close.type !== 'symbol' || close.value !== ')') {
                throw new PrismaSchemaParseError(
                    'Expected closing parenthesis.'
                );
            }
            return token.value;
        }

        reader.advance();
        return token.value;
    }

    if (token.type === 'symbol' && token.value === '[') {
        reader.advance();
        const values: PrismaValue[] = [];

        while (!reader.isAtEnd()) {
            const current = reader.peek();
            if (current?.type === 'symbol' && current.value === ']') {
                reader.advance();
                break;
            }

            if (current?.type === 'symbol' && current.value === ',') {
                reader.advance();
                continue;
            }

            values.push(readValue(reader));
        }

        return values;
    }

    throw new PrismaSchemaParseError('Unsupported attribute value.');
};

const skipBalancedArguments = (reader: TokenReader): void => {
    let depth = 0;

    while (!reader.isAtEnd()) {
        const token = reader.peek();

        if (token?.type === 'symbol' && token.value === '(') {
            depth += 1;
        }

        if (token?.type === 'symbol' && token.value === ')') {
            if (depth === 0) {
                return;
            }
            depth -= 1;
        }

        reader.advance();
    }
};

const readSingleStringArg = (
    attribute: PrismaAttribute
): string | undefined => {
    const first = attribute.args[0]?.value;

    return typeof first === 'string' ? first : undefined;
};

const splitBlockStatements = (body: string): string[] => {
    const normalizedBody = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const statements: string[] = [];
    let current = '';
    let depth = 0;
    let inString: string | null = null;

    for (let index = 0; index < normalizedBody.length; index += 1) {
        const char = normalizedBody[index];

        if (inString) {
            current += char;
            if (char === '\\') {
                current += normalizedBody[index + 1] ?? '';
                index += 1;
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

        if (char === '/' && normalizedBody[index + 1] === '/') {
            const lineEnd = normalizedBody.indexOf('\n', index);
            const commentEnd = lineEnd === -1 ? normalizedBody.length : lineEnd;
            current += normalizedBody.slice(index, commentEnd);
            index = commentEnd - 1;
            continue;
        }

        if (char === '/' && normalizedBody[index + 1] === '*') {
            const end = normalizedBody.indexOf('*/', index + 2);
            const commentEnd = end === -1 ? normalizedBody.length : end + 2;
            current += normalizedBody.slice(index, commentEnd);
            index = commentEnd - 1;
            continue;
        }

        if (char === '(' || char === '[' || char === '{') {
            depth += 1;
            current += char;
            continue;
        }

        if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
            current += char;
            continue;
        }

        if (char === '\n' && depth === 0) {
            if (current.trim()) {
                statements.push(current.trim());
            }
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim()) {
        statements.push(current.trim());
    }

    return statements;
};

export const classifyFieldKind = (
    typeName: string,
    enumNames: Set<string>
): PrismaFieldDefinition['kind'] => {
    if (PRISMA_SCALAR_TYPES.has(typeName)) {
        return 'scalar';
    }

    if (typeName === 'Unsupported') {
        return 'unsupported';
    }

    if (enumNames.has(typeName)) {
        return 'enum';
    }

    return 'object';
};

export const reclassifyDocumentFieldKinds = (
    document: PrismaSchemaDocument
): PrismaSchemaDocument => {
    const enumNames = new Set(
        document.enums.map((enumBlock) => enumBlock.name)
    );

    return {
        ...document,
        models: document.models.map((model) => ({
            ...model,
            fields: model.fields.map((field) => ({
                ...field,
                kind: classifyFieldKind(field.typeName, enumNames),
            })),
        })),
    };
};
