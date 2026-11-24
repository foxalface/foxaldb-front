import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Area } from '@/lib/domain/area';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import {
    createFilterGroup,
    type FilterCondition,
} from '@/lib/domain/filter-expression';
import { EditorFiltersProvider } from '@/context/editor-filters-context/editor-filters-provider';
import { useEditorFilters } from '@/context/editor-filters-context/use-editor-filters';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { FiltersSection } from '../filters-section';

const { chartDBState } = vi.hoisted(() => ({
    chartDBState: {
        diagramId: 'diagram-1',
        tags: [] as DiagramTag[],
        areas: [] as Area[],
        tables: [] as DBTable[],
    },
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: chartDBState.diagramId,
        currentDiagram: {
            id: chartDBState.diagramId,
            databaseType: DatabaseType.POSTGRESQL,
            tags: chartDBState.tags,
            areas: chartDBState.areas,
            tables: chartDBState.tables,
        },
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const viewCondition = (): FilterCondition => ({
    kind: 'condition',
    id: 'view-tag',
    target: 'view',
    property: 'tag',
    operator: 'is_any_of',
    value: ['backend'],
});

const Probe: React.FC = () => {
    const { setExpression, setShowViews, showViews, clearFilters } =
        useEditorFilters();

    return (
        <>
            <span data-testid="views">{showViews ? 'yes' : 'no'}</span>
            <button
                type="button"
                onClick={() =>
                    setExpression(
                        createFilterGroup('and', [viewCondition()], 'root')
                    )
                }
            >
                view-filter
            </button>
            <button type="button" onClick={() => setShowViews(true)}>
                views-on
            </button>
            <button type="button" onClick={clearFilters}>
                clear-filters
            </button>
            <FiltersSection />
        </>
    );
};

describe('FiltersSection', () => {
    beforeEach(() => {
        chartDBState.tags = [{ id: 'backend', name: 'Backend' }];
        chartDBState.areas = [];
        chartDBState.tables = [];
    });

    const renderFiltersSection = (ui: React.ReactElement) =>
        render(
            <TooltipProvider>
                <EditorFiltersProvider>{ui}</EditorFiltersProvider>
            </TooltipProvider>
        );

    it('builds a query without a Show views control or outer clear action', () => {
        renderFiltersSection(<FiltersSection />);

        expect(
            screen.getByTestId('filter-query-empty-root')
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'side_panel.filters_section.query.empty_state.title'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'side_panel.filters_section.query.empty_state.description'
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.empty_state.add_condition',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'side_panel.filters_section.query.empty_state.add_group',
            })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'side_panel.filters_section.clear',
            })
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/show views/i)).not.toBeInTheDocument();
        expect(
            screen.queryByRole('tab', { name: 'tags.title' })
        ).not.toBeInTheDocument();
    });

    it('explains that a view condition stays hidden while Show views is off', async () => {
        const user = userEvent.setup();
        renderFiltersSection(<Probe />);

        await user.click(screen.getByRole('button', { name: 'view-filter' }));

        expect(
            screen.getByTestId('filter-views-hidden-hint')
        ).toBeInTheDocument();
        expect(screen.getByTestId('views')).toHaveTextContent('no');

        await user.click(screen.getByRole('button', { name: 'views-on' }));
        expect(
            screen.queryByTestId('filter-views-hidden-hint')
        ).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'clear-filters' }));
        expect(screen.getByTestId('views')).toHaveTextContent('yes');
    });
});
