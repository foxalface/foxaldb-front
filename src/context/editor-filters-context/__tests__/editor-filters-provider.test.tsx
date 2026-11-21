import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Area } from '@/lib/domain/area';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import {
    createFilterCondition,
    createFilterGroup,
    type FilterCondition,
} from '@/lib/domain/filter-expression';
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

const tagCondition = (tagId: string): FilterCondition => {
    const condition = createFilterCondition('table', 'tag', 'condition-tag');

    return condition.property === 'tag'
        ? { ...condition, value: [tagId] }
        : condition;
};

const Probe: React.FC = () => {
    const filter = useEditorFilters();
    const tagValue =
        filter.expression.children[0]?.kind === 'condition' &&
        filter.expression.children[0].property === 'tag'
            ? filter.expression.children[0].value.join(',')
            : '';

    return (
        <div>
            <span data-testid="tags">{tagValue}</span>
            <span data-testid="query">{filter.hasQuery ? 'yes' : 'no'}</span>
            <span data-testid="views">{filter.showViews ? 'yes' : 'no'}</span>
            <button
                type="button"
                onClick={() =>
                    filter.setExpression(
                        createFilterGroup(
                            'and',
                            [tagCondition('tag-a')],
                            'root'
                        )
                    )
                }
            >
                set-tag
            </button>
            <button type="button" onClick={() => filter.setShowViews(true)}>
                views-on
            </button>
            <button type="button" onClick={() => filter.clearFilters()}>
                clear-filters
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
        chartDBState.areas = [area('area-a', 'Core')];
        chartDBState.tables = [table('users', 'public')];
        chartDBState.updatedAt = new Date('2026-01-01T00:00:00.000Z');
        chartDBState.addTags.mockClear();
        chartDBState.updateTablesState.mockClear();
    });

    it('starts with an empty query and hidden views', () => {
        renderFilter();

        expect(screen.getByTestId('tags')).toHaveTextContent('');
        expect(screen.getByTestId('query')).toHaveTextContent('no');
        expect(screen.getByTestId('views')).toHaveTextContent('no');
    });

    it('clears the query without resetting show views or the diagram', async () => {
        const user = userEvent.setup();
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        renderFilter();

        await user.click(screen.getByRole('button', { name: 'views-on' }));
        await user.click(screen.getByRole('button', { name: 'set-tag' }));
        expect(screen.getByTestId('query')).toHaveTextContent('yes');
        expect(screen.getByTestId('views')).toHaveTextContent('yes');

        await user.click(screen.getByRole('button', { name: 'clear-filters' }));

        expect(screen.getByTestId('query')).toHaveTextContent('no');
        expect(screen.getByTestId('views')).toHaveTextContent('yes');
        expect(setItem).not.toHaveBeenCalled();
        expect(chartDBState.addTags).not.toHaveBeenCalled();
        expect(chartDBState.updateTablesState).not.toHaveBeenCalled();
        setItem.mockRestore();
    });

    it('drops a stale tag id and resets the session when the diagram changes', async () => {
        const user = userEvent.setup();
        const { rerender } = renderFilter();
        await user.click(screen.getByRole('button', { name: 'set-tag' }));
        await user.click(screen.getByRole('button', { name: 'views-on' }));

        chartDBState.tags = [{ id: 'tag-b', name: 'Beta', color: '#000' }];
        rerender(
            <EditorFiltersProvider>
                <Probe />
            </EditorFiltersProvider>
        );
        expect(screen.getByTestId('tags')).toHaveTextContent('');
        expect(screen.getByTestId('query')).toHaveTextContent('no');

        chartDBState.diagramId = 'diagram-2';
        chartDBState.tags = [{ id: 'tag-a', name: 'Alpha', color: '#fff' }];
        rerender(
            <EditorFiltersProvider>
                <Probe />
            </EditorFiltersProvider>
        );

        expect(screen.getByTestId('query')).toHaveTextContent('no');
        expect(screen.getByTestId('views')).toHaveTextContent('no');
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
