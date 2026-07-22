import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { SidebarSection } from '@/context/layout-context/layout-context';
import { en } from '@/i18n/locales/en';
import { SidebarProvider } from '@/components/sidebar/sidebar';

const { layoutState, commentsState } = vi.hoisted(() => ({
    layoutState: {
        selectedSidebarSection: 'tables' as SidebarSection,
        selectSidebarSection: vi.fn(),
        showSidePanel: vi.fn(),
        selectVisualsTab: vi.fn(),
    },
    commentsState: {
        isActive: true,
    },
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => layoutState,
}));

vi.mock('@/hooks/use-diagram-comments', () => ({
    useDiagramComments: () => ({
        isActive: commentsState.isActive,
        comments: [],
        status: 'idle',
        error: null,
        diagramId: null,
        reload: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-breakpoint', () => ({
    useBreakpoint: () => ({ isMd: true }),
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({ effectiveTheme: 'light' }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ databaseType: DatabaseType.POSTGRESQL }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openCreateDiagramDialog: vi.fn(),
        openOpenDiagramDialog: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
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
            return typeof current === 'string' ? current : key;
        },
    }),
}));

import { EditorSidebar } from '../editor-sidebar';

const renderSidebar = () =>
    render(
        <SidebarProvider defaultOpen>
            <EditorSidebar />
        </SidebarProvider>
    );

describe('EditorSidebar comments entry', () => {
    beforeEach(() => {
        layoutState.selectedSidebarSection = 'tables';
        layoutState.selectSidebarSection = vi.fn();
        layoutState.showSidePanel = vi.fn();
        layoutState.selectVisualsTab = vi.fn();
        commentsState.isActive = true;
    });

    it('shows the Discussions item when comments are active', () => {
        commentsState.isActive = true;
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Discussions' })
        ).toBeInTheDocument();
    });

    it('hides the Discussions item when comments are inactive', () => {
        commentsState.isActive = false;
        renderSidebar();

        expect(
            screen.queryByRole('button', { name: 'Discussions' })
        ).not.toBeInTheDocument();
    });

    it('opens the side panel and selects comments on click', async () => {
        const user = userEvent.setup();
        renderSidebar();

        await user.click(screen.getByRole('button', { name: 'Discussions' }));

        expect(layoutState.showSidePanel).toHaveBeenCalledTimes(1);
        expect(layoutState.selectSidebarSection).toHaveBeenCalledWith(
            'comments'
        );
        expect(
            layoutState.showSidePanel.mock.invocationCallOrder[0]
        ).toBeLessThan(
            layoutState.selectSidebarSection.mock.invocationCallOrder[0]
        );
    });

    it('marks the Discussions control active when comments is selected', () => {
        layoutState.selectedSidebarSection = 'comments';
        renderSidebar();

        const button = screen.getByRole('button', { name: 'Discussions' });
        expect(button).toHaveAttribute('data-active', 'true');
        expect(button).toHaveAccessibleName('Discussions');
    });

    it('does not render a badge or counter for Discussions', () => {
        renderSidebar();

        const button = screen.getByRole('button', { name: 'Discussions' });
        expect(button.parentElement?.querySelector('.rounded-full')).toBeNull();
        expect(button.textContent).not.toMatch(/\d/);
    });
});
