import type {
    DiagramActivityResource,
    DiagramActivityResourceDto,
} from './diagram-activities';
import { parseUserIdentityWithEmailFromHttp } from '@/lib/user';

export const normalizeDiagramActivityFromApi = (
    activity: DiagramActivityResourceDto
): DiagramActivityResource => ({
    id: activity.id,
    diagramId: activity.diagram_id,
    userId: activity.user_id,
    user:
        activity.user === null
            ? null
            : parseUserIdentityWithEmailFromHttp(activity.user),
    action: activity.action,
    metadata: activity.metadata,
    createdAt: activity.created_at,
});
