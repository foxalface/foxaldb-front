import { describe, expect, it } from 'vitest';
import {
    PrismaSchemaTokenizer,
    extractTopLevelBlocks,
    findMatchingBrace,
} from '../prisma-schema-tokenizer';

describe('PrismaSchemaTokenizer', () => {
    it('ignores line and block comments', () => {
        const source = `
// line comment
model User {
  /* block
     comment */ id Int @id
}
`;

        const tokens = new PrismaSchemaTokenizer(source).tokenize();
        const identifiers = tokens
            .filter((token) => token.type === 'identifier')
            .map((token) => token.value);

        expect(identifiers).toContain('model');
        expect(identifiers).toContain('User');
        expect(identifiers).not.toContain('comment');
    });

    it('reads escaped quotes inside strings', () => {
        const source = '@default("a\\"b")';
        const tokens = new PrismaSchemaTokenizer(source).tokenize();

        expect(
            tokens.some(
                (token) => token.type === 'string' && token.value === 'a"b'
            )
        ).toBe(true);
    });

    it('does not terminate blocks on braces inside comments or strings', () => {
        const source =
            'model User { id String @default("{ not a brace }") // { comment\n}';
        const openIndex = source.indexOf('{');
        const closeIndex = findMatchingBrace(source, openIndex);

        expect(closeIndex).toBe(source.lastIndexOf('}'));
    });
});

describe('extractTopLevelBlocks', () => {
    it('extracts multiline model and enum blocks', () => {
        const source = `
enum Role {
  USER
  ADMIN
}

model User {
  id Int @id
  role Role
}
`;

        const blocks = extractTopLevelBlocks(source);

        expect(blocks.map((block) => block.kind)).toEqual(['enum', 'model']);
        expect(blocks[1].name).toBe('User');
        expect(blocks[1].body).toContain('role Role');
    });

    it('fails safely on unclosed blocks', () => {
        expect(() => extractTopLevelBlocks('model User {')).toThrow(
            'Unclosed model block'
        );
    });
});
