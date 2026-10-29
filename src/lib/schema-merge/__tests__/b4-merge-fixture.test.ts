import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import {
    b4CatalogWithAddedTags,
    b4CatalogWithIndexCheckAndUnusedType,
    b4CatalogWithNickname,
    b4CatalogWithRelationshipChanges,
    b4CatalogWithRenamedEmail,
    b4CatalogWithRenamedPosts,
    b4CatalogWithRequiredNameDefault,
    b4CatalogWithoutComments,
    b4CatalogWithoutUserName,
    b4CatalogWithStatusAsText,
    b4IncomingTagsWithForeignCanvas,
    b4MergeCatalogFixture,
    b4ServerResultAfterAddingTags,
} from './b4-merge-fixture';

const table = (name: string) =>
    b4MergeCatalogFixture().tables?.find((item) => item.name === name);

describe('B4 merge catalog fixture', () => {
    it('builds a PostgreSQL catalog with keys, relationships, enum, area, and note', () => {
        const diagram = b4MergeCatalogFixture();
        const users = table('users');
        const posts = diagram.tables?.find((item) => item.name === 'posts');
        const comments = diagram.tables?.find(
            (item) => item.name === 'comments'
        );

        expect(diagram.databaseType).toBe(DatabaseType.POSTGRESQL);
        expect(diagram.id).toBe('42');
        expect(users?.fields.map((item) => item.name)).toEqual([
            'id',
            'email',
            'name',
            'status',
            'created_at',
        ]);
        expect(users?.fields.find((item) => item.name === 'email')).toEqual(
            expect.objectContaining({ nullable: false, unique: true })
        );
        expect(
            users?.fields.find((item) => item.name === 'name')?.nullable
        ).toBe(true);
        expect(
            users?.fields.find((item) => item.name === 'status')?.type
        ).toEqual({ id: 'ct-account-status', name: 'account_status' });
        expect(
            users?.fields.find((item) => item.name === 'created_at')
        ).toEqual(
            expect.objectContaining({ nullable: false, default: 'now()' })
        );
        expect(posts?.fields.find((item) => item.name === 'published')).toEqual(
            expect.objectContaining({ nullable: false, default: 'false' })
        );
        expect(
            posts?.indexes.some((item) => item.name === 'posts_user_id_idx')
        ).toBe(true);
        expect(posts?.checkConstraints?.[0]?.expression).toBe("title <> ''");
        expect(
            comments?.fields.find((item) => item.name === 'body')?.nullable
        ).toBe(false);
        expect(diagram.relationships?.map((item) => item.name)).toEqual([
            'users_posts_fk',
            'posts_comments_fk',
        ]);
        expect(diagram.customTypes?.map((item) => item.name)).toEqual([
            'account_status',
        ]);
        expect(diagram.customTypes?.[0]?.values).toEqual([
            'active',
            'disabled',
        ]);
        expect(diagram.areas?.[0]?.name).toBe('Billing');
        expect(diagram.notes?.[0]?.content).toBe('Account status is an enum.');
    });

    it('describes an added table without changing the current canvas', () => {
        const current = b4MergeCatalogFixture();
        const incoming = b4CatalogWithAddedTags();

        expect(incoming.tables?.map((item) => item.name)).toEqual([
            'users',
            'posts',
            'comments',
            'tags',
        ]);
        expect(current.tables?.some((item) => item.name === 'tags')).toBe(
            false
        );
        expect(current.areas).toEqual(incoming.areas);
        expect(current.notes).toEqual(incoming.notes);
    });

    it('describes a removed table together with its relationship', () => {
        const incoming = b4CatalogWithoutComments();

        expect(incoming.tables?.map((item) => item.name)).toEqual([
            'users',
            'posts',
        ]);
        expect(
            incoming.relationships?.some(
                (item) => item.targetTableId === 'comments'
            )
        ).toBe(false);
    });

    it('describes a renamed table that keeps its id', () => {
        const incoming = b4CatalogWithRenamedPosts();
        const posts = incoming.tables?.find((item) => item.id === 'posts');

        expect(posts?.name).toBe('articles');
        expect(
            incoming.relationships?.find(
                (item) => item.id === 'rel-users-posts'
            )?.targetTableId
        ).toBe('posts');
    });

    it('describes an added field', () => {
        const users = b4CatalogWithNickname().tables?.find(
            (item) => item.id === 'users'
        );

        expect(users?.fields.map((item) => item.name)).toContain('nickname');
    });

    it('describes a removed field', () => {
        const users = b4CatalogWithoutUserName().tables?.find(
            (item) => item.id === 'users'
        );

        expect(users?.fields.map((item) => item.name)).not.toContain('name');
    });

    it('describes a renamed field that keeps its id', () => {
        const email = b4CatalogWithRenamedEmail()
            .tables?.find((item) => item.id === 'users')
            ?.fields.find((item) => item.id === 'users-email');

        expect(email?.name).toBe('email_address');
    });

    it('describes a field type change away from the enum', () => {
        const status = b4CatalogWithStatusAsText()
            .tables?.find((item) => item.id === 'users')
            ?.fields.find((item) => item.id === 'users-status');

        expect(status?.type).toEqual({ id: 'text', name: 'text' });
    });

    it('describes a nullability and default change', () => {
        const name = b4CatalogWithRequiredNameDefault()
            .tables?.find((item) => item.id === 'users')
            ?.fields.find((item) => item.id === 'users-name');

        expect(name).toEqual(
            expect.objectContaining({ nullable: false, default: "''" })
        );
    });

    it('describes relationship add, remove, and referential-action changes', () => {
        const incoming = b4CatalogWithRelationshipChanges();

        expect(
            incoming.relationships?.find(
                (item) => item.id === 'rel-users-posts'
            )?.onDelete
        ).toBe('restrict');
        expect(
            incoming.relationships?.some(
                (item) => item.id === 'rel-posts-comments'
            )
        ).toBe(false);
        expect(
            incoming.relationships?.some(
                (item) => item.name === 'users_comments_fk'
            )
        ).toBe(true);
    });

    it('describes an index change, a check change, and an unused incoming enum', () => {
        const incoming = b4CatalogWithIndexCheckAndUnusedType();
        const posts = incoming.tables?.find((item) => item.id === 'posts');

        expect(
            posts?.indexes.find((item) => item.id === 'posts-user-id-idx')
        ).toEqual(
            expect.objectContaining({
                name: 'posts_user_id_unique',
                unique: true,
            })
        );
        expect(posts?.checkConstraints?.[0]?.expression).toBe(
            'char_length(title) > 0'
        );
        expect(incoming.customTypes?.map((item) => item.name)).toEqual([
            'account_status',
            'priority',
        ]);
    });

    it('keeps current areas, notes, and the required enum in the add-table server result', () => {
        const current = b4MergeCatalogFixture();
        const incoming = b4IncomingTagsWithForeignCanvas();
        const result = b4ServerResultAfterAddingTags();

        expect(incoming.areas?.[0]?.name).toBe('Imported area');
        expect(incoming.notes?.[0]?.content).toBe('Imported note');
        expect(incoming.customTypes?.map((item) => item.name)).toContain(
            'priority'
        );
        expect(result.id).toBe(current.id);
        expect(result.areas).toEqual(current.areas);
        expect(result.notes).toEqual(current.notes);
        expect(result.customTypes).toEqual(current.customTypes);
        expect(result.tables?.some((item) => item.name === 'tags')).toBe(true);
        expect(
            result.tables?.find((item) => item.id === 'users')?.fields
        ).toEqual(current.tables?.find((item) => item.id === 'users')?.fields);
    });
});
