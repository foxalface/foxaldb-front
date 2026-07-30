import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { SidebarSection } from '@/context/layout-context/layout-context';
import { en } from '@/i18n/locales/en';

const {
    layoutState,
    commentsState,
    conversationsAvailabilityState,
    breakpointState,
} = vi.hoisted(() => {
    const state = {
        selectedSidebarSection: 'tables' as SidebarSection,
        selectSidebarSection: vi.fn(),
        openAllDiscussions: vi.fn(),
        openConversationsPanel: vi.fn(),
    };
    state.selectSidebarSection = vi.fn((section: SidebarSection) => {
        state.selectedSidebarSection = section;
    });
    state.openAllDiscussions = vi.fn(() => {
        state.selectedSidebarSection = 'comments';
    });
    state.openConversationsPanel = vi.fn(() => {
        state.selectedSidebarSection = 'conversations';
    });
    return {
        layoutState: state,
        commentsState: {
            isActive: true,
        },
        conversationsAvailabilityState: {
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
        openAllDiscussions: () => {
            layoutState.openAllDiscussions();
        },
        openConversationsPanel: () => {
            layoutState.openConversationsPanel();
        },
    }),
}));

vi.mock('@/hooks/use-diagram-comments', () => ({
    useDiagramComments: () => ({
        isActive: commentsState.isActive,
        comments: [],
        status: 'ready',
        error: null,
        diagramId: '42',
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
    useBreakpoint: () => ({ isMd: breakpointState.isMd }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({ databaseType: DatabaseType.POSTGRESQL }),
}));

vi.mock('@/hooks/use-theme', () => ({
    useTheme: () => ({ effectiveTheme: 'light' }),
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

// Keep SidePanel routing real; stub Radix Select so options stay queryable in happy-dom.
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

vi.mock('../comments-section/comments-section', () => ({
    CommentsSection: () => (
        <div data-testid="comments-section">CommentsSection</div>
    ),
}));

vi.mock('../conversations-section/conversations-section', () => ({
    ConversationsSection: () => (
        <div data-testid="conversations-section">ConversationsSection</div>
    ),
}));

vi.mock('../dbml-section/dbml-section', () => ({
    DBMLSection: () => <div data-testid="dbml-section">DBMLSection</div>,
}));

import { SidePanel } from '../side-panel';

describe('SidePanel comments routing', () => {
    beforeEach(() => {
        layoutState.selectedSidebarSection = 'tables';
        layoutState.selectSidebarSection = vi.fn((section: SidebarSection) => {
            layoutState.selectedSidebarSection = section;
        });
        layoutState.openAllDiscussions = vi.fn(() => {
            layoutState.selectedSidebarSection = 'comments';
        });
        layoutState.openConversationsPanel = vi.fn(() => {
            layoutState.selectedSidebarSection = 'conversations';
        });
        commentsState.isActive = true;
        conversationsAvailabilityState.isAvailable = false;
        breakpointState.isMd = false;
    });

    it('includes Discussions in the mobile selector when comments are active', () => {
        commentsState.isActive = true;
        render(<SidePanel />);

        expect(
            screen.getByRole('option', { name: 'Conversations' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('option', { name: 'Conversations' })
        ).toHaveAttribute('data-value', 'comments');
    });

    it('excludes Discussions from the mobile selector when comments are inactive', () => {
        commentsState.isActive = false;
        render(<SidePanel />);

        expect(
            screen.queryByRole('option', { name: 'Conversations' })
        ).not.toBeInTheDocument();
    });

    it('renders CommentsSection when selectedSidebarSection is comments', () => {
        layoutState.selectedSidebarSection = 'comments';
        render(<SidePanel />);

        expect(screen.getByTestId('comments-section')).toBeInTheDocument();
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

    it('calls openAllDiscussions when selecting mobile Conversations', async () => {
        const user = userEvent.setup();
        render(<SidePanel />);

        await user.click(screen.getByRole('option', { name: 'Conversations' }));

        expect(layoutState.openAllDiscussions).toHaveBeenCalledTimes(1);
        expect(layoutState.selectSidebarSection).not.toHaveBeenCalledWith(
            'comments'
        );
    });

    it('keeps other mobile sections on the existing selection path', async () => {
        const user = userEvent.setup();
        render(<SidePanel />);

        await user.click(screen.getByRole('option', { name: 'Refs' }));

        expect(layoutState.selectSidebarSection).toHaveBeenCalledWith('refs');
        expect(layoutState.openAllDiscussions).not.toHaveBeenCalled();
    });

    it('does not re-open all conversations when comments is already selected', async () => {
        const user = userEvent.setup();
        layoutState.selectedSidebarSection = 'comments';
        render(<SidePanel />);

        await user.click(screen.getByRole('option', { name: 'Conversations' }));

        expect(layoutState.openAllDiscussions).not.toHaveBeenCalled();
    });

    it('restores all conversations after leaving comments and selecting Conversations again', async () => {
        const user = userEvent.setup();
        layoutState.selectedSidebarSection = 'comments';
        const { rerender } = render(<SidePanel />);

        await user.click(screen.getByRole('option', { name: 'Refs' }));
        expect(layoutState.selectSidebarSection).toHaveBeenCalledWith('refs');
        expect(layoutState.selectedSidebarSection).toBe('refs');

        rerender(<SidePanel />);

        await user.click(screen.getByRole('option', { name: 'Conversations' }));
        expect(layoutState.openAllDiscussions).toHaveBeenCalledTimes(1);
    });

    it('does not show the mobile selector on desktop while still routing comments', () => {
        breakpointState.isMd = true;
        layoutState.selectedSidebarSection = 'comments';
        render(<SidePanel />);

        expect(
            screen.queryByTestId('mobile-section-select')
        ).not.toBeInTheDocument();
        expect(screen.getByTestId('comments-section')).toBeInTheDocument();
    });
});

describe('SidePanel conversations routing', () => {
    beforeEach(() => {
        layoutState.selectedSidebarSection = 'tables';
        layoutState.openConversationsPanel = vi.fn(() => {
            layoutState.selectedSidebarSection = 'conversations';
        });
        commentsState.isActive = true;
        conversationsAvailabilityState.isAvailable = true;
        breakpointState.isMd = false;
    });

    it('includes Conversations in the mobile selector when conversations are available', () => {
        render(<SidePanel />);

        expect(
            screen.getByRole('option', { name: 'Conversations' })
        ).toHaveAttribute('data-value', 'conversations');
    });

    it('renders ConversationsSection when selectedSidebarSection is conversations', () => {
        layoutState.selectedSidebarSection = 'conversations';
        render(<SidePanel />);

        expect(screen.getByTestId('conversations-section')).toBeInTheDocument();
    });

    it('calls openConversationsPanel when selecting mobile Conversations', async () => {
        const user = userEvent.setup();
        render(<SidePanel />);

        await user.click(screen.getByRole('option', { name: 'Conversations' }));

        expect(layoutState.openConversationsPanel).toHaveBeenCalledTimes(1);
    });

    it('exposes legacy Comments in the mobile selector when both stacks are available', () => {
        render(<SidePanel />);

        expect(
            screen.getByRole('option', { name: 'Comments (legacy)' })
        ).toHaveAttribute('data-value', 'comments');
    });

    it('opens the legacy Comments panel from the mobile selector', async () => {
        const user = userEvent.setup();
        render(<SidePanel />);

        await user.click(
            screen.getByRole('option', { name: 'Comments (legacy)' })
        );

        expect(layoutState.openAllDiscussions).toHaveBeenCalledTimes(1);
    });

    it('does not show legacy Comments when comments are unavailable', () => {
        commentsState.isActive = false;
        render(<SidePanel />);

        expect(
            screen.queryByRole('option', { name: 'Comments (legacy)' })
        ).not.toBeInTheDocument();
    });
});
