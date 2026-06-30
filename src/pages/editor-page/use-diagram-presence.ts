import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import {
    getInitialsFromName,
    getPresenceColorClass,
} from '@/lib/realtime/presence-utils';
import { useMemo } from 'react';

export interface PresenceMember {
    id: number;
    name: string;
    initials: string;
    colorClass: string;
    isSelf: boolean;
}

export interface DiagramPresenceState {
    members: PresenceMember[];
    isPresenceVisible: boolean;
}

export const useDiagramPresence = (): DiagramPresenceState => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { presence } = useRealtime();
    const { currentDiagram } = useChartDB();

    const diagramId =
        currentDiagram && isValidBackendDiagramId(currentDiagram.id)
            ? String(currentDiagram.id)
            : null;

    return useMemo(() => {
        if (
            isLoading ||
            !isAuthenticated ||
            diagramId === null ||
            user === null
        ) {
            return {
                members: [],
                isPresenceVisible: false,
            };
        }

        const members: PresenceMember[] = Array.from(
            presence.members.values()
        ).map((member) => ({
            id: member.id,
            name: member.name,
            initials: getInitialsFromName(member.name),
            colorClass: getPresenceColorClass(member.id),
            isSelf: member.id === user.id,
        }));

        if (!members.some((member) => member.isSelf)) {
            members.unshift({
                id: user.id,
                name: user.name,
                initials: getInitialsFromName(user.name),
                colorClass: getPresenceColorClass(user.id),
                isSelf: true,
            });
        }

        members.sort((left, right) => {
            if (left.isSelf && !right.isSelf) {
                return -1;
            }

            if (!left.isSelf && right.isSelf) {
                return 1;
            }

            return left.name.localeCompare(right.name);
        });

        return {
            members,
            isPresenceVisible: true,
        };
    }, [diagramId, isAuthenticated, isLoading, presence.members, user]);
};
