import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiffOperation } from '../../diff-types';
import { buildMergePreviewFlowDecorationMaps } from '@/dialogs/merge-wizard/merge-preview-decoration-maps';
import { diagramToFlowElements } from '@/pages/editor-page/canvas/diagram-flow-elements';
import type { RelationshipEdgeType } from '@/pages/editor-page/canvas/relationship-edge/relationship-edge';
import { buildSchemaMergePreview } from '../build-schema-merge-preview';
import { getMergePreviewEdgeClasses } from '../merge-preview-visual';

const field = (id: string, name: string): DBField => ({
    id,
    name,
    type: { id: 'bigint', name: 'bigint' },
    primaryKey: name === 'id',
    unique: false,
    nullable: name !== 'id',
    createdAt: 0,
});

const table = (id: string, name: string, fields: DBField[]): DBTable => ({
    id,
    name,
    schema: 'public',
    x: 0,
    y: 0,
    width: 280,
    fields,
    indexes: [],
    color: '#8eb7ff',
    isView: false,
    createdAt: 0,
});

const relationship = (
    id: string,
    sourceTableId: string,
    targetTableId: string,
    sourceFieldId: string,
    targetFieldId: string
): DBRelationship => ({
    id,
    name: id,
    sourceTableId,
    targetTableId,
    sourceFieldId,
    targetFieldId,
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 0,
});

const diagram = (
    tables: DBTable[],
    relationships: DBRelationship[]
): Diagram => ({
    id: 'd1',
    name: 'Test',
    databaseType: DatabaseType.MYSQL,
    tables,
    relationships,
    createdAt: new Date(0),
    updatedAt: new Date(0),
});

describe('relationship preview decoration pipeline', () => {
    it('projects ADD and DELETE relationships onto flow edges with semantic styling', () => {
        const base = diagram(
            [
                table('t-users', 'users', [field('f-user-id', 'id')]),
                table('t-posts', 'posts', [
                    field('f-post-id', 'id'),
                    field('f-post-user', 'user_id'),
                ]),
                table('t-invoices', 'invoices', [
                    field('f-invoice-id', 'id'),
                    field('f-invoice-user', 'user_id'),
                ]),
            ],
            [
                relationship(
                    'r-delete',
                    't-users',
                    't-posts',
                    'f-user-id',
                    'f-post-user'
                ),
            ]
        );

        const incoming = diagram(
            [
                table('i-users', 'users', [field('if-user-id', 'id')]),
                table('i-posts', 'posts', [
                    field('if-post-id', 'id'),
                    field('if-post-user', 'user_id'),
                ]),
                table('i-invoices', 'invoices', [
                    field('if-invoice-id', 'id'),
                    field('if-invoice-user', 'user_id'),
                ]),
            ],
            [
                relationship(
                    'incoming-add',
                    'i-users',
                    'i-invoices',
                    'if-user-id',
                    'if-invoice-user'
                ),
            ]
        );

        const addId = 'op-rel-add';
        const deleteId = 'op-rel-delete';
        const operations = [
            {
                id: addId,
                category: 'relationship',
                type: 'add',
                entityId: null,
                renameTo: null,
                identity: {
                    kind: 'relationship',
                    source: { schema: 'public', table: 'users', field: 'id' },
                    target: {
                        schema: 'public',
                        table: 'invoices',
                        field: 'user_id',
                    },
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            },
            {
                id: deleteId,
                category: 'relationship',
                type: 'delete',
                entityId: 'r-delete',
                renameTo: null,
                identity: {
                    kind: 'relationship',
                    source: { schema: 'public', table: 'users', field: 'id' },
                    target: {
                        schema: 'public',
                        table: 'posts',
                        field: 'user_id',
                    },
                },
                before: null,
                after: null,
                changes: [],
                dependsOn: [],
            },
        ] as DiffOperation[];

        const preview = buildSchemaMergePreview({
            baseDiagram: base,
            incomingDiagram: incoming,
            operations,
            selectedOperationIds: new Set([addId, deleteId]),
            viewsCompared: true,
            defaultSchema: 'public',
        });

        const added = preview.diagram.relationships?.find(
            (item) => item.targetTableId === 't-invoices'
        );
        const deleted = preview.diagram.relationships?.find(
            (item) => item.id === 'r-delete'
        );

        expect(added).toBeTruthy();
        expect(added?.id).not.toBe('incoming-add');
        expect(deleted).toBeTruthy();
        expect(preview.decorations.relationships[added!.id]).toEqual({
            change: 'add',
            operationId: addId,
        });
        expect(preview.decorations.relationships['r-delete']).toEqual({
            change: 'delete',
            operationId: deleteId,
        });

        const maps = buildMergePreviewFlowDecorationMaps(
            preview.diagram,
            preview.decorations
        );
        const flow = diagramToFlowElements(preview.diagram, {
            databaseType: preview.diagram.databaseType,
            forceShowTables: true,
            showDBViews: true,
            filterLoading: false,
            includeAreas: false,
            includeNotes: false,
            includeDependencies: false,
            mergePreviewByTableId: maps.mergePreviewByTableId,
            mergePreviewByRelationshipId: maps.mergePreviewByRelationshipId,
        });

        const edges = flow.edges.filter(
            (edge): edge is RelationshipEdgeType =>
                edge.type === 'relationship-edge'
        );

        const addEdge = edges.find((edge) => edge.id === added!.id);
        const deleteEdge = edges.find((edge) => edge.id === 'r-delete');

        expect(addEdge?.data?.mergePreview).toMatchObject({
            change: 'add',
            operationId: addId,
        });
        expect(addEdge?.data?.mergePreview?.indicatorLane).toEqual(
            expect.any(Number)
        );
        expect(
            getMergePreviewEdgeClasses(
                addEdge?.data?.mergePreview?.change,
                false
            )
        ).toMatchObject({
            stroke: expect.stringContaining('emerald'),
            dashed: false,
        });

        expect(deleteEdge?.data?.mergePreview).toMatchObject({
            change: 'delete',
            operationId: deleteId,
        });
        expect(deleteEdge?.data?.mergePreview?.indicatorLane).toEqual(
            expect.any(Number)
        );
        expect(
            getMergePreviewEdgeClasses(
                deleteEdge?.data?.mergePreview?.change,
                false
            )
        ).toMatchObject({
            stroke: expect.stringContaining('red'),
            dashed: true,
        });
    });
});
