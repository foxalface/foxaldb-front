import { describe, expect, it } from 'vitest';
import { getConversationTargetKey } from '@/lib/conversations/conversation-target-key';

describe('getConversationTargetKey', () => {
    it('builds a diagram target key that includes the diagram ID', () => {
        expect(
            getConversationTargetKey('diagram-a', {
                targetType: 'diagram',
                targetId: null,
            })
        ).toBe('diagram-a:diagram');
    });

    it('builds a table target key that includes the diagram ID and target ID', () => {
        expect(
            getConversationTargetKey('diagram-a', {
                targetType: 'table',
                targetId: 'table-1',
            })
        ).toBe('diagram-a:table:table-1');
    });

    it('builds a field target key that includes the diagram ID and target ID', () => {
        expect(
            getConversationTargetKey('diagram-a', {
                targetType: 'field',
                targetId: 'field-1',
            })
        ).toBe('diagram-a:field:field-1');
    });

    it('builds a relationship target key that includes the diagram ID and target ID', () => {
        expect(
            getConversationTargetKey('diagram-a', {
                targetType: 'relationship',
                targetId: 'rel-1',
            })
        ).toBe('diagram-a:relationship:rel-1');
    });

    it('produces different keys for identical target IDs from different diagrams', () => {
        const target = { targetType: 'table' as const, targetId: 'table-1' };

        expect(getConversationTargetKey('diagram-a', target)).not.toBe(
            getConversationTargetKey('diagram-b', target)
        );
    });

    it('produces different keys for diagram targets from different diagrams', () => {
        const target = { targetType: 'diagram' as const, targetId: null };

        expect(getConversationTargetKey('diagram-a', target)).not.toBe(
            getConversationTargetKey('diagram-b', target)
        );
    });

    it('rejects diagram targets with a non-null target ID', () => {
        expect(() =>
            getConversationTargetKey('diagram-a', {
                targetType: 'diagram',
                targetId: 'oops',
            } as unknown as Parameters<typeof getConversationTargetKey>[1])
        ).toThrow(/null targetId/i);
    });

    it('rejects entity targets without a target ID', () => {
        expect(() =>
            getConversationTargetKey('diagram-a', {
                targetType: 'table',
                targetId: null,
            } as unknown as Parameters<typeof getConversationTargetKey>[1])
        ).toThrow(/require a non-null targetId/i);
    });
});
