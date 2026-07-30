import type { DiagramConversationTarget } from './conversation-types';

const DIAGRAM_TARGET_SEGMENT = 'diagram';

/**
 * Builds a diagram-scoped stable key for a conversation target.
 *
 * Format:
 * - diagram: `{diagramId}:diagram`
 * - entity: `{diagramId}:{targetType}:{targetId}`
 */
export const getConversationTargetKey = (
    diagramId: string,
    target: DiagramConversationTarget
): string => {
    if (diagramId.trim().length === 0) {
        throw new Error(
            'Diagram ID is required to build a conversation target key'
        );
    }

    if (target.targetType === 'diagram') {
        if (target.targetId !== null) {
            throw new Error(
                'Diagram conversation targets must use null targetId'
            );
        }

        return `${diagramId}:${DIAGRAM_TARGET_SEGMENT}`;
    }

    if (target.targetId === null || target.targetId.length === 0) {
        throw new Error(
            `${target.targetType} conversation targets require a non-null targetId`
        );
    }

    return `${diagramId}:${target.targetType}:${target.targetId}`;
};
