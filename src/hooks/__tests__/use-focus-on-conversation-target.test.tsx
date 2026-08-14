import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { useFocusOnConversationTarget } from '@/hooks/use-focus-on-conversation-target';

const focusOnTable = vi.fn();
const focusOnRelationship = vi.fn();
const setEditTableModeTable = vi.fn();
const closeAllTablesInSidebar = vi.fn();

const chartDbState = {
    tables: [
        {
            id: 'table-1',
            name: 'Clients',
            x: 0,
            y: 0,
            fields: [{ id: 'field-1', name: 'email' }],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 0,
        },
    ],
    relationships: [
        {
            id: 'rel-1',
            name: 'clients_orders',
            sourceTableId: 'table-1',
            targetTableId: 'table-2',
            sourceFieldId: 'field-1',
            targetFieldId: 'field-2',
            sourceCardinality: 'one' as const,
            targetCardinality: 'many' as const,
            createdAt: 0,
        },
    ],
};

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => chartDbState,
}));

vi.mock('@/hooks/use-focus-on', () => ({
    useFocusOn: () => ({
        focusOnTable,
        focusOnRelationship,
    }),
}));

vi.mock('@/hooks/use-canvas', () => ({
    useCanvas: () => ({
        setEditTableModeTable,
    }),
}));

vi.mock('@/hooks/use-layout', () => ({
    useLayout: () => ({
        closeAllTablesInSidebar,
    }),
}));

const buildConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 10,
    diagramId: 42,
    targetType: 'table',
    targetId: 'table-1',
    status: 'active',
    archivedAt: null,
    messageCount: 1,
    lastMessageAt: null,
    lastMessageBody: null,
    lastMessageAuthor: null,
    unreadCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
});

describe('useFocusOnConversationTarget', () => {
    beforeEach(() => {
        focusOnTable.mockReset();
        focusOnRelationship.mockReset();
        setEditTableModeTable.mockReset();
        closeAllTablesInSidebar.mockReset();
    });

    it('disables focus for diagram conversations', () => {
        const { result } = renderHook(() =>
            useFocusOnConversationTarget(
                buildConversation({
                    targetType: 'diagram',
                    targetId: null,
                })
            )
        );

        expect(result.current.canFocusOnTarget).toBe(false);
    });

    it('focuses a table target on the diagram', () => {
        const conversation = buildConversation();
        const { result } = renderHook(() =>
            useFocusOnConversationTarget(conversation)
        );

        result.current.focusOnTarget();

        expect(focusOnTable).toHaveBeenCalledWith('table-1');
    });

    it('focuses a field target on the diagram and opens table edit mode', () => {
        const conversation = buildConversation({
            targetType: 'field',
            targetId: 'field-1',
        });
        const { result } = renderHook(() =>
            useFocusOnConversationTarget(conversation)
        );

        result.current.focusOnTarget();

        expect(focusOnTable).toHaveBeenCalledWith('table-1');
        expect(closeAllTablesInSidebar).toHaveBeenCalled();
        expect(setEditTableModeTable).toHaveBeenCalledWith({
            tableId: 'table-1',
            fieldId: 'field-1',
        });
    });

    it('focuses a relationship target on the diagram', () => {
        const conversation = buildConversation({
            targetType: 'relationship',
            targetId: 'rel-1',
        });
        const { result } = renderHook(() =>
            useFocusOnConversationTarget(conversation)
        );

        result.current.focusOnTarget();

        expect(focusOnRelationship).toHaveBeenCalledWith(
            'rel-1',
            'table-1',
            'table-2'
        );
    });
});
