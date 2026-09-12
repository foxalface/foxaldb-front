import { beforeEach, describe, expect, it } from 'vitest';
import { generatePrismaSchemaFromDiagram } from '../generate-prisma-schema-from-diagram';
import { stripVersionSpecificHeader } from '../prisma-schema-writer';
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

const bigint = () => typeRef('bigint');

const buildUsersPostsDiagram = (
    orientation: 'sql_editor' | 'prisma_laravel'
) => {
    const userTableId = 'table-users';
    const postTableId = 'table-posts';
    const userPkId = 'field-user-id';
    const postPkId = 'field-post-id';
    const authorFkId = 'field-author-id';

    const tables = [
        makeTable({
            id: userTableId,
            name: 'users',
            fields: [
                makeField({
                    id: userPkId,
                    name: 'id',
                    type: bigint(),
                    primaryKey: true,
                }),
            ],
            indexes: [makePkIndex(userTableId, [userPkId])],
        }),
        makeTable({
            id: postTableId,
            name: 'posts',
            fields: [
                makeField({
                    id: postPkId,
                    name: 'id',
                    type: bigint(),
                    primaryKey: true,
                }),
                makeField({
                    id: authorFkId,
                    name: 'user_id',
                    type: bigint(),
                    nullable: true,
                }),
            ],
            indexes: [makePkIndex(postTableId, [postPkId])],
        }),
    ];

    const relationship =
        orientation === 'sql_editor'
            ? makeRelationship({
                  name: 'posts_user_id_fk',
                  sourceTableId: userTableId,
                  targetTableId: postTableId,
                  sourceFieldId: userPkId,
                  targetFieldId: authorFkId,
                  sourceCardinality: 'one',
                  targetCardinality: 'many',
              })
            : makeRelationship({
                  name: 'posts_user_id_fk',
                  sourceTableId: postTableId,
                  targetTableId: userTableId,
                  sourceFieldId: authorFkId,
                  targetFieldId: userPkId,
                  sourceCardinality: 'many',
                  targetCardinality: 'one',
              });

    return makeDiagram({
        databaseType: DatabaseType.MYSQL,
        tables,
        relationships: [relationship],
    });
};

const exportResult = (
    diagram: ReturnType<typeof makeDiagram>,
    version: '6' | '7' = '7'
) => generatePrismaSchemaFromDiagram({ diagram, version });

describe('Prisma export relationship orientation', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    it('exports one:many PK-source/FK-target (SQL/editor) relations', () => {
        const result = exportResult(buildUsersPostsDiagram('sql_editor'));

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt? @map("user_id")');
        expect(result.schema).toContain(
            'user Users? @relation("posts_user_id_fk", fields: [userId], references: [id])'
        );
        expect(result.schema).toContain(
            'posts Posts[] @relation("posts_user_id_fk")'
        );
        expect(result.schema).not.toContain('posts Posts[]?');
        expect(
            result.notes.some((note) => note.code === 'relation_skipped')
        ).toBe(false);
    });

    it('exports many:one FK-source/PK-target (Prisma/Laravel) relations', () => {
        const result = exportResult(buildUsersPostsDiagram('prisma_laravel'));

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt? @map("user_id")');
        expect(result.schema).toContain(
            'user Users? @relation("posts_user_id_fk", fields: [userId], references: [id])'
        );
        expect(
            result.notes.some((note) => note.code === 'relation_skipped')
        ).toBe(false);
    });

    it('produces equivalent physical semantics for both orientations', () => {
        const sqlResult = exportResult(buildUsersPostsDiagram('sql_editor'));
        const prismaResult = exportResult(
            buildUsersPostsDiagram('prisma_laravel')
        );

        expect(sqlResult.success).toBe(true);
        expect(prismaResult.success).toBe(true);
        if (!sqlResult.success || !prismaResult.success) return;

        expect(sqlResult.schema).toContain(
            'fields: [userId], references: [id]'
        );
        expect(prismaResult.schema).toContain(
            'fields: [userId], references: [id]'
        );
        expect(sqlResult.schema.match(/@relation\(/g)?.length).toBe(
            prismaResult.schema.match(/@relation\(/g)?.length
        );
    });

    it('preserves scalar FK fields in both orientations', () => {
        const sqlResult = exportResult(buildUsersPostsDiagram('sql_editor'));
        const prismaResult = exportResult(
            buildUsersPostsDiagram('prisma_laravel')
        );

        expect(sqlResult.success).toBe(true);
        expect(prismaResult.success).toBe(true);
        if (!sqlResult.success || !prismaResult.success) return;

        expect(sqlResult.schema).toContain('userId BigInt? @map("user_id")');
        expect(prismaResult.schema).toContain('userId BigInt? @map("user_id")');
    });

    it('handles nullable FK in one:many orientation', () => {
        const result = exportResult(buildUsersPostsDiagram('sql_editor'));
        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt? @map("user_id")');
        expect(result.schema).toContain('user Users? @relation');
        expect(result.schema).toContain('posts Posts[] @relation');
    });

    it('handles nullable FK in many:one orientation', () => {
        const result = exportResult(buildUsersPostsDiagram('prisma_laravel'));
        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt? @map("user_id")');
        expect(result.schema).toContain('user Users? @relation');
    });

    it('handles required FK in one:many orientation', () => {
        const diagram = buildUsersPostsDiagram('sql_editor');
        diagram.tables![1].fields[1].nullable = false;

        const result = exportResult(diagram);
        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt @map("user_id")');
        expect(result.schema).toContain('user Users @relation');
        expect(result.schema).not.toContain('user Users? @relation');
    });

    it('handles required FK in many:one orientation', () => {
        const diagram = buildUsersPostsDiagram('prisma_laravel');
        diagram.tables![1].fields[1].nullable = false;

        const result = exportResult(diagram);
        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt @map("user_id")');
        expect(result.schema).toContain('user Users @relation');
        expect(result.schema).not.toContain('user Users? @relation');
    });

    it('keeps SetNull when FK is nullable and makes navigation optional', () => {
        const diagram = buildUsersPostsDiagram('sql_editor');
        diagram.relationships![0].onDelete = 'set_null';

        const result = exportResult(diagram);
        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt? @map("user_id")');
        expect(result.schema).toContain(
            'user Users? @relation("posts_user_id_fk", fields: [userId], references: [id], onDelete: SetNull)'
        );
    });

    it('omits SetNull using resolved FK nullability', () => {
        const diagram = buildUsersPostsDiagram('sql_editor');
        diagram.relationships![0].onDelete = 'set_null';
        diagram.tables![1].fields[1].nullable = false;

        const result = exportResult(diagram);
        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('onDelete: SetNull');
        expect(result.schema).toContain('user Users @relation');
        expect(result.schema).not.toContain('user Users? @relation');
        expect(
            result.notes.some((note) => note.code === 'set_null_omitted')
        ).toBe(true);
    });

    it('resolves one:one with SQL/editor orientation', () => {
        const userTableId = 'table-user';
        const profileTableId = 'table-profile';
        const userPkId = 'field-user-id';
        const profilePkId = 'field-profile-id';
        const userFkId = 'field-user-fk';

        const result = exportResult(
            makeDiagram({
                databaseType: DatabaseType.MYSQL,
                tables: [
                    makeTable({
                        id: userTableId,
                        name: 'users',
                        fields: [
                            makeField({
                                id: userPkId,
                                name: 'id',
                                type: bigint(),
                                primaryKey: true,
                            }),
                        ],
                        indexes: [makePkIndex(userTableId, [userPkId])],
                    }),
                    makeTable({
                        id: profileTableId,
                        name: 'profiles',
                        fields: [
                            makeField({
                                id: profilePkId,
                                name: 'id',
                                type: bigint(),
                                primaryKey: true,
                            }),
                            makeField({
                                id: userFkId,
                                name: 'user_id',
                                type: bigint(),
                                unique: true,
                            }),
                        ],
                        indexes: [makePkIndex(profileTableId, [profilePkId])],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        sourceTableId: userTableId,
                        targetTableId: profileTableId,
                        sourceFieldId: userPkId,
                        targetFieldId: userFkId,
                        sourceCardinality: 'one',
                        targetCardinality: 'one',
                    }),
                ],
            })
        );

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('user Users @relation');
        expect(result.schema).toContain('profiles Profiles? @relation');
        expect(
            result.notes.some((note) => note.code === 'relation_skipped')
        ).toBe(false);
    });

    it('degrades one:one when FK is not unique', () => {
        const userTableId = 'table-user';
        const profileTableId = 'table-profile';

        const result = exportResult(
            makeDiagram({
                databaseType: DatabaseType.MYSQL,
                tables: [
                    makeTable({
                        id: userTableId,
                        name: 'users',
                        fields: [
                            makeField({
                                id: 'field-user-id',
                                name: 'id',
                                type: bigint(),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: profileTableId,
                        name: 'profiles',
                        fields: [
                            makeField({
                                id: 'field-profile-id',
                                name: 'id',
                                type: bigint(),
                                primaryKey: true,
                            }),
                            makeField({
                                id: 'field-user-fk',
                                name: 'user_id',
                                type: bigint(),
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        sourceTableId: userTableId,
                        targetTableId: profileTableId,
                        sourceFieldId: 'field-user-id',
                        targetFieldId: 'field-user-fk',
                        sourceCardinality: 'one',
                        targetCardinality: 'one',
                    }),
                ],
            })
        );

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('user Users @relation');
        expect(result.schema).toContain('profiles Profiles[] @relation');
        expect(
            result.notes.some((note) => note.code === 'relation_degraded')
        ).toBe(true);
    });

    it('resolves one:one with nullable unique FK as optional navigation', () => {
        const userTableId = 'table-user';
        const profileTableId = 'table-profile';
        const userPkId = 'field-user-id';
        const profilePkId = 'field-profile-id';
        const userFkId = 'field-user-fk';

        const result = exportResult(
            makeDiagram({
                databaseType: DatabaseType.MYSQL,
                tables: [
                    makeTable({
                        id: userTableId,
                        name: 'users',
                        fields: [
                            makeField({
                                id: userPkId,
                                name: 'id',
                                type: bigint(),
                                primaryKey: true,
                            }),
                        ],
                        indexes: [makePkIndex(userTableId, [userPkId])],
                    }),
                    makeTable({
                        id: profileTableId,
                        name: 'profiles',
                        fields: [
                            makeField({
                                id: profilePkId,
                                name: 'id',
                                type: bigint(),
                                primaryKey: true,
                            }),
                            makeField({
                                id: userFkId,
                                name: 'user_id',
                                type: bigint(),
                                unique: true,
                                nullable: true,
                            }),
                        ],
                        indexes: [makePkIndex(profileTableId, [profilePkId])],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        sourceTableId: userTableId,
                        targetTableId: profileTableId,
                        sourceFieldId: userPkId,
                        targetFieldId: userFkId,
                        sourceCardinality: 'one',
                        targetCardinality: 'one',
                    }),
                ],
            })
        );

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt? @map("user_id")');
        expect(result.schema).toContain('user Users? @relation');
        expect(result.schema).toContain('profiles Profiles? @relation');
    });

    it('degrades nullable one-to-one without unique FK as optional navigation', () => {
        const userTableId = 'table-user';
        const profileTableId = 'table-profile';

        const result = exportResult(
            makeDiagram({
                databaseType: DatabaseType.MYSQL,
                tables: [
                    makeTable({
                        id: userTableId,
                        name: 'users',
                        fields: [
                            makeField({
                                id: 'field-user-id',
                                name: 'id',
                                type: bigint(),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: profileTableId,
                        name: 'profiles',
                        fields: [
                            makeField({
                                id: 'field-profile-id',
                                name: 'id',
                                type: bigint(),
                                primaryKey: true,
                            }),
                            makeField({
                                id: 'field-user-fk',
                                name: 'user_id',
                                type: bigint(),
                                nullable: true,
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        sourceTableId: userTableId,
                        targetTableId: profileTableId,
                        sourceFieldId: 'field-user-id',
                        targetFieldId: 'field-user-fk',
                        sourceCardinality: 'one',
                        targetCardinality: 'one',
                    }),
                ],
            })
        );

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('userId BigInt? @map("user_id")');
        expect(result.schema).toContain('user Users? @relation');
        expect(result.schema).toContain('profiles Profiles[] @relation');
    });

    it('keeps Prisma 6 and 7 relation semantics identical', () => {
        const diagram = buildUsersPostsDiagram('sql_editor');
        const v6 = exportResult(diagram, '6');
        const v7 = exportResult(diagram, '7');

        expect(v6.success).toBe(true);
        expect(v7.success).toBe(true);
        if (!v6.success || !v7.success) return;

        expect(stripVersionSpecificHeader(v6.schema)).toBe(
            stripVersionSpecificHeader(v7.schema)
        );
        expect(v6.notes).toEqual(v7.notes);
    });
});
