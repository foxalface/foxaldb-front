import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { sqlImportToDiagram } from '@/lib/data/sql-import';
import { importDBMLToDiagram } from '@/lib/dbml/dbml-import/dbml-import';
import { createRelationshipsFromMetadata } from '@/lib/data/import-metadata/import/relationships';
import type { ForeignKeyInfo } from '@/lib/data/import-metadata/metadata-types/foreign-key-info';
import { projectDiagramSemantics } from '../../test-support/diagram-semantic-projection';

const postsUsersRelationship = {
    referencing: { table: 'posts', field: 'user_id' },
    referenced: { table: 'users', field: 'id' },
};

describe('import relationship direction smoke (M11.1C)', () => {
    it('SQL import: posts.user_id references users.id', async () => {
        const sql = `
            CREATE TABLE users (
                id INT PRIMARY KEY
            );
            CREATE TABLE posts (
                id INT PRIMARY KEY,
                user_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `;

        const diagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.POSTGRESQL,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        const semantic = projectDiagramSemantics(diagram);
        expect(semantic.relationships).toHaveLength(1);
        expect(semantic.relationships[0]?.referencing).toMatchObject(
            postsUsersRelationship.referencing
        );
        expect(semantic.relationships[0]?.referenced).toMatchObject(
            postsUsersRelationship.referenced
        );
    });

    it('DBML import: posts.user_id references users.id', async () => {
        const dbml = `
            Table users {
              id int [pk]
            }
            Table posts {
              id int [pk]
              user_id int
            }
            Ref: posts.user_id > users.id
        `;

        const diagram = await importDBMLToDiagram(dbml, {
            databaseType: DatabaseType.POSTGRESQL,
        });

        const semantic = projectDiagramSemantics(diagram);
        expect(semantic.relationships).toHaveLength(1);
        expect(semantic.relationships[0]?.referencing).toMatchObject(
            postsUsersRelationship.referencing
        );
        expect(semantic.relationships[0]?.referenced).toMatchObject(
            postsUsersRelationship.referenced
        );
    });

    it('metadata import: playlists.user_id references users.user_id', () => {
        const usersTable = {
            id: 'users-table',
            name: 'users',
            schema: undefined,
            x: 0,
            y: 0,
            fields: [
                {
                    id: 'users-id-field',
                    name: 'user_id',
                    type: { id: 'int', name: 'int' },
                    primaryKey: true,
                    unique: true,
                    nullable: false,
                    createdAt: 1,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 1,
            width: 200,
            order: 0,
        };

        const playlistsTable = {
            id: 'playlists-table',
            name: 'playlists',
            schema: undefined,
            x: 0,
            y: 0,
            fields: [
                {
                    id: 'playlists-user-id-field',
                    name: 'user_id',
                    type: { id: 'int', name: 'int' },
                    primaryKey: false,
                    unique: false,
                    nullable: true,
                    createdAt: 1,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 1,
            width: 200,
            order: 0,
        };

        const foreignKeys: ForeignKeyInfo[] = [
            {
                schema: '',
                table: 'playlists',
                column: 'user_id',
                foreign_key_name: 'fk_playlists_user_id',
                reference_schema: '',
                reference_table: 'users',
                reference_column: 'user_id',
                fk_def: 'FOREIGN KEY (user_id) REFERENCES users(user_id)',
            },
        ];

        const relationships = createRelationshipsFromMetadata({
            foreignKeys,
            tables: [usersTable, playlistsTable],
        });

        const semantic = projectDiagramSemantics({
            id: 'd',
            name: 'meta',
            databaseType: DatabaseType.POSTGRESQL,
            createdAt: new Date(),
            updatedAt: new Date(),
            tables: [usersTable, playlistsTable],
            relationships,
        });

        expect(semantic.relationships).toHaveLength(1);
        expect(semantic.relationships[0]?.referencing).toMatchObject({
            table: 'playlists',
            field: 'user_id',
        });
        expect(semantic.relationships[0]?.referenced).toMatchObject({
            table: 'users',
            field: 'user_id',
        });
    });
});
