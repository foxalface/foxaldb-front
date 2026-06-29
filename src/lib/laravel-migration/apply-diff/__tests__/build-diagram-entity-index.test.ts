import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import { describe, expect, it } from 'vitest';
import {
    buildDiagramEntityIndex,
    resolveFieldByTableAndColumn,
    resolveTableByName,
} from '../build-diagram-entity-index';
import { foreignKeyMatchKey } from '../snapshot-match-key';

const usersTable: DBTable = {
    id: 'users-table-id',
    name: 'Users',
    x: 0,
    y: 0,
    fields: [
        {
            id: 'users-id-field',
            name: 'ID',
            type: { id: 'bigint', name: 'bigint' },
            primaryKey: true,
            unique: true,
            nullable: false,
            createdAt: 1,
        },
        {
            id: 'users-email-field',
            name: 'email',
            type: { id: 'varchar', name: 'varchar' },
            primaryKey: false,
            unique: true,
            nullable: false,
            createdAt: 1,
        },
    ],
    indexes: [
        {
            id: 'users-email-index',
            name: 'users_email_unique',
            unique: true,
            fieldIds: ['users-email-field'],
            createdAt: 1,
        },
    ],
    color: '#000000',
    isView: false,
    createdAt: 1,
};

const postsTable: DBTable = {
    id: 'posts-table-id',
    name: 'posts',
    x: 100,
    y: 100,
    fields: [
        {
            id: 'posts-id-field',
            name: 'id',
            type: { id: 'bigint', name: 'bigint' },
            primaryKey: true,
            unique: true,
            nullable: false,
            createdAt: 1,
        },
        {
            id: 'posts-user-id-field',
            name: 'user_id',
            type: { id: 'bigint', name: 'bigint' },
            primaryKey: false,
            unique: false,
            nullable: false,
            createdAt: 1,
        },
    ],
    indexes: [],
    color: '#000000',
    isView: false,
    createdAt: 1,
};

const postsUserRelationship: DBRelationship = {
    id: 'posts-user-relationship',
    name: 'posts_user_id_foreign',
    sourceTableId: postsTable.id,
    targetTableId: usersTable.id,
    sourceFieldId: 'posts-user-id-field',
    targetFieldId: 'users-id-field',
    sourceCardinality: 'many',
    targetCardinality: 'one',
    onDelete: 'cascade',
    onUpdate: 'restrict',
    createdAt: 1,
};

describe('buildDiagramEntityIndex', () => {
    it('resolves tables, fields, and foreign keys by normalized name', () => {
        const index = buildDiagramEntityIndex({
            tables: [usersTable, postsTable],
            relationships: [postsUserRelationship],
        });

        expect(resolveTableByName(index, 'users')).toBe(usersTable);
        expect(resolveTableByName(index, 'USERS')).toBe(usersTable);
        expect(resolveFieldByTableAndColumn(index, 'Users', 'ID')?.id).toBe(
            'users-id-field'
        );
        expect(
            resolveFieldByTableAndColumn(index, 'posts', 'user_id')?.id
        ).toBe('posts-user-id-field');

        const fkKey = foreignKeyMatchKey({
            localTable: 'posts',
            localColumn: 'user_id',
            referencedTable: 'users',
            referencedColumn: 'id',
            constraintName: 'posts_user_id_foreign',
            onDelete: 'cascade',
            onUpdate: 'restrict',
        });

        expect(index.relationshipByFkKey.get(fkKey)?.relationship.id).toBe(
            'posts-user-relationship'
        );
    });
});
