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

    it('allows archive for owners and editors only', () => {
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
        const viewerAccess: DiagramAccess = {
            role: 'viewer',
            can_edit: false,
            can_manage_members: false,
        };

        expect(getConversationSummaryCapabilities(ownerAccess).canArchive).toBe(
            true
        );
        expect(
            getConversationSummaryCapabilities(editorAccess).canArchive
        ).toBe(true);
        expect(
            getConversationSummaryCapabilities(viewerAccess).canArchive
        ).toBe(false);
        expect(getConversationSummaryCapabilities(null).canArchive).toBe(false);
    });
});
