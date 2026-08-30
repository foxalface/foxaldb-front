export type PrismaTokenType =
    | 'identifier'
    | 'string'
    | 'number'
    | 'symbol'
    | 'eof';

export interface PrismaToken {
    type: PrismaTokenType;
    value: string;
    position: number;
}

const SINGLE_CHAR_SYMBOLS = new Set([
    '{',
    '}',
    '(',
    ')',
    '[',
    ']',
    ':',
    ',',
    '?',
    '.',
]);

export class PrismaSchemaTokenizer {
    private index = 0;

    constructor(private readonly source: string) {}

    tokenize(): PrismaToken[] {
        const tokens: PrismaToken[] = [];

        while (this.index < this.source.length) {
            this.skipWhitespaceAndComments();

            if (this.index >= this.source.length) {
                break;
            }

            const position = this.index;
            const char = this.source[this.index];

            if (char === '"' || char === "'") {
                tokens.push({
                    type: 'string',
                    value: this.readQuotedString(char),
                    position,
                });
                continue;
            }

            if (
                /[0-9]/.test(char) ||
                (char === '-' && /[0-9]/.test(this.peek(1)))
            ) {
                tokens.push({
                    type: 'number',
                    value: this.readNumber(),
                    position,
                });
                continue;
            }

            if (char === '@') {
                const attributeName = this.readAttributeIdentifier();
                tokens.push({
                    type: 'identifier',
                    value: attributeName,
                    position,
                });
                continue;
            }

            if (/[A-Za-z_]/.test(char)) {
                tokens.push({
                    type: 'identifier',
                    value: this.readIdentifier(),
                    position,
                });
                continue;
            }

            if (SINGLE_CHAR_SYMBOLS.has(char)) {
                this.index += 1;
                tokens.push({ type: 'symbol', value: char, position });
                continue;
            }

            throw new Error(`Unexpected character at position ${position}.`);
        }

        tokens.push({ type: 'eof', value: '', position: this.index });

        return tokens;
    }

    private peek(offset = 0): string {
        return this.source[this.index + offset] ?? '';
    }

    private skipWhitespaceAndComments(): void {
        while (this.index < this.source.length) {
            const char = this.source[this.index];

            if (/\s/.test(char)) {
                this.index += 1;
                continue;
            }

            if (char === '/' && this.peek(1) === '/') {
                this.index += 2;
                while (
                    this.index < this.source.length &&
                    this.source[this.index] !== '\n'
                ) {
                    this.index += 1;
                }
                continue;
            }

            if (char === '/' && this.peek(1) === '*') {
                this.index += 2;
                while (
                    this.index < this.source.length &&
                    !(this.source[this.index] === '*' && this.peek(1) === '/')
                ) {
                    this.index += 1;
                }
                this.index += 2;
                continue;
            }

            break;
        }
    }

    private readQuotedString(quote: string): string {
        this.index += 1;
        let value = '';

        while (this.index < this.source.length) {
            const char = this.source[this.index];

            if (char === '\\') {
                const next = this.peek(1);
                value += next;
                this.index += 2;
                continue;
            }

            if (char === quote) {
                this.index += 1;
                return value;
            }

            value += char;
            this.index += 1;
        }

        throw new Error('Unterminated string literal.');
    }

    private readNumber(): string {
        const start = this.index;

        if (this.source[this.index] === '-') {
            this.index += 1;
        }

        while (
            this.index < this.source.length &&
            /[0-9]/.test(this.source[this.index])
        ) {
            this.index += 1;
        }

        if (this.source[this.index] === '.') {
            this.index += 1;
            while (
                this.index < this.source.length &&
                /[0-9]/.test(this.source[this.index])
            ) {
                this.index += 1;
            }
        }

        return this.source.slice(start, this.index);
    }

    private readIdentifier(): string {
        const start = this.index;

        while (
            this.index < this.source.length &&
            /[A-Za-z0-9_]/.test(this.source[this.index])
        ) {
            this.index += 1;
        }

        return this.source.slice(start, this.index);
    }

    private readAttributeIdentifier(): string {
        const start = this.index;
        this.index += 1;

        if (this.source[this.index] === '@') {
            this.index += 1;
        }

        while (
            this.index < this.source.length &&
            /[A-Za-z0-9_.]/.test(this.source[this.index])
        ) {
            this.index += 1;
        }

        return this.source.slice(start, this.index);
    }
}

export const findMatchingBrace = (
    source: string,
    openBraceIndex: number
): number => {
    let depth = 0;

    for (let index = openBraceIndex; index < source.length; index += 1) {
        const char = source[index];

        if (char === '"' || char === "'") {
            index = skipQuotedString(source, index);
            continue;
        }

        if (char === '/' && source[index + 1] === '/') {
            index = skipLineComment(source, index);
            continue;
        }

        if (char === '/' && source[index + 1] === '*') {
            index = skipBlockComment(source, index);
            continue;
        }

        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return index;
            }
        }
    }

    return -1;
};

const skipQuotedString = (source: string, start: number): number => {
    const quote = source[start];
    let index = start + 1;

    while (index < source.length) {
        if (source[index] === '\\') {
            index += 2;
            continue;
        }

        if (source[index] === quote) {
            return index;
        }

        index += 1;
    }

    return source.length - 1;
};

const skipLineComment = (source: string, start: number): number => {
    let index = start + 2;

    while (index < source.length && source[index] !== '\n') {
        index += 1;
    }

    return index;
};

const skipBlockComment = (source: string, start: number): number => {
    let index = start + 2;

    while (index < source.length - 1) {
        if (source[index] === '*' && source[index + 1] === '/') {
            return index + 1;
        }
        index += 1;
    }

    return source.length - 1;
};

export const extractTopLevelBlocks = (
    source: string
): Array<{ kind: string; name: string; body: string; start: number }> => {
    const blocks: Array<{
        kind: string;
        name: string;
        body: string;
        start: number;
    }> = [];
    const blockPattern =
        /\b(generator|datasource|model|enum|type)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g;

    let match: RegExpExecArray | null;

    while ((match = blockPattern.exec(source)) !== null) {
        const kind = match[1];
        const name = match[2];
        const openBraceIndex = match.index + match[0].length - 1;
        const closeBraceIndex = findMatchingBrace(source, openBraceIndex);

        if (closeBraceIndex === -1) {
            throw new Error(`Unclosed ${kind} block for ${name}.`);
        }

        blocks.push({
            kind,
            name,
            body: source.slice(openBraceIndex + 1, closeBraceIndex),
            start: match.index,
        });

        blockPattern.lastIndex = closeBraceIndex + 1;
    }

    return blocks;
};
