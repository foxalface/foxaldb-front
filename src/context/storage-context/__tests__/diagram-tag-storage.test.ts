import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramTagAssignment } from '@/lib/domain/diagram-tag';
import { canonicalizeTagAssignments } from '@/lib/domain/diagram-tag';
import {
    CHART_DB_SCHEMA_VERSION,
    chartDbV13Stores,
    chartDbV14Stores,
    chartDbV15Stores,
} from '../chart-db-schema';
import { storageInitialValue } from '../storage-context';
import {
    attachStoredTags,
    tagAssignmentFromRow,
    tagFromRow,
    toStoredTag,
    toStoredTagAssignment,
    type StoredDiagramTag,
    type StoredDiagramTagAssignment,
} from '../diagram-tag-rows';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const usersTable = (id: string): DBTable => ({
    id,
    name: 'users',
    x: 0,
    y: 0,
    fields: [
        {
            id: `${id}-email`,
            name: 'email',
            type: { id: 'varchar', name: 'varchar' },
            primaryKey: false,
            unique: false,
            nullable: true,
            createdAt: 1,
        },
    ],
    indexes: [],
    color: '#8eb7ff',
    isView: false,
    createdAt: 1,
});

class MemoryTagDb {
    tags: StoredDiagramTag[] = [];
    assignments: StoredDiagramTagAssignment[] = [];

    addDiagram(diagram: Diagram): void {
        const canonical = canonicalizeTagAssignments(diagram);

        for (const tag of canonical.tags ?? []) {
            this.tags.push(toStoredTag(diagram.id, tag));
        }

        for (const assignment of canonical.tagAssignments ?? []) {
            this.assignments.push(
                toStoredTagAssignment(diagram.id, assignment)
            );
        }
    }

    read(diagram: Diagram, includeTables: boolean): Diagram {
        const tags = this.tags
            .filter((row) => row.diagramId === diagram.id)
            .map((row) => tagFromRow(row));
        const tagAssignments = this.assignments
            .filter((row) => row.diagramId === diagram.id)
            .map((row) => tagAssignmentFromRow(row));
        const attached = attachStoredTags(diagram, tags, tagAssignments, {
            includeTables,
            includeRelationships: true,
        });

        return {
            ...diagram,
            ...attached,
        };
    }

    addAssignment(diagramId: string, assignment: DiagramTagAssignment): void {
        this.assignments.push(toStoredTagAssignment(diagramId, assignment));
    }

    deleteDiagram(diagramId: string): void {
        this.tags = this.tags.filter((row) => row.diagramId !== diagramId);
        this.assignments = this.assignments.filter(
            (row) => row.diagramId !== diagramId
        );
    }
}

describe('Dexie tag schema', () => {
    it('keeps version 13 stores and adds tag stores at version 14', () => {
        expect(chartDbV13Stores.diagram_filters).toBe(
            'diagramId, tableIds, schemasIds'
        );
        expect(chartDbV14Stores.diagram_filters).toBe(
            chartDbV13Stores.diagram_filters
        );
        expect(chartDbV13Stores).not.toHaveProperty('tags');
        expect(chartDbV13Stores).not.toHaveProperty('tag_assignments');
        expect(chartDbV14Stores.tags).toBe('++id, diagramId, name, color');
        expect(chartDbV14Stores.tag_assignments).toBe(
            '++id, diagramId, tagId, targetType, targetId'
        );
        expect(Object.keys(chartDbV14Stores).sort()).toEqual(
            [...Object.keys(chartDbV13Stores), 'tag_assignments', 'tags'].sort()
        );
    });

    it('drops diagram_filters at version 15 and keeps the other stores', () => {
        expect(CHART_DB_SCHEMA_VERSION).toBe(15);
        expect(chartDbV15Stores).not.toHaveProperty('diagram_filters');
        expect(chartDbV15Stores.tags).toBe(chartDbV14Stores.tags);
        expect(chartDbV15Stores.tag_assignments).toBe(
            chartDbV14Stores.tag_assignments
        );
        expect(chartDbV15Stores.diagrams).toBe(chartDbV14Stores.diagrams);
        expect(chartDbV15Stores.db_tables).toBe(chartDbV14Stores.db_tables);
        expect(chartDbV15Stores.db_relationships).toBe(
            chartDbV14Stores.db_relationships
        );
        expect(chartDbV15Stores.db_dependencies).toBe(
            chartDbV14Stores.db_dependencies
        );
        expect(chartDbV15Stores.areas).toBe(chartDbV14Stores.areas);
        expect(chartDbV15Stores.db_custom_types).toBe(
            chartDbV14Stores.db_custom_types
        );
        expect(chartDbV15Stores.notes).toBe(chartDbV14Stores.notes);
        expect(chartDbV15Stores.config).toBe(chartDbV14Stores.config);
        expect(storageInitialValue).not.toHaveProperty('getDiagramFilter');
        expect(storageInitialValue).not.toHaveProperty('updateDiagramFilter');
        expect(storageInitialValue).not.toHaveProperty('deleteDiagramFilter');
    });
});

describe('device tag persistence mapping', () => {
    const diagramFor = (id: string, tagId: string): Diagram => ({
        id,
        name: id,
        databaseType: DatabaseType.POSTGRESQL,
        tables: [usersTable(`${id}-table`)],
        relationships: [],
        tags: [{ id: tagId, name: 'Backend', color: '#8eb7ff' }],
        tagAssignments: [
            {
                id: `${id}-assignment`,
                tagId,
                targetType: 'table',
                targetId: `${id}-table`,
            },
        ],
        createdAt,
        updatedAt: createdAt,
    });

    it('adds, reads, replaces, and deletes tags without cross-diagram leakage', () => {
        const db = new MemoryTagDb();
        db.addDiagram(diagramFor('diagram-a', 'tag-a'));
        db.addDiagram(diagramFor('diagram-b', 'tag-b'));

        const loaded = db.read(
            {
                ...diagramFor('diagram-a', 'tag-a'),
                tags: undefined,
                tagAssignments: undefined,
            },
            true
        );

        expect(loaded.tags).toEqual([
            { id: 'tag-a', name: 'Backend', color: '#8eb7ff' },
        ]);
        expect(loaded.tagAssignments?.[0]?.targetId).toBe('diagram-a-table');
        expect(loaded.tags?.[0]).not.toHaveProperty('diagramId');

        const empty = db.read(
            {
                id: 'diagram-empty',
                name: 'Empty',
                databaseType: DatabaseType.GENERIC,
                createdAt,
                updatedAt: createdAt,
            },
            false
        );
        expect(empty.tags).toEqual([]);
        expect(empty.tagAssignments).toEqual([]);

        db.addAssignment('diagram-a', {
            id: 'dangling',
            tagId: 'tag-a',
            targetType: 'field',
            targetId: 'missing-field',
        });
        const canonical = db.read(
            {
                ...diagramFor('diagram-a', 'tag-a'),
                tags: undefined,
                tagAssignments: undefined,
            },
            true
        );
        expect(canonical.tagAssignments?.map((item) => item.id)).toEqual([
            'diagram-a-assignment',
        ]);

        db.deleteDiagram('diagram-a');
        db.addDiagram(diagramFor('diagram-a', 'tag-replaced'));
        const replaced = db.read(
            {
                ...diagramFor('diagram-a', 'tag-replaced'),
                tags: undefined,
                tagAssignments: undefined,
            },
            true
        );
        const other = db.read(
            {
                ...diagramFor('diagram-b', 'tag-b'),
                tags: undefined,
                tagAssignments: undefined,
            },
            true
        );

        expect(replaced.tags?.[0]?.id).toBe('tag-replaced');
        expect(other.tags?.[0]?.id).toBe('tag-b');

        db.deleteDiagram('diagram-a');
        const removed = db.read(
            {
                id: 'diagram-a',
                name: 'Gone',
                databaseType: DatabaseType.GENERIC,
                tables: [usersTable('diagram-a-table')],
                createdAt,
                updatedAt: createdAt,
            },
            true
        );
        expect(removed.tags).toEqual([]);
        expect(removed.tagAssignments).toEqual([]);
    });
});
