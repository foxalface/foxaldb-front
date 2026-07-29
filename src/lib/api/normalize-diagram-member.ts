import type {
    DiagramMemberResource,
    DiagramMemberResourceDto,
} from './diagram-members';
import { parseUserIdentityWithEmailFromHttp } from '@/lib/user';

export const normalizeDiagramMemberFromApi = (
    member: DiagramMemberResourceDto
): DiagramMemberResource => {
    const user = parseUserIdentityWithEmailFromHttp(member.user);

    if (user === null) {
        throw new Error('Invalid diagram member user payload');
    }

    return {
        id: member.id,
        user,
        role: member.role,
        createdAt: member.created_at,
        updatedAt: member.updated_at,
    };
};
