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
    conversationsState,
    conversationMenuState,
    useTargetConversationMenuAction,
    createField,
    createIndex,
    removeTable,
    createTable,
    openTableSchemaDialog,
} = vi.hoisted(() => ({
    chartDBState: {
        readonly: false,
        schemas: [] as Array<{ id: string; name: string }>,
        databaseType: 'sqlite' as string,
    },
    conversationsState: {
        isAvailable: true,
    },
    conversationMenuState: {
        showConversationAction: true,
        conversationLabel: 'Open conversation',
        isConversationPending: false,
        openConversationAction: vi.fn(),
    },
    useTargetConversationMenuAction: vi.fn(() => ({
        showConversationAction:
            conversationsState.isAvailable &&
            conversationMenuState.showConversationAction,
        conversationLabel: conversationMenuState.conversationLabel,
        isConversationPending: conversationMenuState.isConversationPending,
        openConversationAction: conversationMenuState.openConversationAction,
    })),
    createField: vi.fn(),
    createIndex: vi.fn(),
    removeTable: vi.fn(),
    createTable: vi.fn(),
    openTableSchemaDialog: vi.fn(),
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

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => conversationsState.isAvailable,
}));

vi.mock('@/hooks/use-target-conversation-menu-action', () => ({
    useTargetConversationMenuAction,
}));

vi.mock('@/components/conversation-indicator/conversation-indicator', () => ({
    ConversationIndicator: ({
        target,
        targetName,
        className,
    }: {
        target: { targetType: string; targetId: string };
        targetName: string;
        className?: string;
    }) => (
        <span
            data-testid="conversation-indicator"
            data-target-type={target.targetType}
            data-target-id={target.targetId}
            data-target-name={targetName}
            className={className}
        />
    ),
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

describe('TableListItemHeader conversation entry', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        chartDBState.schemas = [];
        chartDBState.databaseType = DatabaseType.SQLITE;
        conversationsState.isAvailable = true;
        conversationMenuState.showConversationAction = true;
        conversationMenuState.conversationLabel = 'Open conversation';
        conversationMenuState.isConversationPending = false;
        useTargetConversationMenuAction.mockClear();
        conversationMenuState.openConversationAction.mockClear();
        createField.mockClear();
        createIndex.mockClear();
        removeTable.mockClear();
        createTable.mockClear();
        openTableSchemaDialog.mockClear();
    });

    it('calls useTargetConversationMenuAction with the table target', () => {
        renderHeader();

        expect(useTargetConversationMenuAction).toHaveBeenCalledWith({
            targetType: 'table',
            targetId: 'table-1',
        });
    });

    it('exposes a translated accessible name on the dropdown trigger', async () => {
        const user = userEvent.setup();
        renderHeader();
        const trigger = menuTrigger();
        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.getByRole('menuitem', { name: 'Open conversation' })
        ).toBeInTheDocument();
        await user.keyboard('{Escape}');
    });

    it('shows Open conversation when conversations are available and the table is editable', async () => {
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: /Open conversation/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /Add Field/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /Delete Table/i })
        ).toBeInTheDocument();
    });

    it('shows Open conversation for readonly viewers when conversations are available', async () => {
        chartDBState.readonly = true;
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: /Open conversation/i })
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

    it('hides Open conversation when the menu action is unavailable', async () => {
        conversationMenuState.showConversationAction = false;
        await openMenu();

        expect(
            screen.queryByRole('menuitem', { name: /Open conversation/i })
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('menuitem', { name: /Add Field/i })
        ).toBeInTheDocument();
    });

    it('does not render an empty dropdown when readonly and conversations are unavailable', () => {
        chartDBState.readonly = true;
        conversationsState.isAvailable = false;
        conversationMenuState.showConversationAction = false;
        renderHeader();

        expect(
            screen.queryByRole('button', { name: 'Table Actions' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('calls openConversationAction once when the menu item is selected', async () => {
        const user = await openMenu();

        await user.click(
            screen.getByRole('menuitem', { name: /Open conversation/i })
        );

        expect(
            conversationMenuState.openConversationAction
        ).toHaveBeenCalledTimes(1);
    });

    it('does not render a badge or comment count', async () => {
        await openMenu();

        expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });

    it('exposes an accessible translated menu-item name', async () => {
        await openMenu();

        expect(
            screen.getByRole('menuitem', { name: 'Open conversation' })
        ).toBeInTheDocument();
    });

    it('viewer menu contains only Open conversation without separators', async () => {
        chartDBState.readonly = true;
        await openMenu();

        const menu = screen.getByRole('menu');
        const items = within(menu).getAllByRole('menuitem');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveAccessibleName('Open conversation');
        expect(within(menu).queryAllByRole('separator')).toHaveLength(0);
    });

    it('editable menu separates conversation from destructive actions', async () => {
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

        const conversation = screen.getByRole('menuitem', {
            name: 'Open conversation',
        });
        const deleteItem = screen.getByRole('menuitem', {
            name: 'Delete Table',
        });
        expect(
            conversation.compareDocumentPosition(deleteItem) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });
});

describe('TableListItemHeader conversation indicator', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        conversationsState.isAvailable = true;
        conversationMenuState.showConversationAction = true;
        useTargetConversationMenuAction.mockClear();
    });

    it('renders ConversationIndicator when conversations are available', () => {
        renderHeader();

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toHaveAttribute('data-target-type', 'table');
        expect(indicator).toHaveAttribute('data-target-id', 'table-1');
        expect(indicator).toHaveAttribute('data-target-name', 'Clients');
        const actions = indicator.closest('.md\\:group-hover\\:flex');
        expect(actions).not.toBeNull();
        expect(actions).toHaveClass('flex', 'items-center');
    });

    it('hides ConversationIndicator when conversations are unavailable', () => {
        conversationsState.isAvailable = false;
        renderHeader();

        expect(
            screen.queryByTestId('conversation-indicator')
        ).not.toBeInTheDocument();
    });

    it('passes the table target to ConversationIndicator for another table id', () => {
        renderHeader({ ...baseTable, id: 'table-99', name: 'Orders' });

        const indicator = screen.getByTestId('conversation-indicator');
        expect(indicator).toHaveAttribute('data-target-id', 'table-99');
        expect(indicator).toHaveAttribute('data-target-name', 'Orders');
    });

    it('shows the indicator for readonly viewers when conversations are available', () => {
        chartDBState.readonly = true;
        renderHeader();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(menuTrigger()).toBeInTheDocument();
    });

    it('coexists with the table actions trigger', () => {
        renderHeader();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        expect(menuTrigger()).toBeInTheDocument();
    });

    it('keeps Open conversation functional while the indicator is visible', async () => {
        const user = await openMenu();

        expect(
            screen.getByTestId('conversation-indicator')
        ).toBeInTheDocument();
        await user.click(
            screen.getByRole('menuitem', { name: /Open conversation/i })
        );

        expect(
            conversationMenuState.openConversationAction
        ).toHaveBeenCalledTimes(1);
    });

    it('does not render raw target ids or badge count text', () => {
        renderHeader();

        expect(screen.queryByText('table-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId(/badge|count/i)).not.toBeInTheDocument();
    });
});

describe('TableListItemHeader legacy actions', () => {
    beforeEach(() => {
        chartDBState.readonly = false;
        chartDBState.schemas = [];
        chartDBState.databaseType = DatabaseType.SQLITE;
        conversationsState.isAvailable = true;
        conversationMenuState.showConversationAction = true;
        createField.mockClear();
        createIndex.mockClear();
        removeTable.mockClear();
        createTable.mockClear();
        openTableSchemaDialog.mockClear();
        conversationMenuState.openConversationAction.mockClear();
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
