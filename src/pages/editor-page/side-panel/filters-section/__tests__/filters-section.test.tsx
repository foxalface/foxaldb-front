import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Area } from '@/lib/domain/area';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBTable } from '@/lib/domain/db-table';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import { en } from '@/i18n/locales/en';
import { EditorFiltersProvider } from '@/context/editor-filters-context/editor-filters-provider';
import { FiltersSection } from '../filters-section';

const { chartDBState, addTags, updateArea, updateTablesState } = vi.hoisted(
    () => ({
        chartDBState: {
            diagramId: 'diagram-1',
            tags: [] as DiagramTag[],
            areas: [] as Area[],
            tables: [] as DBTable[],
        },
        addTags: vi.fn(),
        updateArea: vi.fn(),
        updateTablesState: vi.fn(),
    })
);

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
        addTags,
        updateArea,
        updateTablesState,
        updateTag: vi.fn(),
        removeTags: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({ effectiveTheme: 'light' }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { count?: number }) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }
            if (typeof current !== 'string') {
                return key;
            }
            if (options?.count !== undefined) {
                return current.replace('{{count}}', String(options.count));
            }
            return current;
        },
    }),
}));

const renderSection = () =>
    render(
        <EditorFiltersProvider>
            <FiltersSection />
        </EditorFiltersProvider>
    );

describe('FiltersSection', () => {
    beforeEach(() => {
        chartDBState.diagramId = 'diagram-1';
        chartDBState.tags = [
            { id: 'tag-z', name: 'Zulu', color: '#ff6363' },
            { id: 'tag-a', name: 'Alpha', color: '#8eb7ff' },
        ];
        chartDBState.areas = [
            {
                id: 'area-z',
                name: 'Warehouse',
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                color: '#111111',
            },
            {
                id: 'area-a',
                name: 'Core',
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                color: '#222222',
            },
        ];
        chartDBState.tables = [
            {
                id: 'users',
                name: 'users',
                schema: 'public',
                x: 0,
                y: 0,
                fields: [],
                indexes: [],
                color: '#fff',
                isView: false,
                createdAt: 0,
            },
            {
                id: 'invoices',
                name: 'invoices',
                schema: 'billing',
                x: 0,
                y: 0,
                fields: [],
                indexes: [],
                color: '#fff',
                isView: false,
                createdAt: 0,
            },
        ];
        addTags.mockClear();
        updateArea.mockClear();
        updateTablesState.mockClear();
    });

    it('sorts tags and starts with no constraint', () => {
        renderSection();

        const names = screen
            .getAllByTitle(/Alpha|Zulu/)
            .map((node) => node.textContent);
        expect(names).toEqual(['Alpha', 'Zulu']);
        expect(screen.getByText('No tag constraint')).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Clear' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Create tag' })
        ).not.toBeInTheDocument();
    });

    it('selects personal tags and summarizes the count', async () => {
        const user = userEvent.setup();
        renderSection();

        await user.click(screen.getByRole('checkbox', { name: 'Zulu' }));
        await user.click(screen.getByRole('checkbox', { name: 'Alpha' }));

        expect(screen.getByRole('checkbox', { name: 'Alpha' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Zulu' })).toBeChecked();
        expect(screen.getByText('2 selected')).toBeInTheDocument();
        expect(addTags).not.toHaveBeenCalled();
    });

    it('changes match mode and ignores clearing the active mode', async () => {
        const user = userEvent.setup();
        renderSection();

        await user.click(screen.getByRole('radio', { name: 'All' }));
        expect(screen.getByText('Every selected tag')).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: 'None' }));
        expect(
            screen.getByText('None of the selected tags')
        ).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: 'None' }));
        expect(
            screen.getByText('None of the selected tags')
        ).toBeInTheDocument();
        expect(screen.getByText('No tag constraint')).toBeInTheDocument();
    });

    it('clears only the personal filter', async () => {
        const user = userEvent.setup();
        renderSection();

        await user.click(screen.getByRole('checkbox', { name: 'Alpha' }));
        await user.click(screen.getByRole('radio', { name: 'All' }));
        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(
            screen.getByRole('checkbox', { name: 'Alpha' })
        ).not.toBeChecked();
        expect(
            screen.getByText('At least one selected tag')
        ).toBeInTheDocument();
        expect(addTags).not.toHaveBeenCalled();
    });

    it('shows the empty state and a tag added on the diagram', () => {
        chartDBState.tags = [];
        const { rerender } = renderSection();

        expect(screen.getByText('No tags on this diagram')).toBeInTheDocument();

        chartDBState.tags = [
            { id: 'tag-new', name: 'Finance', color: '#ffe374' },
        ];
        rerender(
            <EditorFiltersProvider>
                <FiltersSection />
            </EditorFiltersProvider>
        );

        expect(screen.getByText('Finance')).toBeInTheDocument();
        expect(
            screen.queryByText('No tags on this diagram')
        ).not.toBeInTheDocument();
    });

    it('shows Tags, Areas, and Schemas tabs', () => {
        renderSection();

        expect(screen.getByRole('tab', { name: 'Tags' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Areas' })).toBeInTheDocument();
        expect(
            screen.getByRole('tab', { name: 'Schemas' })
        ).toBeInTheDocument();
    });

    it('selects areas from the diagram and clears only that constraint', async () => {
        const user = userEvent.setup();
        renderSection();

        await user.click(screen.getByRole('tab', { name: 'Areas' }));
        const names = screen
            .getAllByTitle(/Core|Warehouse/)
            .map((node) => node.textContent);
        expect(names).toEqual(['Core', 'Warehouse']);
        expect(screen.getByText('No area constraint')).toBeInTheDocument();

        await user.click(screen.getByRole('checkbox', { name: 'Warehouse' }));
        await user.click(screen.getByRole('checkbox', { name: 'Core' }));
        expect(screen.getByText('2 selected')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Clear' }));
        expect(
            screen.getByRole('checkbox', { name: 'Core' })
        ).not.toBeChecked();
        expect(updateArea).not.toHaveBeenCalled();
        expect(addTags).not.toHaveBeenCalled();
    });

    it('selects schemas from table schemas and does not call the legacy filter', async () => {
        const user = userEvent.setup();
        renderSection();

        await user.click(screen.getByRole('tab', { name: 'Schemas' }));
        expect(screen.getByText('No schema constraint')).toBeInTheDocument();
        await user.click(screen.getByRole('checkbox', { name: 'billing' }));
        await user.click(screen.getByRole('checkbox', { name: 'public' }));
        expect(screen.getByText('2 selected')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Clear' }));
        expect(
            screen.getByRole('checkbox', { name: 'public' })
        ).not.toBeChecked();
        expect(updateTablesState).not.toHaveBeenCalled();
    });

    it('rerenders area options when the diagram gains an area', async () => {
        const user = userEvent.setup();
        chartDBState.areas = [];
        const { rerender } = renderSection();

        await user.click(screen.getByRole('tab', { name: 'Areas' }));
        expect(
            screen.getByText('No areas on this diagram')
        ).toBeInTheDocument();

        chartDBState.areas = [
            {
                id: 'area-new',
                name: 'Archive',
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                color: '#abc',
            },
        ];
        rerender(
            <EditorFiltersProvider>
                <FiltersSection />
            </EditorFiltersProvider>
        );

        expect(screen.getByText('Archive')).toBeInTheDocument();
        expect(updateArea).not.toHaveBeenCalled();
    });
});
