import type { DiagramAccess } from '@/lib/api/diagrams';

export interface ConversationSummaryCapabilities {
    canDelete: boolean;
}

/**
 * Mirrors backend DiagramConversationPolicy::delete for UX only.
 * The API remains authoritative.
 */
export const getConversationSummaryCapabilities = (
    diagramAccess: DiagramAccess | null | undefined
): ConversationSummaryCapabilities => ({
    canDelete: diagramAccess?.role === 'owner',
});
