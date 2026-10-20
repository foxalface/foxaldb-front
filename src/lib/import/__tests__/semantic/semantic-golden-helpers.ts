import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sqlImportToDiagram } from '@/lib/data/sql-import';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { importSchema } from '@/lib/import/import-schema';
import { importDiagramFromJson } from '@/lib/import/import-diagram-from-json';
import {
    projectDiagramSemantics,
    type SemanticDiagram,
    type SemanticField,
    type SemanticTable,
} from '../../test-support/diagram-semantic-projection';

const fixturesDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '../fixtures/semantic'
);

export const readSemanticFixture = (fileName: string): string =>
    readFileSync(join(fixturesDir, fileName), 'utf8');

export const semanticFromSql = async (
    sql: string,
    sourceDatabaseType: DatabaseType,
    targetDatabaseType: DatabaseType = sourceDatabaseType
): Promise<SemanticDiagram> => {
    const diagram = await sqlImportToDiagram({
        sqlContent: sql,
        sourceDatabaseType,
        targetDatabaseType,
    });

    return projectDiagramSemantics(diagram);
};

export const semanticFromSqlFixture = async (
    fileName: string,
    sourceDatabaseType: DatabaseType,
    targetDatabaseType: DatabaseType = sourceDatabaseType
): Promise<SemanticDiagram> =>
    semanticFromSql(
        readSemanticFixture(fileName),
        sourceDatabaseType,
        targetDatabaseType
    );

export const semanticFromImportSchema = async (
    content: string,
    selectedDatabaseType: DatabaseType,
    resolvedSourceDialect?: DatabaseType
): Promise<SemanticDiagram> => {
    const result = await importSchema({
        content,
        selectedDatabaseType,
        resolvedSourceDialect,
    });

    return projectDiagramSemantics(result.diagram);
};

export const semanticFromDiagramJson = (
    content: string,
    databaseType: DatabaseType
): SemanticDiagram =>
    projectDiagramSemantics(importDiagramFromJson(content, databaseType));

export const findSemanticTable = (
    diagram: SemanticDiagram,
    tableName: string,
    schema?: string | null
): SemanticTable | undefined =>
    diagram.tables.find(
        (table) =>
            table.name === tableName &&
            (schema === undefined ? true : table.schema === schema)
    );

export const findSemanticField = (
    table: SemanticTable | undefined,
    fieldName: string
): SemanticField | undefined =>
    table?.fields.find((field) => field.name === fieldName);

export const postsToUsersFk = (
    diagram: SemanticDiagram
): SemanticDiagram['relationships'][number] | undefined =>
    diagram.relationships.find(
        (relationship) =>
            relationship.referencing.table === 'posts' &&
            relationship.referencing.field === 'user_id' &&
            relationship.referenced.table === 'users' &&
            relationship.referenced.field === 'id'
    );

export const rawRelationshipOrientation = (
    diagram: Diagram
): Array<{
    sourceTable: string;
    sourceField: string;
    targetTable: string;
    targetField: string;
}> => {
    const tables = diagram.tables ?? [];
    const tableById = new Map(tables.map((table) => [table.id, table]));

    return (diagram.relationships ?? []).map((relationship) => {
        const sourceTable = tableById.get(relationship.sourceTableId);
        const targetTable = tableById.get(relationship.targetTableId);
        const sourceField = sourceTable?.fields.find(
            (field) => field.id === relationship.sourceFieldId
        );
        const targetField = targetTable?.fields.find(
            (field) => field.id === relationship.targetFieldId
        );

        return {
            sourceTable: sourceTable?.name ?? '?',
            sourceField: sourceField?.name ?? '?',
            targetTable: targetTable?.name ?? '?',
            targetField: targetField?.name ?? '?',
        };
    });
};
