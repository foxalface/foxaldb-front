import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import { en } from '@/i18n/locales/en';
import { TagFilterProvider } from '@/context/tag-filter-context/tag-filter-provider';
import { FiltersSection } from '../filters-section';

const { chartDBState, addTags } = vi.hoisted(() => ({
    chartDBState: {
        diagramId: 'diagram-1',
        tags: [] as DiagramTag[],
    },
    addTags: vi.fn(),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: chartDBState.diagramId,
        currentDiagram: {
            id: chartDBState.diagramId,
            tags: chartDBState.tags,
        },
        addTags,
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
        <TagFilterProvider>
            <FiltersSection />
        </TagFilterProvider>
    );

describe('FiltersSection', () => {
    beforeEach(() => {
        chartDBState.diagramId = 'diagram-1';
        chartDBState.tags = [
            { id: 'tag-z', name: 'Zulu', color: '#ff6363' },
            { id: 'tag-a', name: 'Alpha', color: '#8eb7ff' },
        ];
        addTags.mockClear();
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
            <TagFilterProvider>
                <FiltersSection />
            </TagFilterProvider>
        );

        expect(screen.getByText('Finance')).toBeInTheDocument();
        expect(
            screen.queryByText('No tags on this diagram')
        ).not.toBeInTheDocument();
    });
});
