import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import {
    diagramToFlowElements,
    relationshipEdgesFromDiagram,
    tableToTableNode,
} from '../diagram-flow-elements';

const table = (
    id: string,
    name: string,
    options: {
        x?: number;
        y?: number;
        isView?: boolean;
        fields?: DBField[];
    } = {}
): DBTable => ({
    id,
    name,
    schema: 'public',
    x: options.x ?? 10,
    y: options.y ?? 20,
    fields: options.fields ?? [],
    indexes: [],
    color: '#8eb7ff',
    isView: options.isView ?? false,
    createdAt: 0,
});

describe('diagram-flow-elements', () => {
    it('maps a table to a node at its diagram position', () => {
        const node = tableToTableNode(table('t1', 'users', { x: 42, y: 99 }), {
            databaseType: DatabaseType.POSTGRESQL,
            filterLoading: false,
            forceShow: true,
        });

        expect(node.id).toBe('t1');
        expect(node.position).toEqual({ x: 42, y: 99 });
        expect(node.data.table.name).toBe('users');
    });

    it('maps a view through table node data', () => {
        const { nodes } = diagramToFlowElements(
            {
                id: 'd1',
                name: 'd',
                databaseType: DatabaseType.POSTGRESQL,
                tables: [table('v1', 'active_users', { isView: true })],
                createdAt: new Date(0),
                updatedAt: new Date(0),
            },
            {
                databaseType: DatabaseType.POSTGRESQL,
                forceShowTables: true,
                includeAreas: false,
                includeNotes: false,
                includeDependencies: false,
            }
        );

        expect(nodes).toHaveLength(1);
        const viewNode = nodes[0];
        expect(viewNode?.type).toBe('table');
        if (viewNode?.type === 'table') {
            expect(viewNode.data.table.isView).toBe(true);
        }
    });

    it('builds relationship edges with stable preview ids', () => {
        const relationships: DBRelationship[] = [
            {
                id: 'merge-preview-relationship-deadbeef',
                name: 'rel',
                sourceTableId: 't1',
                targetTableId: 't2',
                sourceFieldId: 'f1',
                targetFieldId: 'f2',
                sourceCardinality: 'one',
                targetCardinality: 'many',
                createdAt: 0,
            },
        ];

        const edges = relationshipEdgesFromDiagram(relationships);

        expect(edges).toHaveLength(1);
        expect(edges[0]?.id).toBe('merge-preview-relationship-deadbeef');
        expect(edges[0]?.source).toBe('t1');
        expect(edges[0]?.target).toBe('t2');
    });
});
