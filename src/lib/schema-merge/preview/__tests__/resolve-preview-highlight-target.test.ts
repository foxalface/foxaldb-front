import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DiffOperation } from '../../diff-types';
import { previewTableId } from '../preview-id';
import { tableIdentityKey } from '../identity-key';
import { resolvePreviewHighlightTarget } from '../resolve-preview-highlight-target';

const diagram: Diagram = {
    id: 'd1',
    name: 'd',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [
        {
            id: 't-users',
            name: 'users',
            schema: 'public',
            x: 0,
            y: 0,
            fields: [
                {
                    id: 'f-email',
                    name: 'email',
                    type: { id: 'varchar', name: 'varchar' },
                    primaryKey: false,
                    unique: false,
                    nullable: true,
                    createdAt: 0,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 0,
        },
    ],
    relationships: [
        {
            id: 'r1',
            name: 'r',
            sourceTableId: 't-users',
            targetTableId: 't-users',
            sourceFieldId: 'f-email',
            targetFieldId: 'f-email',
            sourceCardinality: 'one',
            targetCardinality: 'many',
            createdAt: 0,
        },
    ],
    createdAt: new Date(0),
    updatedAt: new Date(0),
};

describe('resolvePreviewHighlightTarget', () => {
    it('resolves field modify by entity id', () => {
        const operation = {
            id: 'op1',
            category: 'field',
            type: 'modify',
            entityId: 'f-email',
        } as DiffOperation;

        expect(resolvePreviewHighlightTarget(operation, diagram)).toEqual({
            tableId: 't-users',
            fieldId: 'f-email',
        });
    });

    it('resolves table add by preview id', () => {
        const identity = {
            kind: 'table' as const,
            schema: 'public',
            name: 'invoices',
        };
        const previewId = previewTableId(tableIdentityKey(identity));
        const withAdd: Diagram = {
            ...diagram,
            tables: [
                ...(diagram.tables ?? []),
                {
                    id: previewId,
                    name: 'invoices',
                    schema: 'public',
                    x: 100,
                    y: 0,
                    fields: [],
                    indexes: [],
                    color: '#fff',
                    isView: false,
                    createdAt: 0,
                },
            ],
        };

        const operation = {
            id: 'op-add',
            category: 'table',
            type: 'add',
            entityId: null,
            identity,
        } as DiffOperation;

        expect(resolvePreviewHighlightTarget(operation, withAdd)).toEqual({
            tableId: previewId,
        });
    });

    it('resolves relationship by entity id', () => {
        const operation = {
            id: 'op-rel',
            category: 'relationship',
            type: 'delete',
            entityId: 'r1',
        } as DiffOperation;

        expect(resolvePreviewHighlightTarget(operation, diagram)).toEqual({
            relationshipId: 'r1',
        });
    });
});
