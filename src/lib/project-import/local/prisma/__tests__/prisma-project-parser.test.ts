import { describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { ProjectImportInput } from '../../../project-execution-types';
import {
    FOXALDB_DO_NOT_EXPOSE_PRISMA_SOURCE,
    PrismaProjectParseFailedError,
    parsePrismaProject,
} from '../prisma-project-parser';
import { sentinelSchema, usersPostsSchema } from './fixtures/prisma-schemas';

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
    apiRequest: apiRequestMock,
}));

const baseInput = (
    content: string,
    rootPath = 'apps/api'
): ProjectImportInput => ({
    candidate: {
        framework: 'prisma',
        rootPath,
        relevantFiles: ['prisma/schema.prisma'],
        score: 12,
        confidence: 'high',
        evidence: [],
        parserLocation: 'local',
    },
    bundle: {
        framework: 'prisma',
        rootPath,
        files: [
            {
                relativePath: 'prisma/schema.prisma',
                content,
            },
            {
                relativePath:
                    'prisma/migrations/20240101000000_init/migration.sql',
                content: 'CREATE TABLE users (id INT PRIMARY KEY);',
            },
        ],
    },
    targetDatabaseType: DatabaseType.POSTGRESQL,
});

describe('parsePrismaProject', () => {
    it('returns diagram without retaining bundle source', async () => {
        const result = await parsePrismaProject(baseInput(usersPostsSchema));

        expect(result.framework).toBe('prisma');
        expect(result.diagram.tables?.length).toBeGreaterThan(0);
        expect(result).not.toHaveProperty('bundle');
        expect(JSON.stringify(result)).not.toContain('authorId Int');
    });

    it('never calls the remote project-import API', async () => {
        await parsePrismaProject(baseInput(usersPostsSchema));

        expect(apiRequestMock).not.toHaveBeenCalled();
    });

    it('does not expose schema source in diagnostics', async () => {
        const sentinel = FOXALDB_DO_NOT_EXPOSE_PRISMA_SOURCE;
        const result = await parsePrismaProject(
            baseInput(sentinelSchema(sentinel))
        );

        result.diagnostics.forEach((diagnostic) => {
            expect(diagnostic.message).not.toContain(sentinel);
            if (diagnostic.path) {
                expect(diagnostic.path).not.toContain(sentinel);
            }
        });
    });

    it('fails when schema.prisma is absent', async () => {
        const input = baseInput(usersPostsSchema);
        input.bundle.files = input.bundle.files.filter(
            (file) => !file.relativePath.endsWith('schema.prisma')
        );

        await expect(parsePrismaProject(input)).rejects.toBeInstanceOf(
            PrismaProjectParseFailedError
        );
    });

    it('fails on malformed schema', async () => {
        await expect(
            parsePrismaProject(
                baseInput(`
model Broken {
  id Int @id
`)
            )
        ).rejects.toBeInstanceOf(PrismaProjectParseFailedError);
    });
});
