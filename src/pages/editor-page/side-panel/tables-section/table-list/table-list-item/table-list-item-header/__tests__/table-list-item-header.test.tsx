import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DBTable } from '@/lib/domain/db-table';
import { en } from '@/i18n/locales/en';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { TableListItemHeader } from '../table-list-item-header';

const {
    chartDBState,
    commentsState,
    createField,
    createIndex,
    removeTable,
    createTable,
    openTableSchemaDialog,
    openTargetDiscussion,
    showSidePanel,
    selectSidebarSection,
} = vi.hoisted(() => ({
    chartDBState: {
        readonly: false,
        schemas: [] as Array<{ id: string; name: string }>,
        databaseType: 'sqlite' as string,
    },
    commentsState: {
        isActive: true,
    },
    createField: vi.fn(),
    createIndex: vi.fn(),
    removeTable: vi.fn(),
    createTable: vi.fn(),
    openTableSchemaDialog: vi.fn(),
    openTargetDiscussion: vi.fn(),
    showSidePanel: vi.fn(),
    selectSidebarSection: vi.fn(),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        updateTable: vi.fn(),
        updateTablesState: vi.fn(),
        removeTable,
        createIndex,
        createField,
        createTable,
        schemas: chartDBState.schemas,
        databaseType: chartDBState.databaseType as DatabaseType,
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

vi.mock('@/hooks/use-editing-broadcast', () => ({
    useEditingBroadcast: () => ({
        startEditing: vi.fn(),
        stopEditing: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-focus-on', () => ({
    useFocusOn: () => ({
        focusOnTable: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openTableSchemaDialog,
    }),
}));

vi.mock('@/context/diagram-filter-context/use-diagram-filter', () => ({
    useDiagramFilter: () => ({
        schemasDisplayed: [],
    }),
}));

vi.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        listeners: {},
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

const baseTable: DBTable = {
    id: 'table-1',
    name: 'Clients',
    x: 10,
    y: 20,
    fields: [],
    indexes: [],
    color: '#fff',
    isView: false,
    createdAt: 0,
};

const renderHeader = (table: DBTable = baseTable) =>
    render(
        <TooltipProvider>
            <TableListItemHeader table={table} />
        </TooltipProvider>
    );

const menuTrigger = () => screen.getByRole('button', { name: 'Table Actions' });

const openMenu = async (table: DBTable = baseTable) => {
    const user = userEvent.setup();
    renderHeader(table);
    await user.click(menuTrigger());
    return user;
};

describe('TableListItemHeader discussion entry', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        chartDBState.schemas = [];
        chartDBState.databaseType = DatabaseType.SQLITE;
        commentsState.isActive = true;
        createField.mockClear();
        createIndex.mockClear();
        removeTable.mockClear();
        createTable.mockClear();
        openTableSchemaDialog.mockClear();
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

    it('shows Open discussion when comments are active and the table is editable', async () => {
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: /Open discussion/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /Add Field/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /Delete Table/i })
        ).toBeInTheDocument();
    });

    it('shows Open discussion for readonly viewers when comments are active', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: /Open discussion/i })
        ).toBeInTheDocument();
    });

    it('hides edit and destructive actions for readonly viewers', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /Add Field/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: /Add Index/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: /Duplicate Table/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: /Delete Table/i })
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: /Change Schema/i })
        ).not.toBeInTheDocument();
    });

    it('hides Open discussion when comments are inactive', async () => {
        commentsState.isActive = false;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /Open discussion/i })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /Add Field/i })
        ).toBeInTheDocument();
    });

    it('does not render an empty dropdown when readonly and comments are inactive', () => {
        chartDBState.readonly = true;
        commentsState.isActive = false;
        renderHeader();

        expect(
            screen.queryByRole('button', { name: 'Table Actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls openTargetDiscussion once with the table target payload', async () => {
        const user = await openMenu();

        await user.click(
            screen.getByRole('menuitem', { name: /Open discussion/i })
        );

        expect(openTargetDiscussion).toHaveBeenCalledTimes(1);
        expect(openTargetDiscussion).toHaveBeenCalledWith({
            targetType: 'table',
            targetId: 'table-1',
        });
        expect(showSidePanel).not.toHaveBeenCalled();
        expect(selectSidebarSection).not.toHaveBeenCalled();
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
    });

    it('editable menu separates discussion from destructive actions', async () => {
        await openMenu();

        const menu = screen.getByRole('menu');
        const separators = within(menu).getAllByRole('separator');
        expect(separators.length).toBeGreaterThanOrEqual(2);

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
        const deleteItem = screen.getByRole('menuitem', {
            name: 'Delete Table',
        });
        expect(
            discussion.compareDocumentPosition(deleteItem) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });
});

describe('TableListItemHeader legacy actions', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        chartDBState.schemas = [];
        chartDBState.databaseType = DatabaseType.SQLITE;
        commentsState.isActive = true;
        createField.mockClear();
        createIndex.mockClear();
        removeTable.mockClear();
        createTable.mockClear();
        openTableSchemaDialog.mockClear();
        openTargetDiscussion.mockClear();
    });

    it('shows Change Schema when schema conditions are met and opens the dialog once', async () => {
        chartDBState.databaseType = DatabaseType.POSTGRESQL;
        const user = await openMenu();

        await user.click(
            screen.getByRole('menuitem', { name: /Change Schema/i })
        );

        expect(openTableSchemaDialog).toHaveBeenCalledTimes(1);
        expect(openTableSchemaDialog).toHaveBeenCalledWith(
            expect.objectContaining({
                table: baseTable,
                allowSchemaCreation: true,
            })
        );
    });

    it('hides Change Schema when schema conditions are not met', async () => {
        chartDBState.databaseType = DatabaseType.SQLITE;
        chartDBState.schemas = [];
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /Change Schema/i })
        ).not.toBeInTheDocument();
    });

    it('hides Change Schema for readonly users even when schema DBs apply', async () => {
        chartDBState.readonly = true;
        chartDBState.databaseType = DatabaseType.POSTGRESQL;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /Change Schema/i })
        ).not.toBeInTheDocument();
    });

    it('invokes createField with the table id', async () => {
        const user = await openMenu();

        await user.click(screen.getByRole('menuitem', { name: /Add Field/i }));
        expect(createField).toHaveBeenCalledTimes(1);
        expect(createField).toHaveBeenCalledWith('table-1');
    });

    it('invokes createIndex with the table id for a normal table', async () => {
        const user = await openMenu();

        await user.click(screen.getByRole('menuitem', { name: /Add Index/i }));
        expect(createIndex).toHaveBeenCalledTimes(1);
        expect(createIndex).toHaveBeenCalledWith('table-1');
    });

    it('hides Add Index for view tables', async () => {
        await openMenu({ ...baseTable, isView: true });

        expect(
            screen.queryByRole('menuitem', { name: /Add Index/i })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /Add Field/i })
        ).toBeInTheDocument();
    });

    it('duplicates the table with copy suffix and coordinate offset', async () => {
        const user = await openMenu();

        await user.click(
            screen.getByRole('menuitem', { name: /Duplicate Table/i })
        );

        expect(createTable).toHaveBeenCalledTimes(1);
        const cloned = createTable.mock.calls[0][0] as DBTable;
        expect(cloned.id).not.toBe(baseTable.id);
        expect(cloned.name).toBe('Clients_copy');
        expect(cloned.x).toBe(baseTable.x + 30);
        expect(cloned.y).toBe(baseTable.y + 50);
    });

    it('invokes removeTable with the table id', async () => {
        const user = await openMenu();

        await user.click(
            screen.getByRole('menuitem', { name: /Delete Table/i })
        );
        expect(removeTable).toHaveBeenCalledTimes(1);
        expect(removeTable).toHaveBeenCalledWith('table-1');
    });

    it('hides Delete Table for readonly users', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /Delete Table/i })
        ).not.toBeInTheDocument();
    });
});
