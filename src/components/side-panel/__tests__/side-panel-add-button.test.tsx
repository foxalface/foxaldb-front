import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { SidePanelAddButton } from '../side-panel-add-button';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('SidePanelAddButton', () => {
    it('renders a plus button with an accessible label and tooltip text', async () => {
        render(
            <TooltipProvider>
                <SidePanelAddButton label="Add table" onClick={vi.fn()} />
            </TooltipProvider>
        );

        const button = screen.getByRole('button', { name: 'Add table' });
        expect(button).toBeInTheDocument();
        expect(button.querySelector('svg')).toBeInTheDocument();
    });
});
