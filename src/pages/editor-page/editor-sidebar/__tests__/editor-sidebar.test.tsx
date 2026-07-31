import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { SidebarSection } from '@/context/layout-context/layout-context';
import { en } from '@/i18n/locales/en';
import { SidebarProvider } from '@/components/sidebar/sidebar';

const { layoutState, conversationsAvailabilityState } = vi.hoisted(() => ({
    layoutState: {
        selectedSidebarSection: 'tables' as SidebarSection,
        selectSidebarSection: vi.fn(),
        showSidePanel: vi.fn(),
        selectVisualsTab: vi.fn(),
        openConversationsPanel: vi.fn(),
    },
    conversationsAvailabilityState: {
        isAvailable: false,
    },
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => layoutState,
}));

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () =>
        conversationsAvailabilityState.isAvailable,
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

describe('EditorSidebar conversations entry', () => {
    beforeEach(() => {
        layoutState.selectedSidebarSection = 'tables';
        layoutState.selectSidebarSection = vi.fn();
        layoutState.showSidePanel = vi.fn();
        layoutState.selectVisualsTab = vi.fn();
        layoutState.openConversationsPanel = vi.fn();
        conversationsAvailabilityState.isAvailable = false;
    });

    it('shows the Conversations item when conversations are available', () => {
        conversationsAvailabilityState.isAvailable = true;
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Conversations' })
        ).toBeInTheDocument();
    });

    it('hides the Conversations item when conversations are unavailable', () => {
        conversationsAvailabilityState.isAvailable = false;
        renderSidebar();

        expect(
            screen.queryByRole('button', { name: 'Conversations' })
        ).not.toBeInTheDocument();
    });

    it('opens the conversations panel on click', async () => {
        conversationsAvailabilityState.isAvailable = true;
        const user = userEvent.setup();
        renderSidebar();

        await user.click(screen.getByRole('button', { name: 'Conversations' }));

        expect(layoutState.openConversationsPanel).toHaveBeenCalledTimes(1);
    });

    it('marks the conversations control active when conversations is selected', () => {
        conversationsAvailabilityState.isAvailable = true;
        layoutState.selectedSidebarSection = 'conversations';
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Conversations' })
        ).toHaveAttribute('data-active', 'true');
    });

    it('does not render legacy Comments entries', () => {
        conversationsAvailabilityState.isAvailable = true;
        renderSidebar();

        expect(
            screen.queryByRole('button', { name: /legacy/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Comments (legacy)' })
        ).not.toBeInTheDocument();
    });
});
