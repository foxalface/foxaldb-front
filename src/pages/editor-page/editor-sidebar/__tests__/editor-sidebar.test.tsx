import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { SidebarSection } from '@/context/layout-context/layout-context';
import { en } from '@/i18n/locales/en';
import { SidebarProvider } from '@/components/sidebar/sidebar';

const { layoutState, commentsState, conversationsAvailabilityState } =
    vi.hoisted(() => ({
        layoutState: {
            selectedSidebarSection: 'tables' as SidebarSection,
            selectSidebarSection: vi.fn(),
            showSidePanel: vi.fn(),
            selectVisualsTab: vi.fn(),
            openAllDiscussions: vi.fn(),
            openConversationsPanel: vi.fn(),
        },
        commentsState: {
            isActive: true,
        },
        conversationsAvailabilityState: {
            isAvailable: false,
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

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () =>
        conversationsAvailabilityState.isAvailable,
}));

vi.mock('@/hooks/use-comments-availability', () => ({
    useCommentsAvailability: () => commentsState.isActive,
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
        layoutState.openAllDiscussions = vi.fn();
        layoutState.openConversationsPanel = vi.fn();
        commentsState.isActive = true;
        conversationsAvailabilityState.isAvailable = false;
    });

    it('shows the Conversations item when comments are active', () => {
        commentsState.isActive = true;
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Conversations' })
        ).toBeInTheDocument();
    });

    it('hides the Conversations item when comments are inactive', () => {
        commentsState.isActive = false;
        renderSidebar();

        expect(
            screen.queryByRole('button', { name: 'Conversations' })
        ).not.toBeInTheDocument();
    });

    it('opens all conversations through openAllDiscussions on click', async () => {
        const user = userEvent.setup();
        renderSidebar();

        await user.click(screen.getByRole('button', { name: 'Conversations' }));

        expect(layoutState.openAllDiscussions).toHaveBeenCalledTimes(1);
        expect(layoutState.showSidePanel).not.toHaveBeenCalled();
        expect(layoutState.selectSidebarSection).not.toHaveBeenCalled();
    });

    it('marks the Conversations control active when comments is selected', () => {
        layoutState.selectedSidebarSection = 'comments';
        renderSidebar();

        const button = screen.getByRole('button', { name: 'Conversations' });
        expect(button).toHaveAttribute('data-active', 'true');
        expect(button).toHaveAccessibleName('Conversations');
    });

    it('does not render a badge or counter for Conversations', () => {
        renderSidebar();

        const button = screen.getByRole('button', { name: 'Conversations' });
        expect(button.parentElement?.querySelector('.rounded-full')).toBeNull();
        expect(button.textContent).not.toMatch(/\d/);
    });
});

describe('EditorSidebar conversations entry', () => {
    beforeEach(() => {
        layoutState.selectedSidebarSection = 'tables';
        layoutState.openConversationsPanel = vi.fn();
        commentsState.isActive = true;
        conversationsAvailabilityState.isAvailable = true;
    });

    it('shows the new Conversations item when conversations are available', () => {
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Conversations' })
        ).toBeInTheDocument();
    });

    it('opens the conversations panel instead of legacy comments', async () => {
        const user = userEvent.setup();
        renderSidebar();

        await user.click(screen.getByRole('button', { name: 'Conversations' }));

        expect(layoutState.openConversationsPanel).toHaveBeenCalledTimes(1);
        expect(layoutState.openAllDiscussions).not.toHaveBeenCalled();
    });

    it('marks the conversations control active when conversations is selected', () => {
        layoutState.selectedSidebarSection = 'conversations';
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Conversations' })
        ).toHaveAttribute('data-active', 'true');
    });

    it('shows legacy Comments access when both stacks are available', () => {
        renderSidebar();

        const legacyButton = screen.getByRole('button', {
            name: 'Open legacy comments panel',
        });
        expect(legacyButton).toBeInTheDocument();
        expect(legacyButton.textContent).toContain('Comments');
        expect(legacyButton.textContent).toContain('legacy');
    });

    it('opens the legacy Comments panel through openAllDiscussions', async () => {
        const user = userEvent.setup();
        renderSidebar();

        await user.click(
            screen.getByRole('button', { name: 'Open legacy comments panel' })
        );

        expect(layoutState.openAllDiscussions).toHaveBeenCalledTimes(1);
        expect(layoutState.openConversationsPanel).not.toHaveBeenCalled();
    });

    it('marks the legacy comments control active when comments is selected', () => {
        layoutState.selectedSidebarSection = 'comments';
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Open legacy comments panel' })
        ).toHaveAttribute('data-active', 'true');
    });

    it('does not show legacy Comments when comments are unavailable', () => {
        commentsState.isActive = false;
        renderSidebar();

        expect(
            screen.queryByRole('button', { name: 'Open legacy comments panel' })
        ).not.toBeInTheDocument();
    });
});
