import { describe, expect, it, vi } from 'vitest';
import {
    applyRemoteDiagramOperation,
    isDiagramOperationAction,
    type ApplyRemoteDiagramOperationContext,
    type DiagramOperationMutators,
    type DiagramOperationPayload,
} from '../diagram-operations';
import type {
    DiagramTag,
    DiagramTagAssignment,
} from '@/lib/domain/diagram-tag';

const emptyContext = (): ApplyRemoteDiagramOperationContext => ({
    existingTableIds: new Set(),
    getTableFromStorage: async () => undefined,
    existingRelationshipIds: new Set(),
    getRelationshipFromStorage: async () => undefined,
    existingFieldIdsByTable: new Map(),
    existingNoteIds: new Set(),
    getNoteFromStorage: async () => undefined,
    existingAreaIds: new Set(),
    getAreaFromStorage: async () => undefined,
    existingDependencyIds: new Set(),
    getDependencyFromStorage: async () => undefined,
    existingTagIds: new Set(),
    existingAssignmentIds: new Set(),
    existingAssignmentKeys: new Set(),
});

const createMutators = (): DiagramOperationMutators => ({
    updateDiagramName: vi.fn().mockResolvedValue(undefined),
    addTables: vi.fn().mockResolvedValue(undefined),
    updateTable: vi.fn().mockResolvedValue(undefined),
    removeTables: vi.fn().mockResolvedValue(undefined),
    addField: vi.fn().mockResolvedValue(undefined),
    removeField: vi.fn().mockResolvedValue(undefined),
    updateField: vi.fn().mockResolvedValue(undefined),
    addRelationships: vi.fn().mockResolvedValue(undefined),
    removeRelationships: vi.fn().mockResolvedValue(undefined),
    updateRelationship: vi.fn().mockResolvedValue(undefined),
    addNotes: vi.fn().mockResolvedValue(undefined),
    removeNotes: vi.fn().mockResolvedValue(undefined),
    updateNote: vi.fn().mockResolvedValue(undefined),
    addAreas: vi.fn().mockResolvedValue(undefined),
    removeAreas: vi.fn().mockResolvedValue(undefined),
    updateArea: vi.fn().mockResolvedValue(undefined),
    addDependencies: vi.fn().mockResolvedValue(undefined),
    removeDependencies: vi.fn().mockResolvedValue(undefined),
    updateDependency: vi.fn().mockResolvedValue(undefined),
    addTags: vi.fn().mockResolvedValue(undefined),
    updateTag: vi.fn().mockResolvedValue(undefined),
    removeTags: vi.fn().mockResolvedValue(undefined),
    addTagAssignments: vi.fn().mockResolvedValue(undefined),
    removeTagAssignments: vi.fn().mockResolvedValue(undefined),
});

describe('applyRemoteDiagramOperation', () => {
    it('applies update_diagram_name with updateHistory disabled', async () => {
        const mutators = createMutators();

        await applyRemoteDiagramOperation(
            {
                action: 'update_diagram_name',
                data: { name: 'Remote title' },
                userId: 2,
                clientId: 'remote-client',
                sentAt: '2026-01-01T00:00:00Z',
            },
            mutators,
            emptyContext()
        );

        expect(mutators.updateDiagramName).toHaveBeenCalledWith(
            'Remote title',
            {
                updateHistory: false,
            }
        );
        expect(mutators.updateTable).not.toHaveBeenCalled();
    });

    it('ignores invalid update_diagram_name payloads', async () => {
        const mutators = createMutators();
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await applyRemoteDiagramOperation(
            {
                action: 'update_diagram_name',
                data: { name: '' },
                userId: 2,
                clientId: 'remote-client',
                sentAt: '2026-01-01T00:00:00Z',
            },
            mutators,
            emptyContext()
        );

        expect(mutators.updateDiagramName).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it('remains idempotent when the same title is applied twice', async () => {
        const mutators = createMutators();
        const payload = {
            action: 'update_diagram_name' as const,
            data: { name: 'Shared title' },
            userId: 2,
            clientId: 'remote-client',
            sentAt: '2026-01-01T00:00:00Z',
        };

        await applyRemoteDiagramOperation(payload, mutators, emptyContext());
        await applyRemoteDiagramOperation(payload, mutators, emptyContext());

        expect(mutators.updateDiagramName).toHaveBeenCalledTimes(2);
        expect(mutators.updateDiagramName).toHaveBeenNthCalledWith(
            1,
            'Shared title',
            { updateHistory: false }
        );
        expect(mutators.updateDiagramName).toHaveBeenNthCalledWith(
            2,
            'Shared title',
            { updateHistory: false }
        );
    });
});

const historyOptions = { updateHistory: false as const };

const payload = (
    action: DiagramOperationPayload['action'],
    data: DiagramOperationPayload['data']
): DiagramOperationPayload => ({
    action,
    data,
    userId: 2,
    clientId: 'remote-client',
    sentAt: '2026-01-01T00:00:00Z',
});

const tag = (id: string, name = id): DiagramTag => ({
    id,
    name,
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

describe('tag diagram operations', () => {
    it('recognizes the five tag actions and rejects unknown ones', () => {
        expect(isDiagramOperationAction('add_tags')).toBe(true);
        expect(isDiagramOperationAction('update_tag')).toBe(true);
        expect(isDiagramOperationAction('remove_tags')).toBe(true);
        expect(isDiagramOperationAction('add_tag_assignments')).toBe(true);
        expect(isDiagramOperationAction('remove_tag_assignments')).toBe(true);
        expect(isDiagramOperationAction('selected_tags')).toBe(false);
    });

    it('applies a remote tag create, rename, and delete without history', async () => {
        const mutators = createMutators();
        const context = emptyContext();
        context.existingTagIds = new Set(['tag-backend']);

        await applyRemoteDiagramOperation(
            payload('add_tags', {
                tags: [tag('tag-mvp', 'MVP')],
            }),
            mutators,
            context
        );
        await applyRemoteDiagramOperation(
            payload('update_tag', {
                id: 'tag-backend',
                attributes: { name: 'API' },
            }),
            mutators,
            context
        );
        await applyRemoteDiagramOperation(
            payload('remove_tags', { tagIds: ['tag-backend'] }),
            mutators,
            context
        );

        expect(mutators.addTags).toHaveBeenCalledWith(
            [tag('tag-mvp', 'MVP')],
            historyOptions
        );
        expect(mutators.updateTag).toHaveBeenCalledWith(
            'tag-backend',
            { name: 'API' },
            historyOptions
        );
        expect(mutators.removeTags).toHaveBeenCalledWith(
            ['tag-backend'],
            historyOptions
        );
    });

    it('ignores duplicate tag ids, unknown tags, and unsupported attributes', async () => {
        const mutators = createMutators();
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const context = emptyContext();
        context.existingTagIds = new Set(['tag-backend']);

        await applyRemoteDiagramOperation(
            payload('add_tags', {
                tags: [tag('tag-backend', 'Backend'), tag('tag-mvp', 'MVP')],
            }),
            mutators,
            context
        );
        await applyRemoteDiagramOperation(
            payload('update_tag', {
                id: 'missing',
                attributes: { name: 'Nope' },
            }),
            mutators,
            context
        );
        await applyRemoteDiagramOperation(
            payload('update_tag', {
                id: 'tag-backend',
                attributes: { selectedTagIds: ['tag-backend'] },
            } as never),
            mutators,
            context
        );
        await applyRemoteDiagramOperation(
            payload('update_tag', {
                id: 'tag-backend',
                attributes: { color: '#111111' },
            } as never),
            mutators,
            context
        );
        await applyRemoteDiagramOperation(
            payload('add_tags', {
                tags: [{ id: 'tag-colored', name: 'Colored', color: '#fff' }],
            } as never),
            mutators,
            context
        );

        expect(mutators.addTags).toHaveBeenCalledTimes(1);
        expect(mutators.addTags).toHaveBeenCalledWith(
            [tag('tag-mvp', 'MVP')],
            historyOptions
        );
        expect(mutators.updateTag).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('assigns and unassigns without history', async () => {
        const mutators = createMutators();
        const context = emptyContext();
        context.existingTagIds = new Set(['tag-backend']);
        context.existingTableIds = new Set(['table-users']);
        const created = assignment(
            'as-1',
            'tag-backend',
            'table',
            'table-users'
        );

        await applyRemoteDiagramOperation(
            payload('add_tag_assignments', { assignments: [created] }),
            mutators,
            context
        );
        await applyRemoteDiagramOperation(
            payload('remove_tag_assignments', { assignmentIds: ['as-1'] }),
            mutators,
            context
        );

        expect(mutators.addTagAssignments).toHaveBeenCalledWith(
            [created],
            historyOptions
        );
        expect(mutators.removeTagAssignments).toHaveBeenCalledWith(
            ['as-1'],
            historyOptions
        );
    });

    it('ignores duplicate assignment ids, duplicate targets, and missing tag or target', async () => {
        const mutators = createMutators();
        const context = emptyContext();
        context.existingTagIds = new Set(['tag-backend']);
        context.existingTableIds = new Set(['table-users']);
        context.existingFieldIdsByTable = new Map([
            ['table-users', new Set(['field-email'])],
        ]);
        context.existingAssignmentIds = new Set(['as-existing']);
        context.existingAssignmentKeys = new Set([
            'tag-backend\0table\0table-users',
        ]);

        await applyRemoteDiagramOperation(
            payload('add_tag_assignments', {
                assignments: [
                    assignment(
                        'as-existing',
                        'tag-backend',
                        'table',
                        'table-users'
                    ),
                    assignment('as-dup', 'tag-backend', 'table', 'table-users'),
                    assignment(
                        'as-missing-tag',
                        'tag-missing',
                        'field',
                        'field-email'
                    ),
                    assignment(
                        'as-missing-target',
                        'tag-backend',
                        'field',
                        'field-missing'
                    ),
                    assignment('as-ok', 'tag-backend', 'field', 'field-email'),
                ],
            }),
            mutators,
            context
        );

        expect(mutators.addTagAssignments).toHaveBeenCalledWith(
            [assignment('as-ok', 'tag-backend', 'field', 'field-email')],
            historyOptions
        );
    });

    it('ignores a malformed tag payload', async () => {
        const mutators = createMutators();
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await applyRemoteDiagramOperation(
            payload('add_tags', { tags: [] }),
            mutators,
            emptyContext()
        );

        expect(mutators.addTags).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});
