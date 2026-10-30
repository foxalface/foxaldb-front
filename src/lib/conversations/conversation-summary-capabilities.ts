import type { DiagramAccess } from '@/lib/api/diagrams';

export interface ConversationSummaryCapabilities {
    canDelete: boolean;
    canArchive: boolean;
}

/**
 * Mirrors backend DiagramConversationPolicy for UX only.
 * Archive/reopen require diagram update permission; delete is owner-only.
 * The API remains authoritative.
 */
export const getConversationSummaryCapabilities = (
    diagramAccess: DiagramAccess | null | undefined
): ConversationSummaryCapabilities => ({
    canDelete: diagramAccess?.role === 'owner',
    canArchive: diagramAccess?.can_edit === true,
});
