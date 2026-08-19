import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { SidebarSection } from '@/context/layout-context/layout-context';
import { en } from '@/i18n/locales/en';

const {
    layoutState,
    conversationsAvailabilityState,
    activitiesAvailabilityState,
    shareAvailabilityState,
    breakpointState,
} = vi.hoisted(() => {
    const state = {
        selectedSidebarSection: 'tables' as SidebarSection,
        selectSidebarSection: vi.fn(),
        openConversationsPanel: vi.fn(),
    };
    state.selectSidebarSection = vi.fn((section: SidebarSection) => {
        state.selectedSidebarSection = section;
    });
    state.openConversationsPanel = vi.fn(() => {
        state.selectedSidebarSection = 'conversations';
    });
    return {
        layoutState: state,
        conversationsAvailabilityState: {
            isAvailable: false,
        },
        activitiesAvailabilityState: {
            isAvailable: false,
        },
        shareAvailabilityState: {
            isAvailable: false,
        },
        breakpointState: {
            isMd: false,
        },
    };
});

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        get selectedSidebarSection() {
            return layoutState.selectedSidebarSection;
        },
        selectSidebarSection: (section: SidebarSection) => {
            layoutState.selectSidebarSection(section);
        },
        openConversationsPanel: () => {
            layoutState.openConversationsPanel();
        },
    }),
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
    useBreakpoint: () => ({ isMd: breakpointState.isMd }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ databaseType: DatabaseType.POSTGRESQL }),
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

vi.mock('@/components/select/select', () => ({
    Select: ({
        children,
        onValueChange,
        value,
    }: {
        children: React.ReactNode;
        onValueChange?: (value: string) => void;
        value?: string;
    }) => (
        <div data-testid="mobile-section-select" data-value={value}>
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) {
                    return child;
                }
                return React.cloneElement(
                    child as React.ReactElement<{
                        onValueChange?: (value: string) => void;
                    }>,
                    { onValueChange }
                );
            })}
        </div>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
        <button type="button">{children}</button>
    ),
    SelectValue: () => <span>Selected</span>,
    SelectContent: ({
        children,
        onValueChange,
    }: {
        children: React.ReactNode;
        onValueChange?: (value: string) => void;
    }) => (
        <div role="listbox">
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) {
                    return child;
                }
                return React.cloneElement(
                    child as React.ReactElement<{
                        onValueChange?: (value: string) => void;
                    }>,
                    { onValueChange }
                );
            })}
        </div>
    ),
    SelectGroup: ({
        children,
        onValueChange,
    }: {
        children: React.ReactNode;
        onValueChange?: (value: string) => void;
    }) => (
        <>
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) {
                    return child;
                }
                return React.cloneElement(
                    child as React.ReactElement<{
                        onValueChange?: (value: string) => void;
                        value?: string;
                    }>,
                    { onValueChange }
                );
            })}
        </>
    ),
    SelectItem: ({
        children,
        value,
        onValueChange,
    }: {
        children: React.ReactNode;
        value: string;
        onValueChange?: (value: string) => void;
    }) => (
        <button
            type="button"
            role="option"
            data-value={value}
            onClick={() => onValueChange?.(value)}
        >
            {children}
        </button>
    ),
}));

vi.mock('../tables-section/tables-section', () => ({
    TablesSection: () => <div data-testid="tables-section">TablesSection</div>,
}));

vi.mock('../refs-section/refs-section', () => ({
    RefsSection: () => <div data-testid="refs-section">RefsSection</div>,
}));

vi.mock('../visuals-section/visuals-section', () => ({
    VisualsSection: () => (
        <div data-testid="visuals-section">VisualsSection</div>
    ),
}));

vi.mock('../custom-types-section/custom-types-section', () => ({
    CustomTypesSection: () => (
        <div data-testid="custom-types-section">CustomTypesSection</div>
    ),
}));

vi.mock('../conversations-section/conversations-section', () => ({
    ConversationsSection: () => (
        <div data-testid="conversations-section">ConversationsSection</div>
    ),
}));

vi.mock('../activities-section/activities-section', () => ({
    ActivitiesSection: () => (
        <div data-testid="activities-section">ActivitiesSection</div>
    ),
}));

vi.mock('../share-section/share-section', () => ({
    ShareSection: () => <div data-testid="share-section">ShareSection</div>,
}));

vi.mock('../dbml-section/dbml-section', () => ({
    DBMLSection: () => <div data-testid="dbml-section">DBMLSection</div>,
}));

import { SidePanel } from '../side-panel';

describe('SidePanel conversations routing', () => {
    beforeEach(() => {
        layoutState.selectedSidebarSection = 'tables';
        layoutState.selectSidebarSection = vi.fn((section: SidebarSection) => {
            layoutState.selectedSidebarSection = section;
        });
        layoutState.openConversationsPanel = vi.fn(() => {
            layoutState.selectedSidebarSection = 'conversations';
        });
        conversationsAvailabilityState.isAvailable = false;
        activitiesAvailabilityState.isAvailable = false;
        shareAvailabilityState.isAvailable = false;
        breakpointState.isMd = false;
    });

    it('includes Conversations in the mobile selector when conversations are available', () => {
        conversationsAvailabilityState.isAvailable = true;
        render(<SidePanel />);

        expect(
            screen.getByRole('option', { name: 'Conversations' })
        ).toHaveAttribute('data-value', 'conversations');
    });

    it('excludes Conversations from the mobile selector when unavailable', () => {
        conversationsAvailabilityState.isAvailable = false;
        render(<SidePanel />);

        expect(
            screen.queryByRole('option', { name: 'Conversations' })
        ).not.toBeInTheDocument();
    });

    it('renders ConversationsSection when selectedSidebarSection is conversations', () => {
        layoutState.selectedSidebarSection = 'conversations';
        render(<SidePanel />);

        expect(screen.getByTestId('conversations-section')).toBeInTheDocument();
        expect(screen.queryByTestId('tables-section')).not.toBeInTheDocument();
    });

    it('keeps existing section routing intact', () => {
        layoutState.selectedSidebarSection = 'tables';
        const { rerender } = render(<SidePanel />);
        expect(screen.getByTestId('tables-section')).toBeInTheDocument();

        layoutState.selectedSidebarSection = 'refs';
        rerender(<SidePanel />);
        expect(screen.getByTestId('refs-section')).toBeInTheDocument();

        layoutState.selectedSidebarSection = 'visuals';
        rerender(<SidePanel />);
        expect(screen.getByTestId('visuals-section')).toBeInTheDocument();

        layoutState.selectedSidebarSection = 'customTypes';
        rerender(<SidePanel />);
        expect(screen.getByTestId('custom-types-section')).toBeInTheDocument();
    });

    it('calls openConversationsPanel when selecting mobile Conversations', async () => {
        conversationsAvailabilityState.isAvailable = true;
        const user = userEvent.setup();
        render(<SidePanel />);

        await user.click(screen.getByRole('option', { name: 'Conversations' }));

        expect(layoutState.openConversationsPanel).toHaveBeenCalledTimes(1);
    });

    it('keeps other mobile sections on the existing selection path', async () => {
        const user = userEvent.setup();
        render(<SidePanel />);

        await user.click(screen.getByRole('option', { name: 'Refs' }));

        expect(layoutState.selectSidebarSection).toHaveBeenCalledWith('refs');
        expect(layoutState.openConversationsPanel).not.toHaveBeenCalled();
    });

    it('does not expose legacy Comments options in the mobile selector', () => {
        conversationsAvailabilityState.isAvailable = true;
        render(<SidePanel />);

        expect(
            screen.queryByRole('option', { name: /legacy/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('option', { name: 'Comments (legacy)' })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('option', { name: 'comments' })
        ).not.toBeInTheDocument();
    });

    it('does not show the mobile selector on desktop', () => {
        breakpointState.isMd = true;
        layoutState.selectedSidebarSection = 'conversations';
        render(<SidePanel />);

        expect(
            screen.queryByTestId('mobile-section-select')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('conversations-section')).toBeInTheDocument();
    });

    it('includes Activity in the mobile selector when activities are available', () => {
        activitiesAvailabilityState.isAvailable = true;
        render(<SidePanel />);

        expect(
            screen.getByRole('option', { name: 'Activity' })
        ).toHaveAttribute('data-value', 'activities');
    });

    it('renders ActivitiesSection when selectedSidebarSection is activities', () => {
        layoutState.selectedSidebarSection = 'activities';
        render(<SidePanel />);

        expect(screen.getByTestId('activities-section')).toBeInTheDocument();
    });

    it('includes Share in the mobile selector when share is available', () => {
        shareAvailabilityState.isAvailable = true;
        render(<SidePanel />);

        expect(screen.getByRole('option', { name: 'Share' })).toHaveAttribute(
            'data-value',
            'share'
        );
    });

    it('renders ShareSection when selectedSidebarSection is share', () => {
        layoutState.selectedSidebarSection = 'share';
        render(<SidePanel />);

        expect(screen.getByTestId('share-section')).toBeInTheDocument();
    });
});
