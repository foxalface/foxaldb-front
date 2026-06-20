import { describe, expect, it } from 'vitest';
import type { DBField, DBTable } from '@/lib/domain';
import { createRelationshipsFromMetadata } from '../relationships';
import type { ForeignKeyInfo } from '../../metadata-types/foreign-key-info';

const createField = (
    id: string,
    name: string,
    options: Partial<DBField> = {}
): DBField => ({
    id,
    name,
    type: { id: 'int', name: 'int' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 1,
    ...options,
});

const createTable = (
    id: string,
    name: string,
    fields: DBField[],
    schema?: string
): DBTable => ({
    id,
    name,
    schema,
    x: 0,
    y: 0,
    fields,
    indexes: [],
    color: '#ffffff',
    isView: false,
    createdAt: 1,
    width: 200,
    order: 0,
});

describe('createRelationshipsFromMetadata referential actions', () => {
    const usersTable = createTable('users-table', 'users', [
        createField('users-id-field', 'user_id', {
            primaryKey: true,
            unique: true,
            nullable: false,
        }),
    ]);

    const playlistsTable = createTable('playlists-table', 'playlists', [
        createField('playlists-id-field', 'playlist_id', {
            primaryKey: true,
            unique: true,
            nullable: false,
        }),
        createField('playlists-user-id-field', 'user_id'),
    ]);

    const tables = [usersTable, playlistsTable];

    const createForeignKey = (fkDef: string): ForeignKeyInfo => ({
        schema: '',
        table: 'playlists',
        column: 'user_id',
        foreign_key_name: 'fk_playlists_user_id',
        reference_schema: '',
        reference_table: 'users',
        reference_column: 'user_id',
        fk_def: fkDef,
    });

    it('preserves ON DELETE CASCADE from fk_def', () => {
        const relationships = createRelationshipsFromMetadata({
            foreignKeys: [
                createForeignKey(
                    'FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE'
                ),
            ],
            tables,
        });

        expect(relationships).toHaveLength(1);
        expect(relationships[0]?.onDelete).toBe('cascade');
        expect(relationships[0]?.onUpdate).toBeUndefined();
    });

    it('preserves ON UPDATE RESTRICT from fk_def', () => {
        const relationships = createRelationshipsFromMetadata({
            foreignKeys: [
                createForeignKey(
                    'FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE RESTRICT'
                ),
            ],
            tables,
        });

        expect(relationships).toHaveLength(1);
        expect(relationships[0]?.onUpdate).toBe('restrict');
        expect(relationships[0]?.onDelete).toBeUndefined();
    });

    it('omits unsupported referential actions from fk_def', () => {
        const relationships = createRelationshipsFromMetadata({
            foreignKeys: [
                createForeignKey(
                    'FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET DEFAULT ON UPDATE NO ACTION'
                ),
            ],
            tables,
        });

        expect(relationships).toHaveLength(1);
        expect(relationships[0]?.onDelete).toBeUndefined();
        expect(relationships[0]?.onUpdate).toBeUndefined();
    });

    it('leaves relationships without actions unchanged', () => {
        const relationships = createRelationshipsFromMetadata({
            foreignKeys: [
                createForeignKey(
                    'FOREIGN KEY (user_id) REFERENCES users(user_id)'
                ),
            ],
            tables,
        });

        expect(relationships).toHaveLength(1);
        expect(relationships[0]?.onDelete).toBeUndefined();
        expect(relationships[0]?.onUpdate).toBeUndefined();
    });
});
