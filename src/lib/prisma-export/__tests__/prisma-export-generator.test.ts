import { beforeEach, describe, expect, it } from 'vitest';
import { generatePrismaSchemaFromDiagram } from '../generate-prisma-schema-from-diagram';
import { buildPrismaExportFilename } from '../build-prisma-export-filename';
import { DatabaseType } from '@/lib/domain/database-type';
import { DBCustomTypeKind } from '@/lib/domain/db-custom-type';
import {
    makeDiagram,
    makeEnum,
    makeField,
    makePkIndex,
    makeRelationship,
    makeTable,
    resetIdCounter,
    typeRef,
} from './test-helpers';

const exportSchema = (
    diagram: ReturnType<typeof makeDiagram>,
    version: '6' | '7' = '7'
): string => {
    const result = generatePrismaSchemaFromDiagram({ diagram, version });

    expect(result.success).toBe(true);
    if (!result.success) {
        throw new Error(result.error.message);
    }

    return result.schema;
};

describe('Prisma export generator', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    it('exports a simple model', () => {
        const schema = exportSchema(
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
                            }),
                            makeField({
                                name: 'email',
                                type: typeRef('varchar'),
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('model Users {');
        expect(schema).toContain('email String');
    });

    it('uses @@map for physical table names', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.MYSQL,
                tables: [
                    makeTable({
                        name: 'user_profiles',
                        fields: [
                            makeField({
                                name: 'id',
                                type: typeRef('int'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@@map("user_profiles")');
    });

    it('uses @map for physical column names', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.MYSQL,
                tables: [
                    makeTable({
                        name: 'users',
                        fields: [
                            makeField({
                                name: 'email_address',
                                type: typeRef('varchar'),
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@map("email_address")');
    });

    it('handles unusual table and field names', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'user-account',
                        fields: [
                            makeField({
                                name: 'e mail',
                                type: typeRef('varchar'),
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@@map("user-account")');
        expect(schema).toContain('@map("e mail")');
    });

    it('handles leading digit identifiers', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: '1_users',
                        fields: [
                            makeField({
                                name: '2_code',
                                type: typeRef('varchar'),
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@@map("1_users")');
        expect(schema).toContain('@map("2_code")');
    });

    it('resolves identifier collisions deterministically', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'users',
                        fields: [
                            makeField({
                                name: 'user-id',
                                type: typeRef('varchar'),
                            }),
                            makeField({
                                name: 'user_id',
                                type: typeRef('varchar'),
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('userId');
        expect(schema).toContain('userId2');
    });

    it('handles reserved identifiers', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'model',
                        fields: [
                            makeField({
                                name: 'enum',
                                type: typeRef('varchar'),
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('model ModelValue {');
        expect(schema).toContain('enumValue');
    });

    it('emits @id and autoincrement', () => {
        const schema = exportSchema(
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
            })
        );

        expect(schema).toContain('@id @default(autoincrement())');
    });

    it('emits integer PK without autoincrement when increment is false', () => {
        const schema = exportSchema(
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
                                increment: false,
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('id Int @id');
        expect(schema).not.toContain('@default(autoincrement())');
    });

    it('emits UUID PK without uuid() default unless explicit', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'users',
                        fields: [
                            makeField({
                                name: 'id',
                                type: typeRef('uuid'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@db.Uuid');
        expect(schema).toContain('@id');
        expect(schema).not.toContain('@default(uuid())');
    });

    it('emits uuid() default when explicitly represented', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'users',
                        fields: [
                            makeField({
                                name: 'token',
                                type: typeRef('uuid'),
                                default: 'uuid()',
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@default(uuid())');
    });

    it('emits composite primary key', () => {
        const tenantId = 'field-tenant';
        const userId = 'field-user';

        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'memberships',
                        fields: [
                            makeField({
                                id: tenantId,
                                name: 'tenant_id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: userId,
                                name: 'user_id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                        indexes: [
                            makePkIndex('table-memberships', [
                                tenantId,
                                userId,
                            ]),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@@id([tenantId, userId])');
        expect(schema).not.toMatch(/tenantId Int @id/);
    });

    it('emits field and composite unique constraints without duplication', () => {
        const emailId = 'field-email';
        const tenantId = 'field-tenant';
        const roleId = 'field-role';

        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'users',
                        fields: [
                            makeField({
                                id: emailId,
                                name: 'email',
                                type: typeRef('varchar'),
                                unique: true,
                            }),
                            makeField({
                                id: tenantId,
                                name: 'tenant_id',
                                type: typeRef('integer'),
                            }),
                            makeField({
                                id: roleId,
                                name: 'role',
                                type: typeRef('varchar'),
                            }),
                        ],
                        indexes: [
                            {
                                id: 'idx-unique',
                                name: 'users_tenant_role_key',
                                unique: true,
                                fieldIds: [tenantId, roleId],
                                createdAt: 0,
                            },
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('email String @unique');
        expect(schema).toContain(
            '@@unique([tenantId, role], name: "users_tenant_role_key")'
        );
    });

    it('emits indexes', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'posts',
                        fields: [
                            makeField({
                                id: 'field-title',
                                name: 'title',
                                type: typeRef('varchar'),
                            }),
                            makeField({
                                id: 'field-status',
                                name: 'status',
                                type: typeRef('varchar'),
                            }),
                        ],
                        indexes: [
                            {
                                id: 'idx-title',
                                name: 'posts_title_idx',
                                unique: false,
                                fieldIds: ['field-title'],
                                createdAt: 0,
                            },
                            {
                                id: 'idx-composite',
                                name: '',
                                unique: false,
                                fieldIds: ['field-title', 'field-status'],
                                createdAt: 0,
                            },
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@@index([title], name: "posts_title_idx")');
        expect(schema).toContain('@@index([title, status])');
    });

    it('maps core scalar types', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'products',
                        fields: [
                            makeField({
                                name: 'code',
                                type: typeRef('varchar'),
                                characterMaximumLength: '32',
                            }),
                            makeField({
                                name: 'body',
                                type: typeRef('text'),
                            }),
                            makeField({
                                name: 'amount',
                                type: typeRef('decimal'),
                                precision: 10,
                                scale: 2,
                            }),
                            makeField({
                                name: 'qty',
                                type: typeRef('bigint'),
                            }),
                            makeField({
                                name: 'active',
                                type: typeRef('boolean'),
                            }),
                            makeField({
                                name: 'published_on',
                                type: typeRef('date'),
                            }),
                            makeField({
                                name: 'created_at',
                                type: typeRef('timestamp'),
                            }),
                            makeField({
                                name: 'updated_at',
                                type: typeRef('timestamptz'),
                            }),
                            makeField({
                                name: 'meta',
                                type: typeRef('jsonb'),
                            }),
                            makeField({
                                name: 'payload',
                                type: typeRef('bytea'),
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@db.VarChar(32)');
        expect(schema).toContain('@db.Text');
        expect(schema).toContain('@db.Decimal(10, 2)');
        expect(schema).toContain('qty BigInt');
        expect(schema).toContain('active Boolean');
        expect(schema).toContain('@db.Date');
        expect(schema).toContain('@db.Timestamp');
        expect(schema).toContain('@db.Timestamptz');
        expect(schema).toContain('@db.JsonB');
        expect(schema).toContain('@db.ByteA');
    });

    it('supports arrays on PostgreSQL', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'tags',
                        fields: [
                            makeField({
                                name: 'labels',
                                type: typeRef('varchar'),
                                isArray: true,
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('labels String[]');
    });

    it('omits arrays on MySQL with note', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.MYSQL,
                tables: [
                    makeTable({
                        name: 'tags',
                        fields: [
                            makeField({
                                name: 'labels',
                                type: typeRef('varchar'),
                                isArray: true,
                            }),
                        ],
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('labels String[]');
        expect(
            result.notes.some(
                (note) => note.code === 'unsupported_field_omitted'
            )
        ).toBe(true);
    });

    it('blocks unsupported type on primary key', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'shapes',
                        fields: [
                            makeField({
                                name: 'geom',
                                type: typeRef('geometry'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(false);
        if (result.success) return;

        expect(result.error.code).toBe('unsupported_structural_field');
    });

    it('maps defaults safely', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'items',
                        fields: [
                            makeField({
                                name: 'label',
                                type: typeRef('varchar'),
                                default: "'draft'",
                            }),
                            makeField({
                                name: 'quantity',
                                type: typeRef('integer'),
                                default: '0',
                            }),
                            makeField({
                                name: 'active',
                                type: typeRef('boolean'),
                                default: 'true',
                            }),
                            makeField({
                                name: 'created_at',
                                type: typeRef('timestamp'),
                                default: 'CURRENT_TIMESTAMP',
                            }),
                            makeField({
                                name: 'note',
                                type: typeRef('varchar'),
                                default: 'NOW()',
                            }),
                            makeField({
                                name: 'optional',
                                type: typeRef('varchar'),
                                nullable: true,
                                default: 'NULL',
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@default("draft")');
        expect(schema).toContain('@default(0)');
        expect(schema).toContain('@default(true)');
        expect(schema).toContain('@default(now())');
        expect(schema).not.toContain('CURRENT_TIMESTAMP');
    });

    it('does not map CURRENT_TIMESTAMP to now() on String fields', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'items',
                        fields: [
                            makeField({
                                name: 'label',
                                type: typeRef('varchar'),
                                default: 'CURRENT_TIMESTAMP',
                            }),
                        ],
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('@default(now())');
        expect(
            result.notes.some(
                (note) => note.code === 'unsupported_default_omitted'
            )
        ).toBe(true);
    });

    it('omits arbitrary SQL expression defaults', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'items',
                        fields: [
                            makeField({
                                name: 'value',
                                type: typeRef('varchar'),
                                default: 'lower(name)',
                            }),
                        ],
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('dbgenerated');
        expect(
            result.notes.some(
                (note) => note.code === 'unsupported_default_omitted'
            )
        ).toBe(true);
    });

    it('exports enums with mapped values', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                customTypes: [makeEnum('role', ['USER', 'admin'])],
                tables: [
                    makeTable({
                        name: 'accounts',
                        fields: [
                            makeField({
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                name: 'role',
                                type: typeRef('role', 'role'),
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('enum Role {');
        expect(schema).toContain('Admin @map("admin")');
        expect(schema).toContain('role Role');
    });

    it('skips empty enums', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                customTypes: [
                    {
                        id: 'enum-empty',
                        name: 'EmptyRole',
                        kind: DBCustomTypeKind.enum,
                        values: [],
                    },
                ],
                tables: [
                    makeTable({
                        name: 'accounts',
                        fields: [
                            makeField({
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('enum EmptyRole');
        expect(result.notes.some((note) => note.code === 'enum_skipped')).toBe(
            true
        );
    });

    it('skips views with limitation note', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'active_users',
                        isView: true,
                        fields: [
                            makeField({
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(false);
        if (result.success) return;

        expect(result.error.code).toBe('empty_diagram');
    });

    it('notes schema namespaces', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'users',
                        schema: 'auth',
                        fields: [
                            makeField({
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        const schemaNotes = result.notes.filter(
            (note) => note.code === 'schema_namespace_unsupported'
        );
        expect(schemaNotes).toHaveLength(1);
        expect(schemaNotes[0]?.path).toBe('auth');
        expect(schemaNotes[0]?.metadata?.count).toBe(1);
        expect(result.schema).not.toMatch(/@@schema\s*\(/);
    });

    it('escapes malicious names and defaults', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        name: 'user"table',
                        fields: [
                            makeField({
                                name: 'note',
                                type: typeRef('varchar'),
                                default: '"evil\\nvalue"',
                            }),
                        ],
                    }),
                ],
            })
        );

        expect(schema).toContain('@@map("user\\"table")');
        expect(schema).toContain('@default("evil\\\\nvalue")');
    });

    it('uses fixed filename schema.prisma', () => {
        expect(buildPrismaExportFilename()).toBe('schema.prisma');
    });
});

describe('Prisma export relationships', () => {
    beforeEach(() => {
        resetIdCounter();
    });

    it('synthesizes one-to-many relations', () => {
        const userTableId = 'table-user';
        const postTableId = 'table-post';
        const userPkId = 'field-user-id';
        const postPkId = 'field-post-id';
        const authorFkId = 'field-author-id';

        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: userTableId,
                        name: 'users',
                        fields: [
                            makeField({
                                id: userPkId,
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: postTableId,
                        name: 'posts',
                        fields: [
                            makeField({
                                id: postPkId,
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: authorFkId,
                                name: 'user_id',
                                type: typeRef('integer'),
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        name: 'posts_user_id_fk',
                        sourceTableId: postTableId,
                        targetTableId: userTableId,
                        sourceFieldId: authorFkId,
                        targetFieldId: userPkId,
                        onDelete: 'cascade',
                    }),
                ],
            })
        );

        expect(schema).toContain('userId Int @map("user_id")');
        expect(schema).toContain(
            'user Users @relation("posts_user_id_fk", fields: [userId], references: [id], onDelete: Cascade)'
        );
        expect(schema).toContain('posts Posts[] @relation("posts_user_id_fk")');
    });

    it('supports valid one-to-one relations', () => {
        const profileTableId = 'table-profile';
        const userTableId = 'table-user';
        const userPkId = 'field-user-id';
        const profilePkId = 'field-profile-id';
        const userFkId = 'field-user-fk';

        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: userTableId,
                        name: 'users',
                        fields: [
                            makeField({
                                id: userPkId,
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: profileTableId,
                        name: 'profiles',
                        fields: [
                            makeField({
                                id: profilePkId,
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: userFkId,
                                name: 'user_id',
                                type: typeRef('integer'),
                                unique: true,
                            }),
                        ],
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

        expect(schema).toContain('user Users @relation');
        expect(schema).toContain('profiles Profiles? @relation("fk")');
    });

    it('degrades invalid one-to-one without unique FK', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: 'table-user',
                        name: 'users',
                        fields: [
                            makeField({
                                id: 'field-user-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: 'table-profile',
                        name: 'profiles',
                        fields: [
                            makeField({
                                id: 'field-profile-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: 'field-user-fk',
                                name: 'user_id',
                                type: typeRef('integer'),
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        sourceTableId: 'table-user',
                        targetTableId: 'table-profile',
                        sourceFieldId: 'field-user-id',
                        targetFieldId: 'field-user-fk',
                        sourceCardinality: 'one',
                        targetCardinality: 'one',
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).toContain('profiles Profiles[] @relation("fk")');
        expect(
            result.notes.some((note) => note.code === 'relation_degraded')
        ).toBe(true);
    });

    it('omits SetNull on required foreign keys', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: 'table-user',
                        name: 'users',
                        fields: [
                            makeField({
                                id: 'field-user-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: 'table-post',
                        name: 'posts',
                        fields: [
                            makeField({
                                id: 'field-post-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: 'field-author-id',
                                name: 'user_id',
                                type: typeRef('integer'),
                                nullable: false,
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        sourceTableId: 'table-post',
                        targetTableId: 'table-user',
                        sourceFieldId: 'field-author-id',
                        targetFieldId: 'field-user-id',
                        onDelete: 'set_null',
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('onDelete: SetNull');
        expect(
            result.notes.some((note) => note.code === 'set_null_omitted')
        ).toBe(true);
    });

    it('supports self relations and multiple relations between same models', () => {
        const employeeTableId = 'table-employee';
        const employeePkId = 'field-id';
        const managerFkId = 'field-manager-id';
        const buddyFkId = 'field-buddy-id';

        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: employeeTableId,
                        name: 'employees',
                        fields: [
                            makeField({
                                id: employeePkId,
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: managerFkId,
                                name: 'manager_id',
                                type: typeRef('integer'),
                                nullable: true,
                            }),
                            makeField({
                                id: buddyFkId,
                                name: 'buddy_id',
                                type: typeRef('integer'),
                                nullable: true,
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        name: 'employees_manager_fk',
                        sourceTableId: employeeTableId,
                        targetTableId: employeeTableId,
                        sourceFieldId: managerFkId,
                        targetFieldId: employeePkId,
                    }),
                    makeRelationship({
                        name: 'employees_buddy_fk',
                        sourceTableId: employeeTableId,
                        targetTableId: employeeTableId,
                        sourceFieldId: buddyFkId,
                        targetFieldId: employeePkId,
                    }),
                ],
            })
        );

        expect(schema).toContain('@relation("employees_manager_fk"');
        expect(schema).toContain('@relation("employees_buddy_fk"');
    });

    it('skips relations to non-unique targets', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: 'table-tenant',
                        name: 'tenants',
                        fields: [
                            makeField({
                                id: 'field-tenant-id',
                                name: 'tenant_id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: 'field-id',
                                name: 'id',
                                type: typeRef('integer'),
                            }),
                        ],
                    }),
                    makeTable({
                        id: 'table-user',
                        name: 'users',
                        fields: [
                            makeField({
                                id: 'field-user-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: 'field-tenant-fk',
                                name: 'tenant_id',
                                type: typeRef('integer'),
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        sourceTableId: 'table-user',
                        targetTableId: 'table-tenant',
                        sourceFieldId: 'field-tenant-fk',
                        targetFieldId: 'field-id',
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.schema).not.toContain('@relation(');
        expect(
            result.notes.some((note) => note.code === 'relation_skipped')
        ).toBe(true);
    });

    it('does not emit implicit many-to-many', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: 'table-post',
                        name: 'posts',
                        fields: [
                            makeField({
                                id: 'field-post-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: 'table-category',
                        name: 'categories',
                        fields: [
                            makeField({
                                id: 'field-category-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        sourceTableId: 'table-post',
                        targetTableId: 'table-category',
                        sourceFieldId: 'field-post-id',
                        targetFieldId: 'field-category-id',
                        sourceCardinality: 'many',
                        targetCardinality: 'many',
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(
            result.notes.some((note) => note.code === 'many_to_many_label_only')
        ).toBe(true);
    });

    it('exports physical junction tables as normal models', () => {
        const schema = exportSchema(
            makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: 'table-post',
                        name: 'posts',
                        fields: [
                            makeField({
                                id: 'field-post-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: 'table-category',
                        name: 'categories',
                        fields: [
                            makeField({
                                id: 'field-category-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                    }),
                    makeTable({
                        id: 'table-link',
                        name: 'post_categories',
                        fields: [
                            makeField({
                                id: 'field-post-fk',
                                name: 'post_id',
                                type: typeRef('integer'),
                            }),
                            makeField({
                                id: 'field-category-fk',
                                name: 'category_id',
                                type: typeRef('integer'),
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        name: 'post_categories_post_fk',
                        sourceTableId: 'table-link',
                        targetTableId: 'table-post',
                        sourceFieldId: 'field-post-fk',
                        targetFieldId: 'field-post-id',
                    }),
                    makeRelationship({
                        name: 'post_categories_category_fk',
                        sourceTableId: 'table-link',
                        targetTableId: 'table-category',
                        sourceFieldId: 'field-category-fk',
                        targetFieldId: 'field-category-id',
                    }),
                ],
            })
        );

        expect(schema).toContain('model PostCategories {');
        expect(schema).toContain('postId Int @map("post_id")');
        expect(schema).toContain('categoryId Int @map("category_id")');
    });

    it('notes composite foreign key limitations', () => {
        const result = generatePrismaSchemaFromDiagram({
            diagram: makeDiagram({
                databaseType: DatabaseType.POSTGRESQL,
                tables: [
                    makeTable({
                        id: 'table-tenant',
                        name: 'tenants',
                        fields: [
                            makeField({
                                id: 'field-tenant-id',
                                name: 'tenant_id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                            makeField({
                                id: 'field-id',
                                name: 'id',
                                type: typeRef('integer'),
                                primaryKey: true,
                            }),
                        ],
                        indexes: [
                            makePkIndex('table-tenant', [
                                'field-tenant-id',
                                'field-id',
                            ]),
                        ],
                    }),
                    makeTable({
                        id: 'table-user',
                        name: 'tenant_users',
                        fields: [
                            makeField({
                                id: 'field-user-tenant',
                                name: 'tenant_id',
                                type: typeRef('integer'),
                            }),
                            makeField({
                                id: 'field-user-id',
                                name: 'user_id',
                                type: typeRef('integer'),
                            }),
                        ],
                    }),
                ],
                relationships: [
                    makeRelationship({
                        name: 'tenant_users_tenant_fk_1',
                        sourceTableId: 'table-user',
                        targetTableId: 'table-tenant',
                        sourceFieldId: 'field-user-tenant',
                        targetFieldId: 'field-tenant-id',
                    }),
                    makeRelationship({
                        name: 'tenant_users_tenant_fk_2',
                        sourceTableId: 'table-user',
                        targetTableId: 'table-tenant',
                        sourceFieldId: 'field-user-id',
                        targetFieldId: 'field-id',
                    }),
                ],
            }),
            version: '7',
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(
            result.notes.some(
                (note) => note.code === 'composite_fk_unsupported'
            )
        ).toBe(true);
        expect(result.schema).not.toContain('@relation(');
    });
});
