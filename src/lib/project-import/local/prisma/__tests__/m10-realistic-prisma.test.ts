import { describe, expect, it } from 'vitest';
import { parsePrismaSchemaDocument } from '../prisma-schema-parser';
import { buildDiagramFromPrismaSchema } from '../prisma-diagram-builder';
import { DatabaseType } from '@/lib/domain/database-type';
import { QA_PRISMA_SCHEMA } from './fixtures/m10-realistic-fixtures';

describe('M10.1 realistic Prisma schema', () => {
    it('parses exact QA schema with physical @@map tables and relation', () => {
        const document = parsePrismaSchemaDocument(QA_PRISMA_SCHEMA);
        const { diagram } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.MYSQL,
            'prisma'
        );

        const users = diagram.tables?.find((table) => table.name === 'users');
        const posts = diagram.tables?.find((table) => table.name === 'posts');

        expect(users?.fields.map((field) => field.name)).toEqual([
            'id',
            'email',
        ]);
        expect(posts?.fields.map((field) => field.name)).toEqual([
            'id',
            'user_id',
            'title',
        ]);
        expect(
            users?.fields.find((field) => field.name === 'id')?.type.id
        ).toBe('bigint');
        expect(
            users?.fields.find((field) => field.name === 'email')?.type.id
        ).toBe('varchar');
        expect(
            users?.fields.find((field) => field.name === 'email')
                ?.characterMaximumLength
        ).toBe('255');
        expect(
            posts?.fields.find((field) => field.name === 'user_id')?.type.id
        ).toBe('bigint');
        expect(
            posts?.fields.find((field) => field.name === 'title')
                ?.characterMaximumLength
        ).toBe('200');
        expect(diagram.relationships?.length).toBe(1);
        expect(diagram.relationships?.[0]?.onDelete).toBe('cascade');
    });

    it('parses realistic schema when model body uses carriage-return line endings', () => {
        const carriageReturnSchema = QA_PRISMA_SCHEMA.replace(/\n/g, '\r');
        const document = parsePrismaSchemaDocument(carriageReturnSchema);
        const { diagram } = buildDiagramFromPrismaSchema(
            document,
            DatabaseType.MYSQL,
            'prisma'
        );
        const users = diagram.tables?.find((table) => table.name === 'users');

        expect(users?.fields.map((field) => field.name)).toEqual([
            'id',
            'email',
        ]);
        expect(
            users?.fields.find((field) => field.name === 'id')?.type.id
        ).toBe('bigint');
        expect(
            users?.fields.find((field) => field.name === 'email')
                ?.characterMaximumLength
        ).toBe('255');
    });
});
