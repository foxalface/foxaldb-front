import { describe, expect, it, vi } from 'vitest';
import type { TFunction } from 'i18next';
import type { DiagramConversation } from '@/lib/conversations/conversation-types';
import { resolveConversationTargetLabel } from '../resolve-conversation-target-label';

const t = vi.fn((key: string, options?: Record<string, string>) => {
    if (options) {
        return `${key}:${JSON.stringify(options)}`;
    }

    return key;
}) as unknown as TFunction;

const baseConversation = (
    overrides: Partial<DiagramConversation> = {}
): DiagramConversation => ({
    id: 1,
    diagramId: 42,
    targetType: 'table',
    targetId: 'table-1',
    status: 'active',
    archivedAt: null,
    messageCount: 0,
    lastMessageAt: null,
    lastMessageBody: null,
    lastMessageAuthor: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
});

describe('resolveConversationTargetLabel', () => {
    const tables = [
        {
            id: 'table-1',
            name: 'Clients',
            x: 0,
            y: 0,
            fields: [
                {
                    id: 'field-1',
                    name: 'email',
                    type: { id: 'text', name: 'text' },
                    primaryKey: false,
                    unique: false,
                    nullable: true,
                    createdAt: 0,
                },
            ],
            indexes: [],
            color: '#fff',
            isView: false,
            createdAt: 0,
        },
    ];

    const relationships = [
        {
            id: 'rel-1',
            name: 'orders_fk',
            sourceTableId: 'table-1',
            targetTableId: 'table-1',
            sourceFieldId: 'field-1',
            targetFieldId: 'field-1',
            sourceCardinality: 'one' as const,
            targetCardinality: 'one' as const,
            createdAt: 0,
        },
    ];

    it('uses the diagram name when available', () => {
        const result = resolveConversationTargetLabel(
            baseConversation({
                targetType: 'diagram',
                targetId: null,
            }),
            {
                diagramName: 'Billing',
                tables,
                relationships,
                t,
            }
        );

        expect(result.title).toBe('Billing');
        expect(result.isMissing).toBe(false);
    });

    it('falls back to a localized diagram label when the diagram name is missing', () => {
        const result = resolveConversationTargetLabel(
            baseConversation({
                targetType: 'diagram',
                targetId: null,
            }),
            {
                diagramName: null,
                tables,
                relationships,
                t,
            }
        );

        expect(result.title).toBe(
            'side_panel.conversations_section.target_labels.diagram'
        );
    });

    it('returns a missing table fallback when the table no longer exists', () => {
        const result = resolveConversationTargetLabel(
            baseConversation({
                targetType: 'table',
                targetId: 'missing-table',
            }),
            {
                diagramName: 'Billing',
                tables,
                relationships,
                t,
            }
        );

        expect(result.isMissing).toBe(true);
        expect(result.title).toBe(
            'side_panel.conversations_section.target_labels.missing_table'
        );
    });

    it('returns a field label with table context', () => {
        const result = resolveConversationTargetLabel(
            baseConversation({
                targetType: 'field',
                targetId: 'field-1',
            }),
            {
                diagramName: 'Billing',
                tables,
                relationships,
                t,
            }
        );

        expect(result.title).toContain('Clients');
        expect(result.title).toContain('email');
    });

    it('returns relationship endpoints when the relationship has no name', () => {
        const result = resolveConversationTargetLabel(
            baseConversation({
                targetType: 'relationship',
                targetId: 'rel-1',
            }),
            {
                diagramName: 'Billing',
                tables,
                relationships: [{ ...relationships[0], name: '   ' }],
                t,
            }
        );

        expect(result.title).toContain('Clients');
    });
});
