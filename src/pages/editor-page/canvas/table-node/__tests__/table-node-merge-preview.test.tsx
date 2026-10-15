import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import type { NodeProps } from '@xyflow/react';
import type { TableNodeType } from '../table-node';

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => false,
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        updateTable: vi.fn(),
        relationships: [],
        readonly: true,
        dependencies: [],
        highlightedCustomType: null,
        databaseType: 'postgresql',
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        openTableFromSidebar: vi.fn(),
        selectSidebarSection: vi.fn(),
        closeAllTablesInSidebar: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        setEditTableModeTable: vi.fn(),
        editTableModeTable: null,
        setHoveringTableId: vi.fn(),
        showCreateRelationshipNode: vi.fn(),
        tempFloatingEdge: null,
        visualExportCaptureActive: false,
    }),
}));

vi.mock('@/hooks/use-remote-selections', () => ({
    useEntityRemoteSelections: () => [],
}));

vi.mock('@/hooks/use-remote-editing', () => ({
    useEntityRemoteEditing: () => [],
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        getTableNewName: () => null,
        getTableNewColor: () => null,
        checkIfTableHasChange: () => false,
        checkIfNewTable: () => false,
        checkIfTableRemoved: () => false,
        isSummaryOnly: false,
    }),
}));

vi.mock('../table-node-context-menu', () => ({
    TableNodeContextMenu: ({ children }: { children: React.ReactNode }) =>
        children,
}));

vi.mock('../table-edit-mode/table-edit-mode', () => ({
    TableEditMode: () => null,
}));

vi.mock('../table-node-field', () => ({
    TableNodeField: ({
        mergePreviewChange,
        field,
    }: {
        mergePreviewChange?: string;
        field: DBField;
    }) => (
        <div
            data-testid={`field-${field.id}`}
            {...(mergePreviewChange
                ? { 'data-merge-change': mergePreviewChange }
                : {})}
        >
            {field.name}
        </div>
    ),
}));

vi.mock('../table-node-dependency-indicator', () => ({
    TableNodeDependencyIndicator: () => null,
}));

vi.mock('@xyflow/react', () => ({
    NodeResizer: () => null,
    Handle: () => null,
    Position: { Top: 'top' },
    useConnection: () => ({
        inProgress: false,
        fromNode: { id: '' },
        fromHandle: { id: '' },
    }),
    useStore: (selector: (store: { edges: unknown[] }) => unknown) =>
        selector({ edges: [] }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

import { TableNode } from '../table-node';
import { TooltipProvider } from '@/components/tooltip/tooltip';

const field = (id: string, name: string): DBField => ({
    id,
    name,
    type: { id: 'varchar', name: 'varchar' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
});

const table = (overrides: Partial<DBTable> = {}): DBTable => ({
    id: 't1',
    name: 'users',
    schema: 'public',
    x: 0,
    y: 0,
    fields: [field('f1', 'email')],
    indexes: [],
    color: '#ff00aa',
    isView: false,
    createdAt: 0,
    expanded: true,
    ...overrides,
});

const renderNode = (data: TableNodeType['data']) => {
    const props = {
        id: data.table.id,
        type: 'table',
        dragging: false,
        selected: false,
        data,
    } as NodeProps<TableNodeType>;

    return render(
        <TooltipProvider>
            <TableNode {...props} />
        </TooltipProvider>
    );
};

describe('TableNode merge preview decorations', () => {
    afterEach(() => cleanup());

    it('renders without merge metadata unchanged', () => {
        renderNode({ table: table(), isOverlapping: false });
        expect(screen.queryByLabelText(/merge_wizard/)).toBeNull();
        expect(document.querySelector('[data-merge-change]')).toBeNull();
    });

    it('applies add semantics with icon and data attribute', () => {
        renderNode({
            table: table(),
            isOverlapping: false,
            mergePreview: [
                {
                    entityKind: 'table',
                    entityId: 't1',
                    change: 'add',
                    operationId: 'op-table-add',
                },
            ],
        });
        const root = document.querySelector('[data-merge-change="add"]');
        expect(root).toBeTruthy();
        expect(
            screen.getByLabelText('merge_wizard.result.change.add')
        ).toBeInTheDocument();
    });

    it('keeps user table color strip', () => {
        const { container } = renderNode({
            table: table({ color: '#ff00aa' }),
            isOverlapping: false,
            mergePreview: [
                {
                    entityKind: 'table',
                    entityId: 't1',
                    change: 'modify',
                    operationId: 'op-table-mod',
                },
            ],
        });
        const strip = container.querySelector<HTMLElement>(
            '[style*="background-color"]'
        );
        expect(strip?.style.backgroundColor).toBeTruthy();
        expect(strip?.style.backgroundColor).not.toBe('');
    });

    it('suppresses field decorations when table is deleted', () => {
        renderNode({
            table: table(),
            isOverlapping: false,
            mergePreview: [
                {
                    entityKind: 'table',
                    entityId: 't1',
                    change: 'delete',
                    operationId: 'op-table-del',
                },
                {
                    entityKind: 'field',
                    entityId: 'f1',
                    change: 'delete',
                    operationId: 'op-field-del',
                },
            ],
        });
        expect(
            screen.getByTestId('field-f1').getAttribute('data-merge-change')
        ).toBeNull();
        expect(screen.getByText('email')).toBeInTheDocument();
    });

    it('passes field decoration when table is not deleted', () => {
        renderNode({
            table: table(),
            isOverlapping: false,
            mergePreview: [
                {
                    entityKind: 'field',
                    entityId: 'f1',
                    change: 'rename',
                    operationId: 'op-field-rename',
                },
            ],
        });
        expect(screen.getByTestId('field-f1')).toHaveAttribute(
            'data-merge-change',
            'rename'
        );
    });

    it('applies view semantics the same as tables', () => {
        renderNode({
            table: table({ isView: true, name: 'active_users' }),
            isOverlapping: false,
            mergePreview: [
                {
                    entityKind: 'table',
                    entityId: 't1',
                    change: 'add',
                    operationId: 'op-table-add',
                },
            ],
        });
        expect(screen.getByText('active_users')).toBeInTheDocument();
        expect(
            screen.getByLabelText('merge_wizard.result.change.add')
        ).toBeInTheDocument();
    });
});
