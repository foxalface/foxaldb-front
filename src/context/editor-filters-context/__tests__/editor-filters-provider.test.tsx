import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Area } from '@/lib/domain/area';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import type { TagMatchMode } from '@/lib/domain/diagram-tag';
import { EditorFiltersProvider } from '../editor-filters-provider';
import { useEditorFilters } from '../use-editor-filters';

const { chartDBState } = vi.hoisted(() => ({
    chartDBState: {
        diagramId: 'diagram-1',
        tags: [] as DiagramTag[],
        areas: [] as Area[],
        tables: [] as DBTable[],
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        addTags: vi.fn(),
        updateTablesState: vi.fn(),
    },
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: chartDBState.diagramId,
        addTags: chartDBState.addTags,
        updateTablesState: chartDBState.updateTablesState,
        currentDiagram: {
            id: chartDBState.diagramId,
            databaseType: DatabaseType.POSTGRESQL,
            tags: chartDBState.tags,
            areas: chartDBState.areas,
            tables: chartDBState.tables,
            updatedAt: chartDBState.updatedAt,
        },
    }),
}));

const area = (id: string, name: string): Area => ({
    id,
    name,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    color: '#8eb7ff',
});

const table = (id: string, schema?: string): DBTable => ({
    id,
    name: id,
    schema,
    x: 0,
    y: 0,
    fields: [],
    indexes: [],
    color: '#fff',
    isView: false,
    createdAt: 0,
});

const Probe: React.FC = () => {
    const filter = useEditorFilters();

    return (
        <div>
            <span data-testid="tags">{filter.selectedTagIds.join(',')}</span>
            <span data-testid="mode">{filter.tagMatchMode}</span>
            <span data-testid="areas">{filter.selectedAreaIds.join(',')}</span>
            <span data-testid="schemas">
                {filter.selectedSchemaIds.join(',')}
            </span>
            <span data-testid="views">{filter.showViews ? 'yes' : 'no'}</span>
            <span data-testid="any">
                {filter.hasAnyConstraint ? 'yes' : 'no'}
            </span>
            <button type="button" onClick={() => filter.toggleTag('tag-a')}>
                toggle-tag-a
            </button>
            <button type="button" onClick={() => filter.toggleTag('tag-b')}>
                toggle-tag-b
            </button>
            <button type="button" onClick={() => filter.setTagMatchMode('all')}>
                mode-all
            </button>
            <button
                type="button"
                onClick={() => filter.setTagMatchMode('none')}
            >
                mode-none
            </button>
            <button
                type="button"
                onClick={() => filter.setTagMatchMode('' as TagMatchMode)}
            >
                mode-empty
            </button>
            <button type="button" onClick={() => filter.clearTagFilter()}>
                clear-tags
            </button>
            <button type="button" onClick={() => filter.toggleArea('area-a')}>
                toggle-area-a
            </button>
            <button type="button" onClick={() => filter.toggleArea('area-b')}>
                toggle-area-b
            </button>
            <button type="button" onClick={() => filter.clearAreaFilter()}>
                clear-areas
            </button>
            <button type="button" onClick={() => filter.toggleSchema('public')}>
                toggle-public
            </button>
            <button
                type="button"
                onClick={() => filter.toggleSchema('billing')}
            >
                toggle-billing
            </button>
            <button type="button" onClick={() => filter.clearSchemaFilter()}>
                clear-schemas
            </button>
            <button type="button" onClick={() => filter.setShowViews(true)}>
                views-on
            </button>
            <button type="button" onClick={() => filter.setShowViews(false)}>
                views-off
            </button>
            <button type="button" onClick={() => filter.clearAllFilters()}>
                clear-all
            </button>
        </div>
    );
};

const renderFilter = () =>
    render(
        <EditorFiltersProvider>
            <Probe />
        </EditorFiltersProvider>
    );

describe('EditorFiltersProvider', () => {
    beforeEach(() => {
        chartDBState.diagramId = 'diagram-1';
        chartDBState.tags = [
            { id: 'tag-a', name: 'Alpha', color: '#fff' },
            { id: 'tag-b', name: 'Beta', color: '#000' },
        ];
        chartDBState.areas = [
            area('area-a', 'Core'),
            area('area-b', 'Billing'),
        ];
        chartDBState.tables = [
            table('users', 'public'),
            table('invoices', 'billing'),
        ];
        chartDBState.updatedAt = new Date('2026-01-01T00:00:00.000Z');
        chartDBState.addTags.mockClear();
        chartDBState.updateTablesState.mockClear();
    });

    it('starts with no personal constraints', () => {
        renderFilter();

        expect(screen.getByTestId('tags')).toHaveTextContent('');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
        expect(screen.getByTestId('areas')).toHaveTextContent('');
        expect(screen.getByTestId('schemas')).toHaveTextContent('');
        expect(screen.getByTestId('views')).toHaveTextContent('no');
        expect(screen.getByTestId('any')).toHaveTextContent('no');
    });

    it('toggles tags in click order, ignores an empty mode, and clears tags only', async () => {
        const user = userEvent.setup();
        renderFilter();

        await user.click(screen.getByRole('button', { name: 'toggle-tag-a' }));
        await user.click(screen.getByRole('button', { name: 'toggle-tag-b' }));
        await user.click(screen.getByRole('button', { name: 'toggle-area-a' }));
        expect(screen.getByTestId('tags')).toHaveTextContent('tag-a,tag-b');

        await user.click(screen.getByRole('button', { name: 'toggle-tag-a' }));
        expect(screen.getByTestId('tags')).toHaveTextContent('tag-b');

        await user.click(screen.getByRole('button', { name: 'mode-all' }));
        await user.click(screen.getByRole('button', { name: 'mode-none' }));
        await user.click(screen.getByRole('button', { name: 'mode-empty' }));
        expect(screen.getByTestId('mode')).toHaveTextContent('none');

        await user.click(screen.getByRole('button', { name: 'clear-tags' }));
        expect(screen.getByTestId('tags')).toHaveTextContent('');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
        expect(screen.getByTestId('areas')).toHaveTextContent('area-a');
        expect(chartDBState.addTags).not.toHaveBeenCalled();
        expect(chartDBState.updateTablesState).not.toHaveBeenCalled();
        expect(chartDBState.updatedAt.toISOString()).toBe(
            '2026-01-01T00:00:00.000Z'
        );
    });

    it('prunes a deleted tag and keeps a renamed tag selected', async () => {
        const user = userEvent.setup();
        const { rerender } = renderFilter();
        await user.click(screen.getByRole('button', { name: 'toggle-tag-a' }));
        await user.click(screen.getByRole('button', { name: 'toggle-tag-b' }));

        chartDBState.tags = [
            { id: 'tag-a', name: 'Alpha renamed', color: '#123456' },
        ];
        rerender(
            <EditorFiltersProvider>
                <Probe />
            </EditorFiltersProvider>
        );

        expect(screen.getByTestId('tags')).toHaveTextContent('tag-a');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
    });

    it('toggles areas, clears them, and prunes a deleted area', async () => {
        const user = userEvent.setup();
        const { rerender } = renderFilter();

        await user.click(screen.getByRole('button', { name: 'toggle-area-a' }));
        await user.click(screen.getByRole('button', { name: 'toggle-area-b' }));
        expect(screen.getByTestId('areas')).toHaveTextContent('area-a,area-b');
        expect(screen.getByTestId('any')).toHaveTextContent('yes');

        await user.click(screen.getByRole('button', { name: 'toggle-area-a' }));
        expect(screen.getByTestId('areas')).toHaveTextContent('area-b');

        chartDBState.areas = [area('area-a', 'Core renamed')];
        rerender(
            <EditorFiltersProvider>
                <Probe />
            </EditorFiltersProvider>
        );
        expect(screen.getByTestId('areas')).toHaveTextContent('');

        await user.click(screen.getByRole('button', { name: 'toggle-area-a' }));
        await user.click(screen.getByRole('button', { name: 'clear-areas' }));
        expect(screen.getByTestId('areas')).toHaveTextContent('');
        expect(chartDBState.updateTablesState).not.toHaveBeenCalled();
    });

    it('toggles schemas, clears them, and prunes an unavailable schema', async () => {
        const user = userEvent.setup();
        const { rerender } = renderFilter();

        await user.click(screen.getByRole('button', { name: 'toggle-public' }));
        await user.click(
            screen.getByRole('button', { name: 'toggle-billing' })
        );
        expect(screen.getByTestId('schemas')).toHaveTextContent(
            'public,billing'
        );

        await user.click(screen.getByRole('button', { name: 'toggle-public' }));
        expect(screen.getByTestId('schemas')).toHaveTextContent('billing');

        chartDBState.tables = [table('users')];
        rerender(
            <EditorFiltersProvider>
                <Probe />
            </EditorFiltersProvider>
        );
        expect(screen.getByTestId('schemas')).toHaveTextContent('');

        await user.click(screen.getByRole('button', { name: 'toggle-public' }));
        await user.click(screen.getByRole('button', { name: 'clear-schemas' }));
        expect(screen.getByTestId('schemas')).toHaveTextContent('');
    });

    it('resets every personal filter when the diagram changes', async () => {
        const user = userEvent.setup();
        const { rerender } = renderFilter();
        await user.click(screen.getByRole('button', { name: 'toggle-tag-a' }));
        await user.click(screen.getByRole('button', { name: 'mode-all' }));
        await user.click(screen.getByRole('button', { name: 'toggle-area-a' }));
        await user.click(screen.getByRole('button', { name: 'toggle-public' }));
        await user.click(screen.getByRole('button', { name: 'views-on' }));

        chartDBState.diagramId = 'diagram-2';
        rerender(
            <EditorFiltersProvider>
                <Probe />
            </EditorFiltersProvider>
        );

        expect(screen.getByTestId('tags')).toHaveTextContent('');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
        expect(screen.getByTestId('areas')).toHaveTextContent('');
        expect(screen.getByTestId('schemas')).toHaveTextContent('');
        expect(screen.getByTestId('views')).toHaveTextContent('no');
    });

    it('toggles Show views without counting it as a filter or persisting it', async () => {
        const user = userEvent.setup();
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        renderFilter();

        await user.click(screen.getByRole('button', { name: 'views-on' }));
        expect(screen.getByTestId('views')).toHaveTextContent('yes');
        expect(screen.getByTestId('any')).toHaveTextContent('no');

        await user.click(screen.getByRole('button', { name: 'views-off' }));
        expect(screen.getByTestId('views')).toHaveTextContent('no');
        expect(setItem).not.toHaveBeenCalled();
        expect(chartDBState.addTags).not.toHaveBeenCalled();
        expect(chartDBState.updateTablesState).not.toHaveBeenCalled();
        setItem.mockRestore();
    });

    it('clears every personal filter without touching the diagram', async () => {
        const user = userEvent.setup();
        renderFilter();
        await user.click(screen.getByRole('button', { name: 'toggle-tag-a' }));
        await user.click(screen.getByRole('button', { name: 'mode-none' }));
        await user.click(screen.getByRole('button', { name: 'toggle-area-b' }));
        await user.click(
            screen.getByRole('button', { name: 'toggle-billing' })
        );
        await user.click(screen.getByRole('button', { name: 'views-on' }));
        await user.click(screen.getByRole('button', { name: 'clear-all' }));

        expect(screen.getByTestId('any')).toHaveTextContent('no');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
        expect(screen.getByTestId('views')).toHaveTextContent('no');
        expect(chartDBState.tags).toHaveLength(2);
        expect(chartDBState.areas).toHaveLength(2);
        expect(chartDBState.addTags).not.toHaveBeenCalled();
    });

    it('keeps the context value stable when state does not change', () => {
        const seen: unknown[] = [];
        const IdentityProbe = () => {
            seen.push(useEditorFilters());
            return null;
        };
        const { rerender } = render(
            <EditorFiltersProvider>
                <IdentityProbe />
            </EditorFiltersProvider>
        );
        rerender(
            <EditorFiltersProvider>
                <IdentityProbe />
            </EditorFiltersProvider>
        );

        expect(seen[0]).toBe(seen[1]);
    });
});
