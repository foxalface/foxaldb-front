import { describe, expect, it } from 'vitest';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import {
    buildRemoveTablesOperationData,
    collectRelationshipIdsForRemovedTables,
} from '../remove-tables-operation';

const field = (id: string, name: string) => ({
    id,
    name,
    type: 'varchar',
    primaryKey: false,
    unique: false,
    nullable: false,
    createdAt: 1,
});

const table = (
    id: string,
    name: string,
    fields: ReturnType<typeof field>[]
): DBTable =>
    ({
        id,
        name,
        schema: null,
        x: 0,
        y: 0,
        fields,
        indexes: [],
        color: '#ffffff',
        isView: false,
        createdAt: 1,
        width: 200,
        order: 0,
    }) as unknown as DBTable;

const relationship = (
    id: string,
    sourceTableId: string,
    targetTableId: string
): DBRelationship =>
    ({
        id,
        name: id,
        sourceTableId,
        targetTableId,
        sourceFieldId: 'source-field',
        targetFieldId: 'target-field',
        sourceCardinality: 'one',
        targetCardinality: 'many',
    }) as DBRelationship;

describe('buildRemoveTablesOperationData', () => {
    it('includes all field IDs from removed tables', () => {
        const tableA = table('table-a', 'users', [
            field('field-a1', 'id'),
            field('field-a2', 'email'),
        ]);

        const payload = buildRemoveTablesOperationData(
            ['table-a'],
            [tableA],
            []
        );

        expect(payload.tableIds).toEqual(['table-a']);
        expect(payload.fieldIds).toEqual(['field-a1', 'field-a2']);
        expect(payload.relationshipIds).toEqual([]);
    });

    it('includes relationship IDs from the removed relationship set', () => {
        const tableA = table('table-a', 'users', [field('field-a1', 'id')]);
        const connected = relationship('rel-ab', 'table-a', 'table-b');

        const payload = buildRemoveTablesOperationData(
            ['table-a'],
            [tableA],
            [connected]
        );

        expect(payload.relationshipIds).toEqual(['rel-ab']);
    });

    it('supports multiple removed tables with deduplicated identifiers', () => {
        const tableA = table('table-a', 'users', [field('field-a1', 'id')]);
        const tableB = table('table-b', 'posts', [field('field-b1', 'title')]);
        const relAb = relationship('rel-ab', 'table-a', 'table-b');
        const relBb = relationship('rel-bb', 'table-b', 'table-b');

        const payload = buildRemoveTablesOperationData(
            ['table-a', 'table-b', 'table-a'],
            [tableA, tableB],
            [relAb, relBb]
        );

        expect(payload.tableIds).toEqual(['table-a', 'table-b']);
        expect(payload.fieldIds).toEqual(['field-a1', 'field-b1']);
        expect(payload.relationshipIds).toEqual(['rel-ab', 'rel-bb']);
    });

    it('uses exact property names and allows empty field and relationship arrays', () => {
        const tableA = table('table-a', 'users', []);

        const payload = buildRemoveTablesOperationData(
            ['table-a'],
            [tableA],
            []
        );

        expect(payload).toEqual({
            tableIds: ['table-a'],
            fieldIds: [],
            relationshipIds: [],
        });
    });
});

describe('collectRelationshipIdsForRemovedTables', () => {
    it('returns relationships connected to any removed table', () => {
        const relationships = [
            relationship('rel-ab', 'table-a', 'table-b'),
            relationship('rel-bb', 'table-b', 'table-b'),
        ];

        expect(
            collectRelationshipIdsForRemovedTables(['table-a'], relationships)
        ).toEqual(['rel-ab']);
    });
});
