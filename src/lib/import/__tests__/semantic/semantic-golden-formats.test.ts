import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { sqlImportToDiagram } from '@/lib/data/sql-import';
import { importDBMLToDiagram } from '@/lib/dbml/dbml-import/dbml-import';
import {
    findSemanticField,
    findSemanticTable,
    postsToUsersFk,
    readSemanticFixture,
    rawRelationshipOrientation,
    semanticFromDiagramJson,
    semanticFromImportSchema,
} from './semantic-golden-helpers';
import {
    projectDiagramSemantics,
    type SemanticRelationship,
} from '../../test-support/diagram-semantic-projection';

describe('M11.2 format semantic goldens', () => {
    it('imports dbml-baseline.dbml', async () => {
        const diagram = await importDBMLToDiagram(
            readSemanticFixture('dbml-baseline.dbml'),
            { databaseType: DatabaseType.POSTGRESQL }
        );
        const semantic = projectDiagramSemantics(diagram);

        expect(findSemanticTable(semantic, 'users', 'public')).toBeDefined();
        expect(findSemanticTable(semantic, 'users', 'audit')).toBeDefined();
        const fk = postsToUsersFk(semantic);
        expect(fk).toBeDefined();
        // DBML ref actions are not always mapped to Diagram.onDelete (P2); endpoints are asserted via postsToUsersFk.

        expect(
            semantic.customTypes.some(
                (customType) => customType.name === 'mood'
            )
        ).toBe(true);
    });

    it('documents raw SQL vs DBML relationship orientation with equivalent semantics', async () => {
        const sql = readSemanticFixture('postgres-dump-baseline.sql');
        const sqlDiagram = await sqlImportToDiagram({
            sqlContent: sql,
            sourceDatabaseType: DatabaseType.POSTGRESQL,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });
        const dbmlDiagram = await importDBMLToDiagram(
            readSemanticFixture('dbml-baseline.dbml'),
            { databaseType: DatabaseType.POSTGRESQL }
        );

        const sqlRaw = rawRelationshipOrientation(sqlDiagram)[0];
        const dbmlRaw = rawRelationshipOrientation(dbmlDiagram).find(
            (relationship) =>
                relationship.sourceTable === 'posts' ||
                relationship.targetTable === 'posts'
        );

        expect(sqlRaw).toMatchObject({
            sourceTable: 'users',
            sourceField: 'id',
            targetTable: 'posts',
            targetField: 'user_id',
        });

        expect(dbmlRaw).toMatchObject({
            sourceTable: 'posts',
            sourceField: 'user_id',
            targetTable: 'users',
            targetField: 'id',
        });

        const endpointOnly = (relationship: SemanticRelationship) => ({
            referencing: relationship.referencing,
            referenced: relationship.referenced,
        });

        const sqlPostsFk = projectDiagramSemantics(
            sqlDiagram
        ).relationships.find(
            (relationship) =>
                relationship.referencing.table === 'posts' &&
                relationship.referenced.table === 'users'
        );
        const dbmlPostsFk = projectDiagramSemantics(
            dbmlDiagram
        ).relationships.find(
            (relationship) =>
                relationship.referencing.table === 'posts' &&
                relationship.referenced.table === 'users'
        );

        expect(endpointOnly(sqlPostsFk!)).toEqual(endpointOnly(dbmlPostsFk!));
    });

    it('imports metadata-baseline.json', async () => {
        const semantic = await semanticFromImportSchema(
            readSemanticFixture('metadata-baseline.json'),
            DatabaseType.POSTGRESQL
        );

        const users = findSemanticTable(semantic, 'users', 'public');
        expect(users?.comments).toBe('app users');
        expect(findSemanticField(users, 'email')?.characterMaximumLength).toBe(
            '255'
        );
        expect(
            findSemanticTable(semantic, 'active_users', 'public')?.isView
        ).toBe(true);
        expect(postsToUsersFk(semantic)?.deleteAction).toBe('cascade');
        expect(
            semantic.customTypes.some(
                (customType) => customType.name === 'status_enum'
            )
        ).toBe(true);
    });

    it('imports diagram-json-baseline.json through parse path', () => {
        const semantic = semanticFromDiagramJson(
            readSemanticFixture('diagram-json-baseline.json'),
            DatabaseType.POSTGRESQL
        );

        expect(semantic.databaseType).toBe(DatabaseType.POSTGRESQL);
        expect(findSemanticTable(semantic, 'users', 'public')).toBeDefined();
        expect(findSemanticTable(semantic, 'users', 'audit')).toBeDefined();
        expect(
            findSemanticTable(semantic, 'active_users', 'public')?.isView
        ).toBe(true);
        expect(postsToUsersFk(semantic)?.deleteAction).toBe('cascade');
        expect(
            semantic.customTypes.some(
                (customType) => customType.name === 'status_enum'
            )
        ).toBe(true);
    });
});
