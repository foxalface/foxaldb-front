import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DBRelationship } from '@/lib/domain/db-relationship';
import { en } from '@/i18n/locales/en';
import { RelationshipListItemHeader } from '../relationship-list-item-header';

const {
    chartDBState,
    commentsState,
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
    useEntityRemoteEditing: () => [],
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

const menuTrigger = () => screen.getByRole('button', { name: 'Actions' });

const openMenu = async () => {
    const user = userEvent.setup();
    render(<RelationshipListItemHeader relationship={relationship} />);
    await user.click(menuTrigger());
    return user;
};

describe('RelationshipListItemHeader discussion entry', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        commentsState.isActive = true;
        removeRelationship.mockClear();
        deleteElements.mockClear();
        openTargetDiscussion.mockClear();
        showSidePanel.mockClear();
        selectSidebarSection.mockClear();
    });

    it('exposes a translated accessible name on the dropdown trigger', async () => {
        const user = userEvent.setup();
        render(<RelationshipListItemHeader relationship={relationship} />);
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
        render(<RelationshipListItemHeader relationship={relationship} />);

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
