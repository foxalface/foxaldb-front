import type { DiagramAccess } from '@/lib/api/diagrams';

export type DiagramAccessChangedReason = 'member_removed' | 'role_changed';

export interface DiagramAccessChangedPayload {
    diagramId: number;
    reason: DiagramAccessChangedReason;
    access: DiagramAccess | null;
    changedByUserId: number;
    sentAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isDiagramAccessRole = (value: unknown): value is DiagramAccess['role'] =>
    value === null ||
    value === 'owner' ||
    value === 'editor' ||
    value === 'viewer';

const isDiagramAccess = (value: unknown): value is DiagramAccess => {
    if (!isRecord(value)) {
        return false;
    }

    return (
        isDiagramAccessRole(value.role) &&
        typeof value.can_edit === 'boolean' &&
        typeof value.can_manage_members === 'boolean'
    );
};

const isDiagramAccessChangedReason = (
    value: unknown
): value is DiagramAccessChangedReason =>
    value === 'member_removed' || value === 'role_changed';

export const parseDiagramAccessChangedPayload = (
    value: unknown
): DiagramAccessChangedPayload | null => {
    if (!isRecord(value)) {
        return null;
    }

    const { diagramId, reason, access, changedByUserId, sentAt } = value;

    if (typeof diagramId !== 'number' || !Number.isInteger(diagramId)) {
        return null;
    }

    if (!isDiagramAccessChangedReason(reason)) {
        return null;
    }

    if (access !== null && !isDiagramAccess(access)) {
        return null;
    }

    if (
        typeof changedByUserId !== 'number' ||
        !Number.isInteger(changedByUserId)
    ) {
        return null;
    }

    if (typeof sentAt !== 'string') {
        return null;
    }

    return {
        diagramId,
        reason,
        access,
        changedByUserId,
        sentAt,
    };
};
