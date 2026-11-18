import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { diagramSchema, type Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import {
    canonicalizeTagAssignments,
    cloneTableTagAssignments,
    diagramTagAssignmentSchema,
    diagramTagSchema,
    matchesTags,
    type DiagramTag,
    type DiagramTagAssignment,
} from '@/lib/domain/diagram-tag';
import { cloneDiagram, cloneTable } from '@/lib/clone';
import {
    DIAGRAM_JSON_SCHEMA_VERSION,
    diagramFromJSONInput,
    diagramToJSONOutput,
} from '@/lib/export-import-utils';
import { convertTemplateToNewDiagram } from '@/templates-data/template-utils';
import type { Template } from '@/templates-data/templates-data';
import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import { diagramAutosavePayload } from '@/lib/diagram-autosave/diagram-autosave-controller';

const createdAt = new Date('2024-01-01T00:00:00.000Z');

const field = (id: string, name: string): DBTable['fields'][number] => ({
    id,
    name,
    type: { id: 'varchar', name: 'varchar' },
    primaryKey: name === 'id',
    unique: name === 'id',
    nullable: false,
    createdAt: 1,
});

const table = (overrides: Partial<DBTable> = {}): DBTable => ({
    id: 'table-users',
    name: 'users',
    x: 0,
    y: 0,
    fields: [field('field-id', 'id'), field('field-email', 'email')],
    indexes: [],
    color: '#8eb7ff',
    isView: false,
    createdAt: 1,
    ...overrides,
});

const relationship = (
    overrides: Partial<DBRelationship> = {}
): DBRelationship => ({
    id: 'rel-1',
    name: 'users_posts',
    sourceTableId: 'table-users',
    targetTableId: 'table-posts',
    sourceFieldId: 'field-id',
    targetFieldId: 'field-post-user',
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 1,
    ...overrides,
});

const tag = (id: string, name: string): DiagramTag => ({
    id,
    name,
    color: '#8eb7ff',
});

const assignment = (
    id: string,
    tagId: string,
    targetType: DiagramTagAssignment['targetType'],
    targetId: string
): DiagramTagAssignment => ({
    id,
    tagId,
    targetType,
    targetId,
});

const diagram = (overrides: Partial<Diagram> = {}): Diagram => ({
    id: 'diagram-1',
    name: 'Tagged',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [table()],
    relationships: [],
    dependencies: [],
    areas: [],
    customTypes: [],
    notes: [],
    createdAt,
    updatedAt: createdAt,
    ...overrides,
});

describe('diagram tag schema', () => {
    it('parses a diagram without tag data as empty arrays', () => {
        const parsed = diagramSchema.parse({
            id: 'd1',
            name: 'legacy',
            databaseType: DatabaseType.MYSQL,
            createdAt,
            updatedAt: createdAt,
        });

        expect(parsed.tags).toEqual([]);
        expect(parsed.tagAssignments).toEqual([]);
    });

    it('accepts table, field, and relationship assignments', () => {
        expect(diagramTagSchema.parse(tag('tag-backend', 'Backend')).name).toBe(
            'Backend'
        );

        for (const targetType of ['table', 'field', 'relationship'] as const) {
            expect(
                diagramTagAssignmentSchema.parse(
                    assignment('as-1', 'tag-backend', targetType, 'target-1')
                ).targetType
            ).toBe(targetType);
        }
    });

    it('rejects an unknown target type and empty tag identity', () => {
        expect(
            diagramTagAssignmentSchema.safeParse({
                id: 'as-1',
                tagId: 'tag-backend',
                targetType: 'view',
                targetId: 'table-users',
            }).success
        ).toBe(false);
        expect(
            diagramTagSchema.safeParse({
                id: '',
                name: 'Backend',
                color: '#fff',
            }).success
        ).toBe(false);
    });
});

describe('matchesTags', () => {
    const selected = ['Backend', 'MVP'];

    const cases: Array<{
        entity: string[];
        any: boolean;
        all: boolean;
        none: boolean;
    }> = [
        { entity: ['Backend'], any: true, all: false, none: false },
        { entity: ['MVP'], any: true, all: false, none: false },
        { entity: ['Backend', 'MVP'], any: true, all: true, none: false },
        { entity: ['Backend', 'Legacy'], any: true, all: false, none: false },
        { entity: ['Security'], any: false, all: false, none: true },
        { entity: [], any: false, all: false, none: true },
    ];

    it.each(cases)('matches $entity', ({ entity, any, all, none }) => {
        expect(
            matchesTags({
                entityTagIds: entity,
                selectedTagIds: selected,
                mode: 'any',
            })
        ).toBe(any);
        expect(
            matchesTags({
                entityTagIds: entity,
                selectedTagIds: selected,
                mode: 'all',
            })
        ).toBe(all);
        expect(
            matchesTags({
                entityTagIds: entity,
                selectedTagIds: selected,
                mode: 'none',
            })
        ).toBe(none);
    });

    it('treats an empty selection as no constraint for every mode', () => {
        for (const mode of ['any', 'all', 'none'] as const) {
            expect(
                matchesTags({
                    entityTagIds: [],
                    selectedTagIds: [],
                    mode,
                })
            ).toBe(true);
            expect(
                matchesTags({
                    entityTagIds: ['Security'],
                    selectedTagIds: [],
                    mode,
                })
            ).toBe(true);
        }
    });

    it('accepts duplicate ids and does not mutate the caller', () => {
        const entity = Object.freeze(['Backend', 'Backend']);
        const selectedTags = Object.freeze(['Backend', 'Backend', 'MVP']);

        expect(
            matchesTags({
                entityTagIds: entity,
                selectedTagIds: selectedTags,
                mode: 'any',
            })
        ).toBe(true);
        expect(
            matchesTags({
                entityTagIds: entity,
                selectedTagIds: selectedTags,
                mode: 'all',
            })
        ).toBe(false);
        expect(entity).toEqual(['Backend', 'Backend']);
        expect(selectedTags).toEqual(['Backend', 'Backend', 'MVP']);
    });
});

describe('canonicalizeTagAssignments', () => {
    const tags = [tag('tag-backend', 'Backend'), tag('tag-pii', 'PII')];

    it('keeps assignments whose tag and target exist', () => {
        const source = diagram({
            tags,
            relationships: [relationship({ targetTableId: 'table-users' })],
            tagAssignments: [
                assignment('as-table', 'tag-backend', 'table', 'table-users'),
                assignment('as-field', 'tag-pii', 'field', 'field-email'),
                assignment('as-rel', 'tag-backend', 'relationship', 'rel-1'),
            ],
        });

        const canonical = canonicalizeTagAssignments(source);

        expect(canonical.tagAssignments?.map((item) => item.id)).toEqual([
            'as-table',
            'as-field',
            'as-rel',
        ]);
        expect(source.tagAssignments).toHaveLength(3);
    });

    it('drops dangling tag, table, field, and relationship targets', () => {
        const source = diagram({
            tags,
            tagAssignments: [
                assignment('as-tag', 'tag-missing', 'table', 'table-users'),
                assignment('as-table', 'tag-backend', 'table', 'table-missing'),
                assignment('as-field', 'tag-pii', 'field', 'field-missing'),
                assignment(
                    'as-rel',
                    'tag-backend',
                    'relationship',
                    'rel-missing'
                ),
                assignment('as-ok', 'tag-backend', 'table', 'table-users'),
            ],
        });

        expect(
            canonicalizeTagAssignments(source).tagAssignments?.map(
                (item) => item.id
            )
        ).toEqual(['as-ok']);
    });
});

describe('cloneDiagram tags', () => {
    it('remaps tag, assignment, table, field, and relationship ids', () => {
        const source = diagram({
            tables: [
                table({ parentAreaId: 'area-main' }),
                table({
                    id: 'table-posts',
                    name: 'posts',
                    fields: [field('field-post-user', 'user_id')],
                }),
            ],
            areas: [
                {
                    id: 'area-main',
                    name: 'Main',
                    x: 0,
                    y: 0,
                    width: 10,
                    height: 10,
                    color: '#aabbcc',
                },
            ],
            relationships: [relationship()],
            tags: [tag('tag-backend', 'Backend')],
            tagAssignments: [
                assignment('as-table', 'tag-backend', 'table', 'table-users'),
                assignment('as-field', 'tag-backend', 'field', 'field-email'),
                assignment('as-rel', 'tag-backend', 'relationship', 'rel-1'),
                assignment('as-stale', 'tag-missing', 'table', 'table-users'),
            ],
        });

        const { diagram: cloned } = cloneDiagram(source);
        const clonedUsers = cloned.tables?.find(
            (item) => item.name === 'users'
        );
        const clonedEmail = clonedUsers?.fields.find(
            (item) => item.name === 'email'
        );
        const clonedRelationship = cloned.relationships?.[0];

        expect(cloned.tags).toHaveLength(1);
        expect(cloned.tags?.[0]?.id).not.toBe('tag-backend');
        expect(cloned.tags?.[0]?.name).toBe('Backend');
        expect(cloned.tags?.[0]?.color).toBe('#8eb7ff');
        expect(cloned.tagAssignments).toHaveLength(3);
        expect(
            cloned.tagAssignments?.every(
                (item) => item.tagId === cloned.tags?.[0]?.id
            )
        ).toBe(true);
        expect(cloned.tagAssignments?.map((item) => item.id)).not.toContain(
            'as-table'
        );
        expect(
            cloned.tagAssignments?.find((item) => item.targetType === 'table')
                ?.targetId
        ).toBe(clonedUsers?.id);
        expect(
            cloned.tagAssignments?.find((item) => item.targetType === 'field')
                ?.targetId
        ).toBe(clonedEmail?.id);
        expect(
            cloned.tagAssignments?.find(
                (item) => item.targetType === 'relationship'
            )?.targetId
        ).toBe(clonedRelationship?.id);
        expect(clonedUsers?.parentAreaId).toBe(cloned.areas?.[0]?.id);
        expect(clonedUsers?.parentAreaId).not.toBe('area-main');
    });
});

describe('cloneTableTagAssignments', () => {
    it('inherits table and field assignments without copying tag definitions or relationships', () => {
        const sourceTable = table({
            fields: [
                field('field-id', 'id'),
                field('field-email', 'email'),
                field('field-password', 'password'),
            ],
        });
        const clonedTable = cloneTable(sourceTable);
        const original = [
            assignment('as-backend', 'tag-backend', 'table', sourceTable.id),
            assignment('as-mvp', 'tag-mvp', 'table', sourceTable.id),
            assignment('as-pii', 'tag-pii', 'field', 'field-email'),
            assignment(
                'as-security',
                'tag-security',
                'field',
                'field-password'
            ),
            assignment('as-rel', 'tag-backend', 'relationship', 'rel-1'),
        ];
        const snapshot = structuredClone(original);

        const inherited = cloneTableTagAssignments({
            sourceTable,
            clonedTable,
            tagAssignments: original,
            generateId: (() => {
                let n = 0;
                return () => `new-${n++}`;
            })(),
        });

        expect(inherited.map((item) => item.tagId).sort()).toEqual([
            'tag-backend',
            'tag-mvp',
            'tag-pii',
            'tag-security',
        ]);
        expect(inherited.map((item) => item.id)).toEqual([
            'new-0',
            'new-1',
            'new-2',
            'new-3',
        ]);
        expect(
            inherited.filter((item) => item.targetType === 'table')
        ).toHaveLength(2);
        expect(
            inherited.every(
                (item) =>
                    item.targetType !== 'table' ||
                    item.targetId === clonedTable.id
            )
        ).toBe(true);
        const emailId = clonedTable.fields.find(
            (item) => item.name === 'email'
        )?.id;
        const passwordId = clonedTable.fields.find(
            (item) => item.name === 'password'
        )?.id;
        expect(
            inherited.find((item) => item.tagId === 'tag-pii')?.targetId
        ).toBe(emailId);
        expect(
            inherited.find((item) => item.tagId === 'tag-security')?.targetId
        ).toBe(passwordId);
        expect(
            inherited.some((item) => item.targetType === 'relationship')
        ).toBe(false);
        expect(original).toEqual(snapshot);
    });
});

describe('diagram JSON tags', () => {
    const tagged = diagram({
        tags: [tag('tag-backend', 'Backend')],
        tagAssignments: [
            assignment('as-table', 'tag-backend', 'table', 'table-users'),
        ],
    });

    it('exports schemaVersion 2 with tags and without personal filter state', () => {
        const parsed = JSON.parse(diagramToJSONOutput(tagged)) as Record<
            string,
            unknown
        >;

        expect(parsed.schemaVersion).toBe(DIAGRAM_JSON_SCHEMA_VERSION);
        expect(parsed.schemaVersion).toBe(2);
        expect(parsed.tags).toEqual([tag('tag-backend', 'Backend')]);
        expect(parsed.tagAssignments).toEqual([
            assignment('as-table', 'tag-backend', 'table', 'table-users'),
        ]);
        expect(parsed).not.toHaveProperty('selectedTagIds');
        expect(parsed).not.toHaveProperty('filter');
        expect(parsed).not.toHaveProperty('schemaIds');
    });

    it('remaps a v2 round trip and still imports v1 and unversioned JSON', () => {
        const exported = diagramToJSONOutput(tagged);
        const imported = diagramFromJSONInput(exported);

        expect(imported.id).not.toBe('diagram');
        expect(imported.tags?.[0]?.id).not.toBe('tag-backend');
        expect(imported.tags?.[0]?.name).toBe('Backend');
        expect(imported.tagAssignments?.[0]?.tagId).toBe(
            imported.tags?.[0]?.id
        );
        expect(imported.tagAssignments?.[0]?.targetId).toBe(
            imported.tables?.[0]?.id
        );

        const versionOne = diagramFromJSONInput(
            JSON.stringify({
                id: 'diagram',
                name: 'Legacy',
                databaseType: DatabaseType.POSTGRESQL,
                schemaVersion: 1,
                tables: [],
            })
        );
        const unversioned = diagramFromJSONInput(
            JSON.stringify({
                id: 'diagram',
                name: 'Legacy',
                databaseType: DatabaseType.POSTGRESQL,
                tables: [],
            })
        );

        expect(versionOne.tags).toEqual([]);
        expect(versionOne.tagAssignments).toEqual([]);
        expect(unversioned.tags).toEqual([]);
        expect(unversioned.tagAssignments).toEqual([]);
        expect(versionOne.id).not.toBe('diagram');
    });
});

describe('online tag normalization', () => {
    it('preserves tags, defaults missing arrays, and drops stale assignments', () => {
        const normalized = normalizeDiagramFromApi({
            id: '42',
            content: {
                name: 'Online',
                databaseType: DatabaseType.POSTGRESQL,
                tables: [table()],
                tags: [tag('tag-backend', 'Backend')],
                tagAssignments: [
                    assignment('as-ok', 'tag-backend', 'table', 'table-users'),
                    assignment('as-stale', 'tag-backend', 'field', 'missing'),
                ],
                selectedTagIds: ['tag-backend'],
            },
        });

        expect(normalized.tags).toEqual([tag('tag-backend', 'Backend')]);
        expect(normalized.tagAssignments).toEqual([
            assignment('as-ok', 'tag-backend', 'table', 'table-users'),
        ]);
        expect(normalized).not.toHaveProperty('selectedTagIds');

        const missing = normalizeDiagramFromApi({
            content: {
                name: 'Empty',
                databaseType: DatabaseType.GENERIC,
            },
        });

        expect(missing.tags).toEqual([]);
        expect(missing.tagAssignments).toEqual([]);
    });

    it('puts canonical tags on the autosave payload and omits personal filters', () => {
        const payload = JSON.parse(
            diagramAutosavePayload(
                diagram({
                    tags: [tag('tag-backend', 'Backend')],
                    tagAssignments: [
                        assignment(
                            'as-stale',
                            'tag-backend',
                            'relationship',
                            'missing'
                        ),
                        assignment(
                            'as-ok',
                            'tag-backend',
                            'table',
                            'table-users'
                        ),
                    ],
                })
            )
        ) as Record<string, unknown>;

        expect(payload.tags).toEqual([tag('tag-backend', 'Backend')]);
        expect(payload.tagAssignments).toEqual([
            assignment('as-ok', 'tag-backend', 'table', 'table-users'),
        ]);
        expect(payload).not.toHaveProperty('selectedTagIds');
        expect(payload).not.toHaveProperty('matchMode');
        expect(payload).not.toHaveProperty('filter');
    });
});

describe('template clone', () => {
    it('remaps diagram tags while keeping the template diagram id', () => {
        const source = diagram({
            tags: [tag('tag-backend', 'Backend')],
            tagAssignments: [
                assignment('as-table', 'tag-backend', 'table', 'table-users'),
            ],
        });
        const template: Template = {
            slug: 'tagged',
            name: 'Tagged',
            shortDescription: 'Tagged',
            description: 'Tagged',
            image: '',
            imageDark: '',
            diagram: source,
            tags: ['catalog'],
            featured: false,
        };

        const converted = convertTemplateToNewDiagram(template);

        expect(converted.id).toBe(source.id);
        expect(converted.tags?.[0]?.id).not.toBe('tag-backend');
        expect(converted.tagAssignments?.[0]?.tagId).toBe(
            converted.tags?.[0]?.id
        );
        expect(converted.tagAssignments?.[0]?.targetId).toBe(
            converted.tables?.[0]?.id
        );
    });
});
