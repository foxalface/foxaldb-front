import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramCommentTarget } from '@/lib/comments/comment-types';

export const DIAGRAM_DISCUSSION_TARGET: DiagramCommentTarget = Object.freeze({
    targetType: 'diagram',
    targetId: null,
});

export type ResolvedDiscussionTarget =
    | { kind: 'diagram' }
    | { kind: 'table'; name: string }
    | { kind: 'field'; tableName: string; fieldName: string }
    | {
          kind: 'relationship';
          name: string | null;
          sourceTableName: string | null;
          targetTableName: string | null;
      }
    | {
          kind: 'missing';
          targetType: 'table' | 'field' | 'relationship';
      };

export interface DiscussionTargetResolutionInput {
    tables: ReadonlyArray<DBTable>;
    relationships: ReadonlyArray<DBRelationship>;
}

const findTableById = (
    tables: ReadonlyArray<DBTable>,
    tableId: string
): DBTable | undefined => tables.find((table) => table.id === tableId);

const findFieldInTables = (
    tables: ReadonlyArray<DBTable>,
    fieldId: string
): { table: DBTable; fieldName: string } | undefined => {
    for (const table of tables) {
        const field = table.fields.find((entry) => entry.id === fieldId);
        if (field) {
            return { table, fieldName: field.name };
        }
    }
    return undefined;
};

const resolveRelationshipDisplayName = (name: string): string | null => {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : null;
};

export const resolveDiscussionTarget = (
    target: DiagramCommentTarget,
    input: DiscussionTargetResolutionInput
): ResolvedDiscussionTarget => {
    if (target.targetType === 'diagram') {
        return { kind: 'diagram' };
    }

    if (target.targetType === 'table') {
        const table = findTableById(input.tables, target.targetId);
        if (!table) {
            return { kind: 'missing', targetType: 'table' };
        }
        return { kind: 'table', name: table.name };
    }

    if (target.targetType === 'field') {
        const match = findFieldInTables(input.tables, target.targetId);
        if (!match) {
            return { kind: 'missing', targetType: 'field' };
        }
        return {
            kind: 'field',
            tableName: match.table.name,
            fieldName: match.fieldName,
        };
    }

    const relationship = input.relationships.find(
        (entry) => entry.id === target.targetId
    );
    if (!relationship) {
        return { kind: 'missing', targetType: 'relationship' };
    }

    const sourceTable = findTableById(input.tables, relationship.sourceTableId);
    const targetTable = findTableById(input.tables, relationship.targetTableId);

    return {
        kind: 'relationship',
        name: resolveRelationshipDisplayName(relationship.name),
        sourceTableName: sourceTable?.name ?? null,
        targetTableName: targetTable?.name ?? null,
    };
};
