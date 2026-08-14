import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SidePanelFilterEmptyState } from '../side-panel-filter-empty-state';

describe('SidePanelFilterEmptyState', () => {
    it('renders FiSlash instead of the default empty-state image', () => {
        render(
            <SidePanelFilterEmptyState
                title="No results"
                description="Nothing matches your filter."
                clearLabel="Clear Filter"
                onClearFilter={vi.fn()}
            />
        );

        expect(screen.getByText('No results')).toBeInTheDocument();
        expect(
            screen.getByText('Nothing matches your filter.')
        ).toBeInTheDocument();
        expect(document.querySelector('img[alt="Empty state"]')).toBeNull();
        expect(document.querySelector('svg')).not.toBeNull();
    });

    it('calls onClearFilter from the secondary action', async () => {
        const user = userEvent.setup();
        const onClearFilter = vi.fn();

        render(
            <SidePanelFilterEmptyState
                title="No results"
                clearLabel="Clear Filter"
                onClearFilter={onClearFilter}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Clear Filter' }));
        expect(onClearFilter).toHaveBeenCalledTimes(1);
    });
});
