import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { SidebarSection } from '@/context/layout-context/layout-context';
import { en } from '@/i18n/locales/en';
import { SidebarProvider } from '@/components/sidebar/sidebar';

const {
    layoutState,
    conversationsAvailabilityState,
    activitiesAvailabilityState,
    shareAvailabilityState,
} = vi.hoisted(() => ({
    layoutState: {
        selectedSidebarSection: 'tables' as SidebarSection,
        isSidePanelShowed: true,
        toggleSidebarSection: vi.fn(),
        selectVisualsTab: vi.fn(),
    },
    conversationsAvailabilityState: {
        isAvailable: false,
    },
    activitiesAvailabilityState: {
        isAvailable: false,
    },
    shareAvailabilityState: {
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

vi.mock('@/hooks/use-activities-availability', () => ({
    useActivitiesAvailability: () => activitiesAvailabilityState.isAvailable,
}));

vi.mock('@/hooks/use-share-availability', () => ({
    useShareAvailability: () => shareAvailabilityState.isAvailable,
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

const { diagramConversationsState } = vi.hoisted(() => ({
    diagramConversationsState: {
        totalUnreadCount: 0,
    },
}));

vi.mock('@/hooks/use-diagram-conversations', () => ({
    useDiagramConversations: () => diagramConversationsState,
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
        layoutState.isSidePanelShowed = true;
        layoutState.toggleSidebarSection = vi.fn();
        layoutState.selectVisualsTab = vi.fn();
        conversationsAvailabilityState.isAvailable = false;
        activitiesAvailabilityState.isAvailable = false;
        diagramConversationsState.totalUnreadCount = 0;
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

    it('toggles the conversations panel on click', async () => {
        conversationsAvailabilityState.isAvailable = true;
        const user = userEvent.setup();
        renderSidebar();

        await user.click(screen.getByRole('button', { name: 'Conversations' }));

        expect(layoutState.toggleSidebarSection).toHaveBeenCalledWith(
            'conversations'
        );
    });

    it('marks the conversations control active when conversations is selected and open', () => {
        conversationsAvailabilityState.isAvailable = true;
        layoutState.selectedSidebarSection = 'conversations';
        layoutState.isSidePanelShowed = true;
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Conversations' })
        ).toHaveAttribute('data-active', 'true');
    });

    it('marks the conversations control inactive when conversations is selected but closed', () => {
        conversationsAvailabilityState.isAvailable = true;
        layoutState.selectedSidebarSection = 'conversations';
        layoutState.isSidePanelShowed = false;
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Conversations' })
        ).toHaveAttribute('data-active', 'false');
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

describe('EditorSidebar conversations unread badge', () => {
    beforeEach(() => {
        conversationsAvailabilityState.isAvailable = true;
        diagramConversationsState.totalUnreadCount = 0;
    });

    it('shows sidebar unread badge when totalUnreadCount is positive', () => {
        diagramConversationsState.totalUnreadCount = 5;
        renderSidebar();

        expect(
            screen.getByTestId('conversation-unread-badge')
        ).toHaveTextContent('5');
    });

    it('hides sidebar unread badge when totalUnreadCount is zero', () => {
        renderSidebar();

        expect(
            screen.queryByTestId('conversation-unread-badge')
        ).not.toBeInTheDocument();
    });

    it('does not show unread badge when conversations are unavailable (guest)', () => {
        diagramConversationsState.totalUnreadCount = 8;
        conversationsAvailabilityState.isAvailable = false;
        renderSidebar();

        expect(
            screen.queryByTestId('conversation-unread-badge')
        ).not.toBeInTheDocument();
    });
});

describe('EditorSidebar activities entry', () => {
    beforeEach(() => {
        layoutState.selectedSidebarSection = 'tables';
        layoutState.isSidePanelShowed = true;
        layoutState.toggleSidebarSection = vi.fn();
        activitiesAvailabilityState.isAvailable = false;
    });

    it('shows the Activity item when activities are available', () => {
        activitiesAvailabilityState.isAvailable = true;
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Activity' })
        ).toBeInTheDocument();
    });

    it('hides the Activity item when activities are unavailable', () => {
        activitiesAvailabilityState.isAvailable = false;
        renderSidebar();

        expect(
            screen.queryByRole('button', { name: 'Activity' })
        ).not.toBeInTheDocument();
    });

    it('toggles the activities panel on click', async () => {
        activitiesAvailabilityState.isAvailable = true;
        const user = userEvent.setup();
        renderSidebar();

        await user.click(screen.getByRole('button', { name: 'Activity' }));

        expect(layoutState.toggleSidebarSection).toHaveBeenCalledWith(
            'activities'
        );
    });
});

describe('EditorSidebar share entry', () => {
    beforeEach(() => {
        layoutState.selectedSidebarSection = 'tables';
        layoutState.isSidePanelShowed = true;
        layoutState.toggleSidebarSection = vi.fn();
        shareAvailabilityState.isAvailable = false;
    });

    it('shows the Share item when share is available', () => {
        shareAvailabilityState.isAvailable = true;
        renderSidebar();

        expect(
            screen.getByRole('button', { name: 'Share' })
        ).toBeInTheDocument();
    });

    it('hides the Share item when share is unavailable', () => {
        shareAvailabilityState.isAvailable = false;
        renderSidebar();

        expect(
            screen.queryByRole('button', { name: 'Share' })
        ).not.toBeInTheDocument();
    });

    it('toggles the share panel on click', async () => {
        shareAvailabilityState.isAvailable = true;
        const user = userEvent.setup();
        renderSidebar();

        await user.click(screen.getByRole('button', { name: 'Share' }));

        expect(layoutState.toggleSidebarSection).toHaveBeenCalledWith('share');
    });
});
