import { beforeEach, describe, expect, it } from 'vitest';
import { generatePrismaSchemaFromDiagram } from '../generate-prisma-schema-from-diagram';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    makeDiagram,
    makeField,
    makePkIndex,
    makeRelationship,
    makeTable,
    resetIdCounter,
    typeRef,
} from './test-helpers';

const SCHEMA = 'foxaldb';
const bigint = () => typeRef('bigint');

const buildRealisticLaravelDiagram = () => {
    const usersId = 'table-users';
    const diagramsId = 'table-diagrams';
    const membersId = 'table-diagram-members';
    const sessionsId = 'table-sessions';
    const tokensId = 'table-personal-access-tokens';

    const usersPk = 'field-users-id';
    const diagramsPk = 'field-diagrams-id';
    const diagramsOwnerFk = 'field-diagrams-owner-id';
    const membersPk = 'field-members-id';
    const membersDiagramFk = 'field-members-diagram-id';
    const membersUserFk = 'field-members-user-id';
    const sessionsPk = 'field-sessions-id';
    const sessionsUserFk = 'field-sessions-user-id';
    const tokensPk = 'field-tokens-id';
    const tokensUserFk = 'field-tokens-user-id';

    const tables = [
        makeTable({
            id: usersId,
            name: 'users',
            schema: SCHEMA,
            fields: [
                makeField({
                    id: usersPk,
                    name: 'id',
                    type: bigint(),
                    primaryKey: true,
                }),
            ],
            indexes: [makePkIndex(usersId, [usersPk])],
        }),
        makeTable({
            id: diagramsId,
            name: 'diagrams',
            schema: SCHEMA,
            fields: [
                makeField({
                    id: diagramsPk,
                    name: 'id',
                    type: bigint(),
                    primaryKey: true,
                }),
                makeField({
                    id: diagramsOwnerFk,
                    name: 'owner_id',
                    type: bigint(),
                    nullable: true,
                }),
            ],
            indexes: [makePkIndex(diagramsId, [diagramsPk])],
        }),
        makeTable({
            id: membersId,
            name: 'diagram_members',
            schema: SCHEMA,
            fields: [
                makeField({
                    id: membersPk,
                    name: 'id',
                    type: bigint(),
                    primaryKey: true,
                }),
                makeField({
                    id: membersDiagramFk,
                    name: 'diagram_id',
                    type: bigint(),
                }),
                makeField({
                    id: membersUserFk,
                    name: 'user_id',
                    type: bigint(),
                }),
            ],
            indexes: [makePkIndex(membersId, [membersPk])],
        }),
        makeTable({
            id: sessionsId,
            name: 'sessions',
            schema: SCHEMA,
            fields: [
                makeField({
                    id: sessionsPk,
                    name: 'id',
                    type: bigint(),
                    primaryKey: true,
                }),
                makeField({
                    id: sessionsUserFk,
                    name: 'user_id',
                    type: bigint(),
                    nullable: true,
                }),
            ],
            indexes: [makePkIndex(sessionsId, [sessionsPk])],
        }),
        makeTable({
            id: tokensId,
            name: 'personal_access_tokens',
            schema: SCHEMA,
            fields: [
                makeField({
                    id: tokensPk,
                    name: 'id',
                    type: bigint(),
                    primaryKey: true,
                }),
                makeField({
                    id: tokensUserFk,
                    name: 'tokenable_id',
                    type: bigint(),
                }),
            ],
            indexes: [makePkIndex(tokensId, [tokensPk])],
        }),
    ];

    const relationships = [
        makeRelationship({
            name: 'diagrams_owner_id_foreign',
            sourceTableId: usersId,
            targetTableId: diagramsId,
            sourceFieldId: usersPk,
            targetFieldId: diagramsOwnerFk,
            sourceCardinality: 'one',
            targetCardinality: 'many',
        }),
        makeRelationship({
            name: 'diagram_members_diagram_id_foreign',
            sourceTableId: diagramsId,
            targetTableId: membersId,
            sourceFieldId: diagramsPk,
            targetFieldId: membersDiagramFk,
            sourceCardinality: 'one',
            targetCardinality: 'many',
        }),
        makeRelationship({
            name: 'diagram_members_user_id_foreign',
            sourceTableId: usersId,
            targetTableId: membersId,
            sourceFieldId: usersPk,
            targetFieldId: membersUserFk,
            sourceCardinality: 'one',
            targetCardinality: 'many',
        }),
        makeRelationship({
            name: 'sessions_user_id_foreign',
            sourceTableId: usersId,
            targetTableId: sessionsId,
            sourceFieldId: usersPk,
            targetFieldId: sessionsUserFk,
            sourceCardinality: 'one',
            targetCardinality: 'many',
        }),
        makeRelationship({
            name: 'personal_access_tokens_tokenable_id_foreign',
            sourceTableId: usersId,
            targetTableId: tokensId,
            sourceFieldId: usersPk,
            targetFieldId: tokensUserFk,
            sourceCardinality: 'one',
            targetCardinality: 'many',
        }),
    ];

    return makeDiagram({
        databaseType: DatabaseType.MYSQL,
        tables,
        relationships,
    });
};

describe('Prisma export realistic Laravel/MySQL fixture', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    it('exports all ordinary FK→PK relationships without relation_skipped', () => {
        const diagram = buildRealisticLaravelDiagram();
        const result = generatePrismaSchemaFromDiagram({
            diagram,
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(
            result.notes.some((note) => note.code === 'relation_skipped')
        ).toBe(false);
        expect(result.schema.match(/@relation\(/g)?.length).toBe(10);

        expect(result.schema).toContain('ownerId BigInt? @map("owner_id")');
        expect(result.schema).toContain('owner Users? @relation');
        expect(result.schema).toContain('diagramId BigInt @map("diagram_id")');
        expect(result.schema).toContain('diagram Diagrams @relation');
        expect(result.schema).not.toContain('diagram Diagrams? @relation');
        expect(result.schema).toContain('userId BigInt @map("user_id")');
        expect(result.schema).toContain('user Users @relation');
        expect(result.schema).toMatch(
            /model Sessions \{[\s\S]*userId BigInt\? @map\("user_id"\)[\s\S]*user Users\? @relation/
        );
        expect(result.schema).toContain(
            'tokenableId BigInt @map("tokenable_id")'
        );
        expect(result.schema).toContain('tokenable Users @relation');
    });

    it('aggregates schema namespace notes for shared schema', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: buildRealisticLaravelDiagram(),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        const schemaNotes = result.notes.filter(
            (note) => note.code === 'schema_namespace_unsupported'
        );

        expect(schemaNotes).toHaveLength(1);
        expect(schemaNotes[0]?.path).toBe(SCHEMA);
        expect(schemaNotes[0]?.metadata?.count).toBe(5);
        expect(schemaNotes[0]?.metadata?.affectedPaths).toEqual([
            'diagram_members',
            'diagrams',
            'personal_access_tokens',
            'sessions',
            'users',
        ]);
    });

    it('keeps Prisma 6 and 7 parity for realistic fixture', () => {
        const diagram = buildRealisticLaravelDiagram();
        const v6 = generatePrismaSchemaFromDiagram({ diagram, version: '6' });
        const v7 = generatePrismaSchemaFromDiagram({ diagram, version: '7' });

        expect(v6.success).toBe(true);
        expect(v7.success).toBe(true);
        if (!v6.success || !v7.success) return;

        expect(v6.schema.match(/@relation\(/g)?.length).toBe(
            v7.schema.match(/@relation\(/g)?.length
        );
        expect(v6.notes).toEqual(v7.notes);
    });
});
