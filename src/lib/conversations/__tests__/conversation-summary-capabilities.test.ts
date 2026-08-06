import { describe, expect, it } from 'vitest';
import type { DiagramAccess } from '@/lib/api/diagrams';
import { getConversationSummaryCapabilities } from '@/lib/conversations/conversation-summary-capabilities';

describe('getConversationSummaryCapabilities', () => {
    it('allows delete only for diagram owners', () => {
        const ownerAccess: DiagramAccess = {
            role: 'owner',
            can_edit: true,
            can_manage_members: true,
        };
        const editorAccess: DiagramAccess = {
            role: 'editor',
            can_edit: true,
            can_manage_members: false,
        };

        expect(getConversationSummaryCapabilities(ownerAccess).canDelete).toBe(
            true
        );
        expect(getConversationSummaryCapabilities(editorAccess).canDelete).toBe(
            false
        );
        expect(getConversationSummaryCapabilities(null).canDelete).toBe(false);
    });
});
