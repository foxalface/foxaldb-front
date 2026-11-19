import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useHotkeys } from 'react-hotkeys-hook';
import { LayoutProvider } from '@/context/layout-context/layout-provider';
import { useLayout } from '@/hooks/use-layout';
import { toggleFiltersSidebar } from '../toggle-filters-sidebar';

vi.mock('@/hooks/use-breakpoint', () => ({
    useBreakpoint: () => ({ isMd: true }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: '42',
    }),
}));

const ShortcutHarness: React.FC = () => {
    const { toggleSidebarSection, selectedSidebarSection, isSidePanelShowed } =
        useLayout();

    useHotkeys(
        'meta+f,ctrl+f',
        () => {
            toggleFiltersSidebar(toggleSidebarSection);
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
        },
        [toggleSidebarSection]
    );

    return (
        <div>
            <span data-testid="section">{selectedSidebarSection}</span>
            <span data-testid="open">{isSidePanelShowed ? 'yes' : 'no'}</span>
        </div>
    );
};

describe('Ctrl/Cmd+F filters sidebar', () => {
    it('selects filters and toggles the panel closed', async () => {
        const user = userEvent.setup();
        render(
            <LayoutProvider>
                <ShortcutHarness />
            </LayoutProvider>
        );

        expect(screen.getByTestId('section')).toHaveTextContent('tables');
        expect(screen.getByTestId('open')).toHaveTextContent('yes');

        await user.keyboard('{Control>}f{/Control}');
        expect(screen.getByTestId('section')).toHaveTextContent('filters');
        expect(screen.getByTestId('open')).toHaveTextContent('yes');

        await user.keyboard('{Meta>}f{/Meta}');
        expect(screen.getByTestId('section')).toHaveTextContent('filters');
        expect(screen.getByTestId('open')).toHaveTextContent('no');
    });

    it('wires the canvas shortcut to the filters sidebar and not the old overlay', () => {
        const canvas = readFileSync(
            resolve(process.cwd(), 'src/pages/editor-page/canvas/canvas.tsx'),
            'utf8'
        );

        expect(canvas).toContain(
            "operatingSystem === 'mac' ? 'meta+f' : 'ctrl+f'"
        );
        expect(canvas).toContain('toggleFiltersSidebar(toggleSidebarSection)');
        expect(canvas).not.toContain("from './canvas-filter/canvas-filter'");
        expect(canvas).not.toContain('setShowFilter');
        expect(canvas).not.toContain('useDiagramFilter');
    });
});
