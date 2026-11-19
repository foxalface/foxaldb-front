import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DBTable } from '@/lib/domain/db-table';
import { en } from '@/i18n/locales/en';
import { TableNodeContextMenu } from '../table-node-context-menu';

vi.mock('@/components/tag-selector/tag-selector', () => ({
    TagSelector: ({
        targetType,
        targetId,
    }: {
        targetType: string;
        targetId: string;
    }) => (
        <div
            data-testid="tag-selector"
            data-target-type={targetType}
            data-target-id={targetId}
        />
    ),
}));

vi.mock('@/hooks/use-breakpoint', () => ({
    useBreakpoint: () => ({ isMd: true }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        removeTable: vi.fn(),
        readonly: false,
        createTable: vi.fn(),
        createArea: vi.fn(),
        areas: [],
        tables: [],
        relationships: [],
        updateArea: vi.fn(),
        updateTablesState: vi.fn(),
        tagAssignments: [],
        addTagAssignments: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        closeAllTablesInSidebar: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        setEditTableModeTable: vi.fn(),
        startFloatingEdgeCreation: vi.fn(),
    }),
}));

vi.mock('@xyflow/react', () => ({
    useReactFlow: () => ({
        getNodes: () => [],
    }),
    useStore: (selector: (state: { nodes: [] }) => unknown) =>
        selector({ nodes: [] }),
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

const table: DBTable = {
    id: 'table-1',
    name: 'Clients',
    x: 0,
    y: 0,
    fields: [],
    indexes: [],
    color: '#fff',
    isView: false,
    createdAt: 0,
};

describe('TableNodeContextMenu tags', () => {
    it('opens tag assignment for the right-clicked table', async () => {
        const user = userEvent.setup();
        render(
            <TableNodeContextMenu table={table}>
                <button type="button">Clients</button>
            </TableNodeContextMenu>
        );

        await user.pointer({
            keys: '[MouseRight]',
            target: screen.getByRole('button', { name: 'Clients' }),
        });
        await user.click(screen.getByRole('menuitem', { name: 'Tags' }));

        expect(screen.getByTestId('tag-selector')).toHaveAttribute(
            'data-target-type',
            'table'
        );
        expect(screen.getByTestId('tag-selector')).toHaveAttribute(
            'data-target-id',
            'table-1'
        );
    });
});
