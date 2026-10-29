import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { Area } from '@/lib/domain/area';
import type { Note } from '@/lib/domain/note';
import type { DBTable } from '@/lib/domain/db-table';
import type { DBField } from '@/lib/domain/db-field';
import type { DBIndex } from '@/lib/domain/db-index';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import {
    DBCustomTypeKind,
    type DBCustomType,
} from '@/lib/domain/db-custom-type';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const stamp = 1_700_000_000_000;

const field = (
    id: string,
    name: string,
    type: { id: string; name: string },
    options: Partial<DBField> = {}
): DBField => ({
    id,
    name,
    type,
    primaryKey: false,
    unique: false,
    nullable: false,
    createdAt: stamp,
    ...options,
});

const pkIndex = (id: string, fieldId: string): DBIndex => ({
    id,
    name: `${id}_pkey`,
    unique: true,
    fieldIds: [fieldId],
    createdAt: stamp,
    type: 'btree',
    isPrimaryKey: true,
});

const table = (
    id: string,
    name: string,
    fields: DBField[],
    indexes: DBIndex[],
    extra: Partial<DBTable> = {}
): DBTable => ({
    id,
    name,
    schema: 'public',
    x: 40,
    y: 40,
    fields,
    indexes,
    color: '#8eb7ff',
    isView: false,
    createdAt: stamp,
    ...extra,
});

const accountStatus = (): DBCustomType => ({
    id: 'ct-account-status',
    schema: 'public',
    name: 'account_status',
    kind: DBCustomTypeKind.enum,
    values: ['active', 'disabled'],
});

const billingArea = (): Area => ({
    id: 'area-billing',
    name: 'Billing',
    x: 0,
    y: 0,
    width: 960,
    height: 640,
    color: '#e8f0ff',
});

const catalogNote = (): Note => ({
    id: 'note-account-status',
    content: 'Account status is an enum.',
    x: 40,
    y: 520,
    width: 240,
    height: 80,
    color: '#fff4cc',
});

const usersTable = (): DBTable =>
    table(
        'users',
        'users',
        [
            field(
                'users-id',
                'id',
                { id: 'bigint', name: 'bigint' },
                {
                    primaryKey: true,
                    unique: true,
                }
            ),
            field(
                'users-email',
                'email',
                { id: 'varchar', name: 'varchar' },
                { unique: true, characterMaximumLength: '255' }
            ),
            field(
                'users-name',
                'name',
                { id: 'varchar', name: 'varchar' },
                {
                    nullable: true,
                    characterMaximumLength: '255',
                }
            ),
            field('users-status', 'status', {
                id: 'ct-account-status',
                name: 'account_status',
            }),
            field(
                'users-created-at',
                'created_at',
                { id: 'timestamp', name: 'timestamp' },
                { default: 'now()' }
            ),
        ],
        [pkIndex('users-pk', 'users-id'), uniqueEmailIndex()]
    );

const uniqueEmailIndex = (): DBIndex => ({
    id: 'users-email-unique',
    name: 'users_email_unique',
    unique: true,
    fieldIds: ['users-email'],
    createdAt: stamp,
    type: 'btree',
});

const postsTable = (): DBTable =>
    table(
        'posts',
        'posts',
        [
            field(
                'posts-id',
                'id',
                { id: 'bigint', name: 'bigint' },
                {
                    primaryKey: true,
                    unique: true,
                }
            ),
            field('posts-user-id', 'user_id', { id: 'bigint', name: 'bigint' }),
            field(
                'posts-title',
                'title',
                { id: 'varchar', name: 'varchar' },
                { characterMaximumLength: '255' }
            ),
            field(
                'posts-body',
                'body',
                { id: 'text', name: 'text' },
                {
                    nullable: true,
                }
            ),
            field(
                'posts-published',
                'published',
                { id: 'boolean', name: 'boolean' },
                { default: 'false' }
            ),
        ],
        [
            pkIndex('posts-pk', 'posts-id'),
            {
                id: 'posts-user-id-idx',
                name: 'posts_user_id_idx',
                unique: false,
                fieldIds: ['posts-user-id'],
                createdAt: stamp,
                type: 'btree',
            },
        ],
        {
            x: 360,
            checkConstraints: [
                {
                    id: 'posts-title-check',
                    expression: "title <> ''",
                    createdAt: stamp,
                },
            ],
        }
    );

const commentsTable = (): DBTable =>
    table(
        'comments',
        'comments',
        [
            field(
                'comments-id',
                'id',
                { id: 'bigint', name: 'bigint' },
                {
                    primaryKey: true,
                    unique: true,
                }
            ),
            field('comments-post-id', 'post_id', {
                id: 'bigint',
                name: 'bigint',
            }),
            field('comments-body', 'body', { id: 'text', name: 'text' }),
        ],
        [pkIndex('comments-pk', 'comments-id')],
        { x: 680 }
    );

const relationship = (
    id: string,
    name: string,
    sourceTableId: string,
    sourceFieldId: string,
    targetTableId: string,
    targetFieldId: string
): DBRelationship => ({
    id,
    name,
    sourceSchema: 'public',
    sourceTableId,
    sourceFieldId,
    targetSchema: 'public',
    targetTableId,
    targetFieldId,
    sourceCardinality: 'one',
    targetCardinality: 'many',
    onDelete: 'cascade',
    onUpdate: 'cascade',
    createdAt: stamp,
});

/**
 * PostgreSQL catalog used by B4 merge QA.
 * Device and Online tests clone this instead of sharing a mutable object.
 */
export const b4MergeCatalogFixture = (): Diagram => ({
    id: '42',
    name: 'Catalog',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [usersTable(), postsTable(), commentsTable()],
    relationships: [
        relationship(
            'rel-users-posts',
            'users_posts_fk',
            'users',
            'users-id',
            'posts',
            'posts-user-id'
        ),
        relationship(
            'rel-posts-comments',
            'posts_comments_fk',
            'posts',
            'posts-id',
            'comments',
            'comments-post-id'
        ),
    ],
    dependencies: [],
    areas: [billingArea()],
    customTypes: [accountStatus()],
    notes: [catalogNote()],
    createdAt,
    updatedAt: createdAt,
});

const clone = (diagram: Diagram): Diagram => structuredClone(diagram);

const tagsTable = (): DBTable =>
    table(
        'tags-incoming',
        'tags',
        [
            field(
                'tags-id',
                'id',
                { id: 'bigint', name: 'bigint' },
                {
                    primaryKey: true,
                    unique: true,
                }
            ),
            field(
                'tags-name',
                'name',
                { id: 'varchar', name: 'varchar' },
                { characterMaximumLength: '80' }
            ),
        ],
        [pkIndex('tags-pk', 'tags-id')],
        { x: 1000 }
    );

export const b4CatalogWithAddedTags = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    diagram.tables = [...(diagram.tables ?? []), tagsTable()];
    return diagram;
};

export const b4CatalogWithoutComments = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    diagram.tables = (diagram.tables ?? []).filter(
        (item) => item.name !== 'comments'
    );
    diagram.relationships = (diagram.relationships ?? []).filter(
        (item) => item.name !== 'posts_comments_fk'
    );
    return diagram;
};

export const b4CatalogWithRenamedPosts = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    const posts = diagram.tables?.find((item) => item.id === 'posts');

    if (posts) {
        posts.name = 'articles';
    }

    return diagram;
};

export const b4CatalogWithNickname = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    const users = diagram.tables?.find((item) => item.id === 'users');
    users?.fields.push(
        field(
            'users-nickname',
            'nickname',
            { id: 'varchar', name: 'varchar' },
            {
                nullable: true,
                characterMaximumLength: '80',
            }
        )
    );
    return diagram;
};

export const b4CatalogWithoutUserName = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    const users = diagram.tables?.find((item) => item.id === 'users');

    if (users) {
        users.fields = users.fields.filter((item) => item.name !== 'name');
    }

    return diagram;
};

export const b4CatalogWithRenamedEmail = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    const email = diagram.tables
        ?.find((item) => item.id === 'users')
        ?.fields.find((item) => item.id === 'users-email');

    if (email) {
        email.name = 'email_address';
    }

    return diagram;
};

export const b4CatalogWithStatusAsText = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    const status = diagram.tables
        ?.find((item) => item.id === 'users')
        ?.fields.find((item) => item.id === 'users-status');

    if (status) {
        status.type = { id: 'text', name: 'text' };
    }

    return diagram;
};

export const b4CatalogWithRequiredNameDefault = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    const name = diagram.tables
        ?.find((item) => item.id === 'users')
        ?.fields.find((item) => item.id === 'users-name');

    if (name) {
        name.nullable = false;
        name.default = "''";
    }

    return diagram;
};

export const b4CatalogWithRelationshipChanges = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    const usersPosts = diagram.relationships?.find(
        (item) => item.id === 'rel-users-posts'
    );

    if (usersPosts) {
        usersPosts.onDelete = 'restrict';
    }

    diagram.relationships = (diagram.relationships ?? []).filter(
        (item) => item.id !== 'rel-posts-comments'
    );
    diagram.relationships.push(
        relationship(
            'rel-users-comments',
            'users_comments_fk',
            'users',
            'users-id',
            'comments',
            'comments-post-id'
        )
    );
    return diagram;
};

export const b4CatalogWithIndexCheckAndUnusedType = (): Diagram => {
    const diagram = clone(b4MergeCatalogFixture());
    const posts = diagram.tables?.find((item) => item.id === 'posts');
    const userIndex = posts?.indexes.find(
        (item) => item.id === 'posts-user-id-idx'
    );

    if (userIndex) {
        userIndex.unique = true;
        userIndex.name = 'posts_user_id_unique';
    }

    const titleCheck = posts?.checkConstraints?.find(
        (item) => item.id === 'posts-title-check'
    );

    if (titleCheck) {
        titleCheck.expression = 'char_length(title) > 0';
    }

    diagram.customTypes = [
        ...(diagram.customTypes ?? []),
        {
            id: 'ct-priority-unused',
            schema: 'public',
            name: 'priority',
            kind: DBCustomTypeKind.enum,
            values: ['low', 'high'],
        },
    ];
    return diagram;
};

/**
 * Incoming file for an add-table merge.
 * Canvas notes, areas, and an unused enum differ from the open diagram.
 * Semantic merge is expected to ignore those presentation and unused types.
 */
export const b4IncomingTagsWithForeignCanvas = (): Diagram => {
    const incoming = b4CatalogWithAddedTags();
    incoming.id = 'incoming-catalog';
    incoming.name = 'Imported catalog';
    incoming.areas = [
        {
            id: 'area-incoming',
            name: 'Imported area',
            x: 20,
            y: 20,
            width: 400,
            height: 200,
            color: '#ffd6d6',
        },
    ];
    incoming.notes = [
        {
            id: 'note-incoming',
            content: 'Imported note',
            x: 24,
            y: 24,
            width: 180,
            height: 60,
            color: '#ffffff',
        },
    ];
    incoming.customTypes = [
        ...(incoming.customTypes ?? []),
        {
            id: 'ct-priority-unused',
            schema: 'public',
            name: 'priority',
            kind: DBCustomTypeKind.enum,
            values: ['low', 'high'],
        },
    ];
    return incoming;
};

/**
 * Authoritative document a successful add-table apply is expected to return:
 * current id, areas, notes, and the required enum, plus the new table.
 */
export const b4ServerResultAfterAddingTags = (): Diagram => {
    const current = b4MergeCatalogFixture();
    const withTags = b4CatalogWithAddedTags();

    return {
        ...withTags,
        id: current.id,
        name: current.name,
        areas: current.areas,
        notes: current.notes,
        customTypes: current.customTypes,
    };
};
