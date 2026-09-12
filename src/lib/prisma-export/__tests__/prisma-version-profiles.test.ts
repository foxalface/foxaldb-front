import { beforeEach, describe, expect, it } from 'vitest';
import { generatePrismaSchemaFromDiagram } from '../generate-prisma-schema-from-diagram';
import { stripVersionSpecificHeader } from '../prisma-schema-writer';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    makeDiagram,
    makeField,
    makeTable,
    resetIdCounter,
    typeRef,
} from './test-helpers';

describe('Prisma version profiles', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    const baseDiagram = () =>
        makeDiagram({
            databaseType: DatabaseType.POSTGRESQL,
            tables: [
                makeTable({
                    name: 'users',
                    fields: [
                        makeField({
                            name: 'id',
                            type: typeRef('integer'),
                            primaryKey: true,
                            increment: true,
                        }),
                    ],
                }),
            ],
        });

    it('v6 generator block uses prisma-client-js', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: baseDiagram(),
            version: '6',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('provider = "prisma-client-js"');
        expect(result.schema).not.toContain('provider = "prisma-client"');
        expect(result.schema).not.toContain('output   = "../generated/prisma"');
    });

    it('v6 datasource includes env DATABASE_URL', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: baseDiagram(),
            version: '6',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('url      = env("DATABASE_URL")');
    });

    it('v6 has no generator output requirement', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: baseDiagram(),
            version: '6',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('output   =');
    });

    it('v7 generator block uses prisma-client with output', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: baseDiagram(),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('provider = "prisma-client"');
        expect(result.schema).toContain('output   = "../generated/prisma"');
        expect(result.schema).not.toContain('provider = "prisma-client-js"');
    });

    it('v7 datasource has no url', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: baseDiagram(),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('url      = env("DATABASE_URL")');
        expect(result.schema).toContain('provider = "postgresql"');
    });

    it('v7 has no prisma-client-js', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: baseDiagram(),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('prisma-client-js');
    });

    it('same diagram core model semantics across v6 and v7', () => {
        const diagram = baseDiagram();
        const v6 = generatePrismaSchemaFromDiagram({ diagram, version: '6' });
        const v7 = generatePrismaSchemaFromDiagram({ diagram, version: '7' });

        expect(v6.success).toBe(true);
        expect(v7.success).toBe(true);
        if (!v6.success || !v7.success) return;

        expect(stripVersionSpecificHeader(v6.schema)).toBe(
            stripVersionSpecificHeader(v7.schema)
        );
    });

    it('deterministic v6 output', () => {
        const diagram = baseDiagram();
        const first = generatePrismaSchemaFromDiagram({
            diagram,
            version: '6',
        });
        const second = generatePrismaSchemaFromDiagram({
            diagram,
            version: '6',
        });

        expect(first.success).toBe(true);
        expect(second.success).toBe(true);
        if (!first.success || !second.success) return;

        expect(first.schema).toBe(second.schema);
    });

    it('deterministic v7 output', () => {
        const diagram = baseDiagram();
        const first = generatePrismaSchemaFromDiagram({
            diagram,
            version: '7',
        });
        const second = generatePrismaSchemaFromDiagram({
            diagram,
            version: '7',
        });

        expect(first.success).toBe(true);
        expect(second.success).toBe(true);
        if (!first.success || !second.success) return;

        expect(first.schema).toBe(second.schema);
    });
});
