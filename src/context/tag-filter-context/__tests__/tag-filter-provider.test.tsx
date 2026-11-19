import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramTag } from '@/lib/domain/diagram-tag';
import type { TagMatchMode } from '@/lib/domain/diagram-tag';
import { TagFilterProvider } from '../tag-filter-provider';
import { useTagFilter } from '../use-tag-filter';

const { chartDBState } = vi.hoisted(() => ({
    chartDBState: {
        diagramId: 'diagram-1',
        tags: [] as DiagramTag[],
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: chartDBState.diagramId,
        currentDiagram: {
            id: chartDBState.diagramId,
            tags: chartDBState.tags,
            updatedAt: chartDBState.updatedAt,
        },
    }),
}));

const Probe: React.FC = () => {
    const filter = useTagFilter();

    return (
        <div>
            <span data-testid="ids">{filter.selectedTagIds.join(',')}</span>
            <span data-testid="mode">{filter.matchMode}</span>
            <span data-testid="constraint">
                {filter.hasTagConstraint ? 'yes' : 'no'}
            </span>
            <button type="button" onClick={() => filter.toggleTag('tag-a')}>
                toggle-a
            </button>
            <button type="button" onClick={() => filter.toggleTag('tag-b')}>
                toggle-b
            </button>
            <button type="button" onClick={() => filter.setMatchMode('all')}>
                mode-all
            </button>
            <button type="button" onClick={() => filter.setMatchMode('none')}>
                mode-none
            </button>
            <button
                type="button"
                onClick={() => filter.setMatchMode('' as TagMatchMode)}
            >
                mode-empty
            </button>
            <button type="button" onClick={() => filter.clearTagFilter()}>
                clear
            </button>
        </div>
    );
};

const renderFilter = () =>
    render(
        <TagFilterProvider>
            <Probe />
        </TagFilterProvider>
    );

describe('TagFilterProvider', () => {
    beforeEach(() => {
        chartDBState.diagramId = 'diagram-1';
        chartDBState.tags = [
            { id: 'tag-a', name: 'Alpha', color: '#fff' },
            { id: 'tag-b', name: 'Beta', color: '#000' },
        ];
        chartDBState.updatedAt = new Date('2026-01-01T00:00:00.000Z');
    });

    it('starts with no constraint', () => {
        renderFilter();

        expect(screen.getByTestId('ids')).toHaveTextContent('');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
        expect(screen.getByTestId('constraint')).toHaveTextContent('no');
    });

    it('toggles tags in click order and clears them', async () => {
        const user = userEvent.setup();
        renderFilter();

        await user.click(screen.getByRole('button', { name: 'toggle-a' }));
        await user.click(screen.getByRole('button', { name: 'toggle-b' }));
        expect(screen.getByTestId('ids')).toHaveTextContent('tag-a,tag-b');
        expect(screen.getByTestId('constraint')).toHaveTextContent('yes');

        await user.click(screen.getByRole('button', { name: 'toggle-a' }));
        expect(screen.getByTestId('ids')).toHaveTextContent('tag-b');

        await user.click(screen.getByRole('button', { name: 'mode-all' }));
        await user.click(screen.getByRole('button', { name: 'mode-none' }));
        expect(screen.getByTestId('mode')).toHaveTextContent('none');

        await user.click(screen.getByRole('button', { name: 'mode-empty' }));
        expect(screen.getByTestId('mode')).toHaveTextContent('none');

        await user.click(screen.getByRole('button', { name: 'clear' }));
        expect(screen.getByTestId('ids')).toHaveTextContent('');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
        expect(chartDBState.tags.map((tag) => tag.id)).toEqual([
            'tag-a',
            'tag-b',
        ]);
        expect(chartDBState.updatedAt.toISOString()).toBe(
            '2026-01-01T00:00:00.000Z'
        );
    });

    it('prunes a deleted tag and keeps a renamed tag selected', async () => {
        const user = userEvent.setup();
        const { rerender } = renderFilter();
        await user.click(screen.getByRole('button', { name: 'toggle-a' }));
        await user.click(screen.getByRole('button', { name: 'toggle-b' }));

        chartDBState.tags = [
            { id: 'tag-a', name: 'Alpha renamed', color: '#123456' },
        ];
        rerender(
            <TagFilterProvider>
                <Probe />
            </TagFilterProvider>
        );

        expect(screen.getByTestId('ids')).toHaveTextContent('tag-a');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
    });

    it('resets when the diagram changes and keeps a valid selection otherwise', async () => {
        const user = userEvent.setup();
        const { rerender } = renderFilter();
        await user.click(screen.getByRole('button', { name: 'toggle-a' }));
        await user.click(screen.getByRole('button', { name: 'mode-all' }));

        chartDBState.tags = [
            { id: 'tag-a', name: 'Alpha', color: '#fff' },
            { id: 'tag-c', name: 'Gamma', color: '#eee' },
        ];
        rerender(
            <TagFilterProvider>
                <Probe />
            </TagFilterProvider>
        );
        expect(screen.getByTestId('ids')).toHaveTextContent('tag-a');
        expect(screen.getByTestId('mode')).toHaveTextContent('all');

        chartDBState.diagramId = 'diagram-2';
        chartDBState.tags = [{ id: 'tag-a', name: 'Alpha', color: '#fff' }];
        rerender(
            <TagFilterProvider>
                <Probe />
            </TagFilterProvider>
        );

        expect(screen.getByTestId('ids')).toHaveTextContent('');
        expect(screen.getByTestId('mode')).toHaveTextContent('any');
    });

    it('keeps the context value stable when state does not change', () => {
        const seen: unknown[] = [];
        const IdentityProbe = () => {
            seen.push(useTagFilter());
            return null;
        };
        const { rerender } = render(
            <TagFilterProvider>
                <IdentityProbe />
            </TagFilterProvider>
        );
        rerender(
            <TagFilterProvider>
                <IdentityProbe />
            </TagFilterProvider>
        );

        expect(seen[0]).toBe(seen[1]);
    });
});
