import { describe, expect, it } from 'vitest';
import { doesConversationTargetExist } from '../conversation-target-existence';

const tables = [
    {
        id: 't1',
        name: 'Users',
        fields: [
            { id: 'f1', name: 'id' },
            { id: 'f2', name: 'email' },
        ],
    },
] as const;

const relationships = [{ id: 'r1', name: 'users_orders' }] as const;

describe('doesConversationTargetExist', () => {
    it('always treats diagram targets as existing', () => {
        expect(
            doesConversationTargetExist(
                { targetType: 'diagram', targetId: null },
                { tables: [], relationships: [] }
            )
        ).toBe(true);
    });

    it('checks table, field, and relationship existence', () => {
        const context = {
            tables: tables as unknown as Parameters<
                typeof doesConversationTargetExist
            >[1]['tables'],
            relationships: relationships as unknown as Parameters<
                typeof doesConversationTargetExist
            >[1]['relationships'],
        };

        expect(
            doesConversationTargetExist(
                { targetType: 'table', targetId: 't1' },
                context
            )
        ).toBe(true);
        expect(
            doesConversationTargetExist(
                { targetType: 'field', targetId: 'f2' },
                context
            )
        ).toBe(true);
        expect(
            doesConversationTargetExist(
                { targetType: 'relationship', targetId: 'r1' },
                context
            )
        ).toBe(true);
    });

    it('returns false for deleted targets so stale summaries do not attach elsewhere', () => {
        const context = {
            tables: tables as unknown as Parameters<
                typeof doesConversationTargetExist
            >[1]['tables'],
            relationships: relationships as unknown as Parameters<
                typeof doesConversationTargetExist
            >[1]['relationships'],
        };

        expect(
            doesConversationTargetExist(
                { targetType: 'table', targetId: 'deleted-table' },
                context
            )
        ).toBe(false);
        expect(
            doesConversationTargetExist(
                { targetType: 'field', targetId: 'deleted-field' },
                context
            )
        ).toBe(false);
        expect(
            doesConversationTargetExist(
                { targetType: 'relationship', targetId: 'deleted-rel' },
                context
            )
        ).toBe(false);
        expect(
            doesConversationTargetExist(
                { targetType: 'field', targetId: 't1' },
                context
            )
        ).toBe(false);
    });
});
