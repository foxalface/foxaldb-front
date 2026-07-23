import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import {
    EMPTY_DISCUSSION_INDICATOR,
    type DiscussionIndicator,
} from '@/lib/comments/discussion-indicators';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';
import { en } from '@/i18n/locales/en';
import { RelationshipListItemHeader } from '../relationship-list-item-header';

const {
    chartDBState,
    commentsState,
    remoteEditorsState,
    discussionIndicatorState,
    useTableDiscussionIndicator,
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
    removeRelationship,
    deleteElements,
    openTargetDiscussion,
    showSidePanel,
    selectSidebarSection,
} = vi.hoisted(() => ({
    chartDBState: {
        readonly: false,
    },
    commentsState: {
        isActive: true,
    },
    remoteEditorsState: {
        editors: [] as RemoteEditingViewModel[],
    },
    discussionIndicatorState: {
        indicator: {
            commentCount: 0,
            hasDiscussion: false,
        } as DiscussionIndicator,
    },
    useTableDiscussionIndicator: vi.fn(),
    useFieldDiscussionIndicator: vi.fn(),
    useRelationshipDiscussionIndicator: vi.fn(
        (): DiscussionIndicator => discussionIndicatorState.indicator
    ),
    removeRelationship: vi.fn(),
    deleteElements: vi.fn(),
    openTargetDiscussion: vi.fn(),
    showSidePanel: vi.fn(),
    selectSidebarSection: vi.fn(),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        updateRelationship: vi.fn(),
        removeRelationship,
        readonly: chartDBState.readonly,
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        openTargetDiscussion,
        showSidePanel,
        selectSidebarSection,
    }),
}));

vi.mock('@/hooks/use-comments-availability', () => ({
    useCommentsAvailability: () => commentsState.isActive,
}));

vi.mock('@/hooks/use-discussion-indicators', () => ({
    useTableDiscussionIndicator,
    useFieldDiscussionIndicator,
    useRelationshipDiscussionIndicator,
}));

vi.mock('@xyflow/react', () => ({
    useReactFlow: () => ({
        deleteElements,
    }),
}));

vi.mock('@/hooks/use-focus-on', () => ({
    useFocusOn: () => ({
        focusOnRelationship: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-editing-broadcast', () => ({
    useEditingBroadcast: () => ({
        startEditing: vi.fn(),
        stopEditing: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-editing-conflict-warning', () => ({
    useEditingConflictWarning: () => ({
        message: '',
        editors: [],
        hasConflict: false,
    }),
}));

vi.mock('@/hooks/use-editing-conflict-explanation', () => ({
    useEditingConflictExplanation: () => null,
}));

vi.mock('@/hooks/use-remote-editing', () => ({
    useEntityRemoteEditing: () => remoteEditorsState.editors,
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

const relationship: DBRelationship = {
    id: 'rel-1',
    name: 'orders_clients_fk',
    sourceTableId: 'table-orders',
    targetTableId: 'table-clients',
    sourceFieldId: 'field-client-id',
    targetFieldId: 'field-id',
    sourceCardinality: 'many',
    targetCardinality: 'one',
    createdAt: 0,
};

const withDiscussion = (commentCount: number): DiscussionIndicator => ({
    commentCount,
    hasDiscussion: commentCount > 0,
});

const createRemoteEditor = (
    overrides: Partial<RemoteEditingViewModel> &
        Pick<RemoteEditingViewModel, 'userId' | 'name'>
): RemoteEditingViewModel => ({
    initials: 'AL',
    colorClass: 'bg-red-500',
    borderColorClass: 'border-red-500',
    strokeColorClass: '!stroke-red-500',
    ringColorClass: 'ring-red-500',
    isSelf: false,
    ...overrides,
});

const menuTrigger = () => screen.getByRole('button', { name: 'Actions' });

const renderHeader = (rel: DBRelationship = relationship) =>
    render(<RelationshipListItemHeader relationship={rel} />);

const openMenu = async (rel: DBRelationship = relationship) => {
    const user = userEvent.setup();
    renderHeader(rel);
    await user.click(menuTrigger());
    return user;
};

describe('RelationshipListItemHeader discussion entry', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        commentsState.isActive = true;
        remoteEditorsState.editors = [];
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        useTableDiscussionIndicator.mockClear();
        useFieldDiscussionIndicator.mockClear();
        useRelationshipDiscussionIndicator.mockClear();
        removeRelationship.mockClear();
        deleteElements.mockClear();
        openTargetDiscussion.mockClear();
        showSidePanel.mockClear();
        selectSidebarSection.mockClear();
    });

    it('exposes a translated accessible name on the dropdown trigger', async () => {
        const user = userEvent.setup();
        renderHeader();
        const trigger = menuTrigger();
        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.getByRole('menuitem', { name: 'Open discussion' })
        ).toBeInTheDocument();
        await user.keyboard('{Escape}');
    });

    it('shows Open discussion when comments are active and editable', async () => {
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: /Open discussion/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /^Delete$/i })
        ).toBeInTheDocument();
    });

    it('shows Open discussion for readonly viewers when comments are active', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: /Open discussion/i })
        ).toBeInTheDocument();
    });

    it('hides destructive delete for readonly viewers', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /^Delete$/i })
        ).not.toBeInTheDocument();
    });

    it('hides Open discussion when comments are inactive', async () => {
        commentsState.isActive = false;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /Open discussion/i })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /^Delete$/i })
        ).toBeInTheDocument();
    });

    it('does not render an empty dropdown when no action is available', () => {
        chartDBState.readonly = true;
        commentsState.isActive = false;
        renderHeader();

        expect(
            screen.queryByRole('button', { name: 'Actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls openTargetDiscussion once with the relationship target payload', async () => {
        const user = await openMenu();

        await user.click(
            screen.getByRole('menuitem', { name: /Open discussion/i })
        );

        expect(openTargetDiscussion).toHaveBeenCalledTimes(1);
        expect(openTargetDiscussion).toHaveBeenCalledWith({
            targetType: 'relationship',
            targetId: 'rel-1',
        });
        expect(showSidePanel).not.toHaveBeenCalled();
        expect(selectSidebarSection).not.toHaveBeenCalled();
    });

    it('keeps existing delete behavior unchanged', async () => {
        const user = await openMenu();

        await user.click(screen.getByRole('menuitem', { name: /^Delete$/i }));

        expect(removeRelationship).toHaveBeenCalledTimes(1);
        expect(removeRelationship).toHaveBeenCalledWith('rel-1');
        expect(deleteElements).toHaveBeenCalledWith({
            edges: [{ id: 'rel-1' }],
        });
    });

    it('does not render a badge or comment count', async () => {
        await openMenu();

        expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });

    it('exposes an accessible translated menu-item name', async () => {
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: 'Open discussion' })
        ).toBeInTheDocument();
    });

    it('viewer menu contains only Open discussion without separators', async () => {
        chartDBState.readonly = true;
        await openMenu();

        const menu = screen.getByRole('menu');
        const items = within(menu).getAllByRole('menuitem');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveAccessibleName('Open discussion');
        expect(within(menu).queryAllByRole('separator')).toHaveLength(0);
        expect(
            screen.queryByRole('menuitem', { name: /^Delete$/i })
        ).not.toBeInTheDocument();
    });

    it('editable menu separates discussion from delete', async () => {
        await openMenu();

        const menu = screen.getByRole('menu');
        const separators = within(menu).getAllByRole('separator');
        expect(separators.length).toBeGreaterThanOrEqual(1);

        const children = Array.from(menu.children);
        const roles = children.map((child) => child.getAttribute('role'));
        expect(roles[0]).not.toBe('separator');
        expect(roles[roles.length - 1]).not.toBe('separator');

        for (let i = 0; i < roles.length - 1; i += 1) {
            if (roles[i] === 'separator') {
                expect(roles[i + 1]).not.toBe('separator');
            }
        }

        const discussion = screen.getByRole('menuitem', {
            name: 'Open discussion',
        });
        const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
        expect(
            discussion.compareDocumentPosition(deleteItem) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });
});

describe('RelationshipListItemHeader discussion indicator', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        commentsState.isActive = true;
        remoteEditorsState.editors = [];
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        useTableDiscussionIndicator.mockClear();
        useFieldDiscussionIndicator.mockClear();
        useRelationshipDiscussionIndicator.mockClear();
        removeRelationship.mockClear();
        deleteElements.mockClear();
        openTargetDiscussion.mockClear();
        showSidePanel.mockClear();
        selectSidebarSection.mockClear();
    });

    it('calls useRelationshipDiscussionIndicator with the exact relationship id', () => {
        renderHeader();

        expect(useRelationshipDiscussionIndicator).toHaveBeenCalledWith(
            'rel-1'
        );
    });

    it('uses only the relationship specialized hook', () => {
        renderHeader();

        expect(useRelationshipDiscussionIndicator).toHaveBeenCalled();
        expect(useTableDiscussionIndicator).not.toHaveBeenCalled();
        expect(useFieldDiscussionIndicator).not.toHaveBeenCalled();
    });

    it('hides the indicator when the relationship hook returns the empty indicator', () => {
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderHeader();

        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('shows the indicator when hasDiscussion is true', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });

    it('hides the indicator when hasDiscussion is false even if count is positive', () => {
        discussionIndicatorState.indicator = {
            commentCount: 5,
            hasDiscussion: false,
        };
        renderHeader();

        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('does not render a numeric count even when commentCount is greater than one', () => {
        discussionIndicatorState.indicator = withDiscussion(4);
        renderHeader();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(screen.queryByText('4')).not.toBeInTheDocument();
        expect(
            within(screen.getByTestId('discussion-indicator')).queryByText(
                /\d+/
            )
        ).not.toBeInTheDocument();
    });

    it('shows the indicator for readonly viewers', () => {
        chartDBState.readonly = true;
        discussionIndicatorState.indicator = withDiscussion(2);
        renderHeader();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(menuTrigger()).toBeInTheDocument();
    });

    it('keeps the indicator visible when comments are inactive if the hook reports presence', () => {
        // Visibility is owned by the specialized hook / private index (inactive
        // providers resolve to empty). The header does not gate on write access.
        commentsState.isActive = false;
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
    });

    it('keeps the indicator visible for readonly viewers when write permissions are denied', () => {
        chartDBState.readonly = true;
        commentsState.isActive = false;
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Actions' })
        ).not.toBeInTheDocument();
    });

    it('does not show a relationship indicator when the hook stays empty for a table-partition hit', () => {
        // Partition isolation is owned by useRelationshipDiscussionIndicator /
        // getDiscussionIndicator. A table comment with the same ID must not
        // populate the relationship hook result.
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderHeader({ ...relationship, id: 'shared-id' });

        expect(useRelationshipDiscussionIndicator).toHaveBeenCalledWith(
            'shared-id'
        );
        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('does not show a relationship indicator when the hook stays empty for a field-partition hit', () => {
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        renderHeader({ ...relationship, id: 'shared-field-id' });

        expect(useRelationshipDiscussionIndicator).toHaveBeenCalledWith(
            'shared-field-id'
        );
        expect(
            screen.queryByTestId('discussion-indicator')
        ).not.toBeInTheDocument();
    });

    it('coexists with the relationship actions trigger', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(menuTrigger()).toBeInTheDocument();
    });

    it('coexists with EntityEditingBadge without overlapping controls', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        remoteEditorsState.editors = [
            createRemoteEditor({ userId: 2, name: 'Alice' }),
        ];
        renderHeader();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toBeInTheDocument();
        expect(screen.getByTitle('Alice is editing')).toBeInTheDocument();
        expect(menuTrigger()).toBeInTheDocument();

        const row = indicator.parentElement;
        expect(row).not.toBeNull();
        expect(row).toHaveClass('overflow-hidden');
        expect(indicator).toHaveClass(
            'mr-1',
            'shrink-0',
            'pointer-events-none'
        );
    });

    it('keeps Open discussion functional while the indicator is visible', async () => {
        discussionIndicatorState.indicator = withDiscussion(3);
        const user = await openMenu();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        await user.click(
            screen.getByRole('menuitem', { name: /Open discussion/i })
        );

        expect(openTargetDiscussion).toHaveBeenCalledTimes(1);
        expect(openTargetDiscussion).toHaveBeenCalledWith({
            targetType: 'relationship',
            targetId: 'rel-1',
        });
    });

    it('does not open a discussion when the decorative indicator is clicked', async () => {
        const user = userEvent.setup();
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        await user.click(screen.getByTestId('discussion-indicator'));

        expect(openTargetDiscussion).not.toHaveBeenCalled();
    });

    it('is not a button, link, or keyboard tab stop', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator.tagName).toBe('SPAN');
        expect(indicator).not.toHaveAttribute('tabindex');
        expect(indicator).not.toHaveAttribute('role');
        expect(indicator).not.toHaveAttribute('href');
    });

    it('does not render raw relationship ids or badge count text', () => {
        discussionIndicatorState.indicator = withDiscussion(2);
        renderHeader();

        expect(screen.queryByText('rel-1')).not.toBeInTheDocument();
        expect(
            within(screen.getByTestId('discussion-indicator')).queryByText('2')
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });

    it('marks the indicator decorative for assistive technology', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toHaveAttribute('aria-hidden', 'true');
        expect(indicator).not.toHaveAttribute('tabindex');
        expect(indicator.tagName).toBe('SPAN');
    });

    it('keeps shrink-0 and pointer-events-none for narrow and mobile layouts', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        const indicator = screen.getByTestId('discussion-indicator');
        expect(indicator).toHaveClass(
            'shrink-0',
            'pointer-events-none',
            'mr-1'
        );

        const identity = screen.getByText('orders_clients_fk');
        expect(identity).toHaveClass('truncate');
        expect(identity.parentElement).toHaveClass('min-w-0', 'flex-1');
    });

    it('preserves readonly menu behavior while the indicator is visible', async () => {
        chartDBState.readonly = true;
        discussionIndicatorState.indicator = withDiscussion(1);
        await openMenu();

        expect(screen.getByTestId('discussion-indicator')).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: 'Open discussion' })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: /^Delete$/i })
        ).not.toBeInTheDocument();
    });

    it('preserves delete behavior while the indicator is visible', async () => {
        discussionIndicatorState.indicator = withDiscussion(2);
        const user = await openMenu();

        await user.click(screen.getByRole('menuitem', { name: /^Delete$/i }));

        expect(removeRelationship).toHaveBeenCalledWith('rel-1');
        expect(deleteElements).toHaveBeenCalledWith({
            edges: [{ id: 'rel-1' }],
        });
    });

    it('preserves separator structure while the indicator is visible', async () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        await openMenu();

        const menu = screen.getByRole('menu');
        const separators = within(menu).getAllByRole('separator');
        expect(separators.length).toBeGreaterThanOrEqual(1);

        const discussion = screen.getByRole('menuitem', {
            name: 'Open discussion',
        });
        const deleteItem = screen.getByRole('menuitem', { name: 'Delete' });
        expect(
            discussion.compareDocumentPosition(deleteItem) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });
});

describe('RelationshipListItemHeader legacy actions', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        commentsState.isActive = true;
        remoteEditorsState.editors = [];
        discussionIndicatorState.indicator = EMPTY_DISCUSSION_INDICATOR;
        useRelationshipDiscussionIndicator.mockClear();
        removeRelationship.mockClear();
        deleteElements.mockClear();
        openTargetDiscussion.mockClear();
    });

    it('keeps relationship identity truncation and control shrink classes intact', () => {
        discussionIndicatorState.indicator = withDiscussion(1);
        renderHeader();

        const identity = screen.getByText('orders_clients_fk');
        expect(identity).toHaveClass('truncate');
        expect(identity.parentElement).toHaveClass('min-w-0', 'flex-1');
        expect(screen.getByTestId('discussion-indicator')).toHaveClass(
            'shrink-0'
        );
    });

    it('keeps mobile-safe overflow and hover action classes intact', () => {
        renderHeader();

        const identity = screen.getByText('orders_clients_fk');
        const row = identity.closest('.overflow-hidden');
        expect(row).not.toBeNull();
        expect(row).toHaveClass(
            'group',
            'flex',
            'items-center',
            'justify-between',
            'overflow-hidden'
        );

        const hoverActions = row?.querySelector(
            '.md\\:hidden.md\\:group-hover\\:flex'
        );
        expect(hoverActions).not.toBeNull();
    });
});
