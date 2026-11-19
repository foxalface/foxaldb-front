import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChartDBProvider } from '@/context/chartdb-context/chartdb-provider';
import { DiagramLocationProvider } from '@/context/diagram-location-context/diagram-location-provider';
import { HistoryProvider } from '@/context/history-context/history-provider';
import { RedoUndoStackProvider } from '@/context/history-context/redo-undo-stack-provider';
import { useChartDB } from '@/hooks/use-chartdb';
import { useHistory } from '@/hooks/use-history';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBField } from '@/lib/domain/db-field';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import type { DBTable } from '@/lib/domain/db-table';
import { deviceDiagramLocation } from '@/lib/diagram/diagram-location';
import { storageInitialValue } from '@/context/storage-context/storage-context';

const storage = {
    ...storageInitialValue,
    addTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    addTagAssignment: vi.fn(),
    deleteTagAssignment: vi.fn(),
    updateDiagram: vi.fn(),
    deleteTable: vi.fn(),
    deleteRelationship: vi.fn(),
    getTable: vi.fn(),
    updateTable: vi.fn(),
    addTable: vi.fn(),
    addRelationship: vi.fn(),
    addDependency: vi.fn(),
};

vi.mock('@/hooks/use-storage', () => ({
    useStorage: () => storage,
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        hasDiff: false,
        events: { useSubscription: () => undefined },
    }),
}));

const field = {
    id: 'field-email',
    name: 'email',
    type: { id: 'text', name: 'text' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 1,
} as DBField;

const table = {
    id: 'table-users',
    name: 'users',
    x: 0,
    y: 0,
    fields: [field],
    indexes: [],
    color: '#fff',
    isView: false,
    createdAt: 1,
} as DBTable;

const relationship = {
    id: 'rel-1',
    name: 'users_fk',
    sourceTableId: 'table-users',
    targetTableId: 'table-users',
    sourceFieldId: 'field-email',
    targetFieldId: 'field-email',
    sourceCardinality: 'one',
    targetCardinality: 'many',
    createdAt: 1,
} as DBRelationship;

const diagram = (): Diagram => ({
    id: 'diagram-1',
    name: 'Tags',
    databaseType: DatabaseType.GENERIC,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    tables: [table],
    relationships: [relationship],
    tags: [
        { id: 'tag-backend', name: 'Backend', color: '#8eb7ff' },
        { id: 'tag-pii', name: 'PII', color: '#ff8e8e' },
    ],
    tagAssignments: [
        {
            id: 'as-table',
            tagId: 'tag-backend',
            targetType: 'table',
            targetId: 'table-users',
        },
        {
            id: 'as-field',
            tagId: 'tag-pii',
            targetType: 'field',
            targetId: 'field-email',
        },
        {
            id: 'as-rel',
            tagId: 'tag-backend',
            targetType: 'relationship',
            targetId: 'rel-1',
        },
    ],
});

const Probe: React.FC = () => {
    const {
        currentDiagram,
        loadDiagramFromData,
        addTagAssignments,
        removeTags,
        removeTables,
        removeField,
        removeRelationships,
    } = useChartDB();
    const { undo, redo } = useHistory();
    const events = useChartDB().events;
    const [actions, setActions] = React.useState<string[]>([]);

    events.useSubscription((event) => {
        setActions((current) => [...current, event.action]);
    });

    return (
        <div>
            <p data-testid="updated">{currentDiagram.updatedAt.getTime()}</p>
            <p data-testid="tags">
                {(currentDiagram.tags ?? []).map((item) => item.id).join(',')}
            </p>
            <p data-testid="assignments">
                {(currentDiagram.tagAssignments ?? [])
                    .map((item) => item.id)
                    .join(',')}
            </p>
            <p data-testid="actions">{actions.join(',')}</p>
            <button
                type="button"
                onClick={() => loadDiagramFromData(diagram())}
            >
                load
            </button>
            <button
                type="button"
                onClick={() =>
                    void addTagAssignments([
                        {
                            id: 'as-new',
                            tagId: 'tag-backend',
                            targetType: 'table',
                            targetId: 'table-users',
                        },
                    ])
                }
            >
                assign
            </button>
            <button
                type="button"
                onClick={() => void removeTags(['tag-backend'])}
            >
                remove-tag
            </button>
            <button
                type="button"
                onClick={() => void removeTables(['table-users'])}
            >
                remove-table
            </button>
            <button
                type="button"
                onClick={() => void removeField('table-users', 'field-email')}
            >
                remove-field
            </button>
            <button
                type="button"
                onClick={() => void removeRelationships(['rel-1'])}
            >
                remove-relationship
            </button>
            <button type="button" onClick={() => void undo()}>
                undo
            </button>
            <button type="button" onClick={() => void redo()}>
                redo
            </button>
        </div>
    );
};

const renderEditor = () =>
    render(
        <DiagramLocationProvider
            initialLocation={deviceDiagramLocation('diagram-1')}
        >
            <RedoUndoStackProvider>
                <ChartDBProvider>
                    <HistoryProvider>
                        <Probe />
                    </HistoryProvider>
                </ChartDBProvider>
            </RedoUndoStackProvider>
        </DiagramLocationProvider>
    );

describe('tag operation history', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('emits an assignment and advances updatedAt', async () => {
        const user = userEvent.setup();
        renderEditor();
        await user.click(screen.getByRole('button', { name: 'load' }));
        const before = screen.getByTestId('updated').textContent;

        await user.click(screen.getByRole('button', { name: 'assign' }));

        expect(screen.getByTestId('actions').textContent).toContain(
            'add_tag_assignments'
        );
        expect(screen.getByTestId('assignments').textContent).toContain(
            'as-new'
        );
        expect(screen.getByTestId('updated').textContent).not.toBe(before);
        expect(storage.addTagAssignment).toHaveBeenCalled();
    });

    it('removes a tag and its assignments, then undo and redo restore that pair', async () => {
        const user = userEvent.setup();
        renderEditor();
        await user.click(screen.getByRole('button', { name: 'load' }));
        await user.click(screen.getByRole('button', { name: 'remove-tag' }));

        expect(screen.getByTestId('tags').textContent).toBe('tag-pii');
        expect(screen.getByTestId('assignments').textContent).toBe('as-field');
        expect(screen.getByTestId('actions').textContent).not.toContain(
            'remove_tag_assignments'
        );

        await user.click(screen.getByRole('button', { name: 'undo' }));

        expect(screen.getByTestId('tags').textContent).toContain('tag-backend');
        expect(screen.getByTestId('assignments').textContent).toContain(
            'as-table'
        );
        expect(screen.getByTestId('assignments').textContent).toContain(
            'as-rel'
        );

        await user.click(screen.getByRole('button', { name: 'redo' }));

        expect(screen.getByTestId('tags').textContent).toBe('tag-pii');
        expect(screen.getByTestId('assignments').textContent).toBe('as-field');
    });

    it('restores table, field, and relationship assignments on undo', async () => {
        const user = userEvent.setup();
        renderEditor();
        await user.click(screen.getByRole('button', { name: 'load' }));
        await user.click(screen.getByRole('button', { name: 'remove-field' }));
        expect(screen.getByTestId('assignments').textContent).not.toContain(
            'as-field'
        );
        await user.click(screen.getByRole('button', { name: 'undo' }));
        expect(screen.getByTestId('assignments').textContent).toContain(
            'as-field'
        );

        await user.click(
            screen.getByRole('button', { name: 'remove-relationship' })
        );
        expect(screen.getByTestId('assignments').textContent).not.toContain(
            'as-rel'
        );
        await user.click(screen.getByRole('button', { name: 'undo' }));
        expect(screen.getByTestId('assignments').textContent).toContain(
            'as-rel'
        );

        await user.click(screen.getByRole('button', { name: 'remove-table' }));
        expect(screen.getByTestId('assignments').textContent).toBe('');
        await user.click(screen.getByRole('button', { name: 'undo' }));
        expect(screen.getByTestId('assignments').textContent).toContain(
            'as-table'
        );
        expect(screen.getByTestId('assignments').textContent).toContain(
            'as-field'
        );
        expect(screen.getByTestId('assignments').textContent).toContain(
            'as-rel'
        );
    });
});
