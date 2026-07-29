import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useRealtime } from '@/hooks/use-realtime';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { getPresenceColorClass } from '@/lib/realtime/presence-utils';
import { getUserInitials, userIdentityFromAuthUser } from '@/lib/user';
import { useMemo } from 'react';

export interface PresenceMember {
    id: number;
    fullName: string;
    initials: string;
    colorClass: string;
    isSelf: boolean;
    active: boolean;
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
            fullName: member.fullName,
            initials: getUserInitials(member.firstName, member.lastName),
            colorClass: getPresenceColorClass(member.id),
            isSelf: member.id === user.id,
            active: member.active,
        }));

        if (!members.some((member) => member.isSelf)) {
            const selfIdentity = userIdentityFromAuthUser(user);

            members.unshift({
                id: selfIdentity.id,
                fullName: selfIdentity.fullName,
                initials: getUserInitials(
                    selfIdentity.firstName,
                    selfIdentity.lastName
                ),
                colorClass: getPresenceColorClass(user.id),
                isSelf: true,
                active: true,
            });
        }

        members.sort((left, right) => {
            if (left.isSelf && !right.isSelf) {
                return -1;
            }

            if (!left.isSelf && right.isSelf) {
                return 1;
            }

            return left.fullName.localeCompare(right.fullName);
        });

        return {
            members,
            isPresenceVisible: true,
        };
    }, [diagramId, isAuthenticated, isLoading, presence.members, user]);
};
