import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DBField } from '@/lib/domain/db-field';
import { TableNodeField } from '../table-node-field';
import { TooltipProvider } from '@/components/tooltip/tooltip';

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        relationships: [],
        readonly: true,
        highlightedCustomType: null,
        databaseType: 'postgresql',
    }),
}));

vi.mock('@/context/diff-context/use-diff', () => ({
    useDiff: () => ({
        checkIfFieldRemoved: () => false,
        checkIfNewField: () => false,
        getFieldNewName: () => null,
        getFieldNewType: () => null,
        getFieldNewNullable: () => null,
        getFieldNewPrimaryKey: () => null,
        getFieldNewCharacterMaximumLength: () => null,
        getFieldNewPrecision: () => null,
        getFieldNewScale: () => null,
        getFieldNewIsArray: () => null,
        checkIfFieldHasChange: () => false,
        isSummaryOnly: false,
    }),
}));

vi.mock('@/hooks/use-local-config', () => ({
    useLocalConfig: () => ({ showFieldAttributes: true }),
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        closeAllTablesInSidebar: vi.fn(),
        setEditTableModeTable: vi.fn(),
        visualExportCaptureActive: false,
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({ closeAllTablesInSidebar: vi.fn() }),
}));

vi.mock('@/hooks/use-remote-editing', () => ({
    useEntityRemoteEditing: () => [],
}));

vi.mock('@/hooks/use-conversations-availability', () => ({
    useConversationsAvailability: () => false,
}));

vi.mock('@xyflow/react', () => ({
    Handle: () => null,
    Position: { Left: 'left', Right: 'right' },
    useConnection: () => ({
        inProgress: false,
        fromNode: { id: 'other' },
        fromHandle: { id: '' },
    }),
    useUpdateNodeInternals: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const baseField: DBField = {
    id: 'f1',
    name: 'email',
    type: { id: 'varchar', name: 'varchar' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
};

const renderField = (
    mergePreviewChange?: 'add' | 'modify' | 'rename' | 'delete'
) =>
    render(
        <TooltipProvider>
            <TableNodeField
                tableNodeId="t1"
                field={baseField}
                focused={false}
                highlighted={false}
                visible={true}
                isConnectable={false}
                mergePreviewChange={mergePreviewChange}
            />
        </TooltipProvider>
    );

describe('TableNodeField merge preview', () => {
    afterEach(() => cleanup());

    it('renders normally without merge metadata', () => {
        renderField();
        expect(screen.getByText('email')).toBeInTheDocument();
        expect(document.querySelector('[data-merge-change]')).toBeNull();
    });

    it.each([
        ['add', 'merge_wizard.result.change.add'],
        ['modify', 'merge_wizard.result.change.modify'],
        ['rename', 'merge_wizard.result.change.rename'],
        ['delete', 'merge_wizard.result.change.delete'],
    ] as const)('shows accessible indicator for %s', (change, labelKey) => {
        renderField(change);
        expect(screen.getByLabelText(labelKey)).toBeInTheDocument();
        expect(
            document.querySelector(`[data-merge-change="${change}"]`)
        ).toBeTruthy();
        expect(screen.getByText('email')).toBeInTheDocument();
    });
});
