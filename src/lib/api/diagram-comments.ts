import type {
    CommentTargetType,
    CreateDiagramCommentInput,
    DiagramComment,
    ListDiagramCommentsFilter,
    UpdateDiagramCommentInput,
} from '@/lib/comments/comment-types';
import { apiRequest } from './client';
import { normalizeDiagramCommentFromApi } from './normalize-diagram-comment';

export interface DiagramCommentDto {
    id: number;
    diagram_id: number;
    target_type: CommentTargetType;
    target_id: string | null;
    body: string;
    user: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

interface DiagramCommentsListResponse {
    data: DiagramCommentDto[];
}

const commentsPath = (diagramId: string): string =>
    `/diagrams/${encodeURIComponent(diagramId)}/comments`;

const commentPath = (diagramId: string, commentId: number): string =>
    `${commentsPath(diagramId)}/${commentId}`;

const buildListQuery = (filter?: ListDiagramCommentsFilter): string => {
    if (filter === undefined) {
        return '';
    }

    const params = new URLSearchParams();
    params.set('target_type', filter.targetType);

    if (filter.targetType !== 'diagram') {
        params.set('target_id', filter.targetId);
    }

    return `?${params.toString()}`;
};

export const listDiagramComments = async (
    diagramId: string,
    filter?: ListDiagramCommentsFilter
): Promise<DiagramComment[]> => {
    const response = await apiRequest<DiagramCommentsListResponse>(
        `${commentsPath(diagramId)}${buildListQuery(filter)}`
    );

    return response.data.map(normalizeDiagramCommentFromApi);
};

export const createDiagramComment = async (
    diagramId: string,
    input: CreateDiagramCommentInput
): Promise<DiagramComment> => {
    const dto = await apiRequest<DiagramCommentDto>(commentsPath(diagramId), {
        method: 'POST',
        data: {
            target_type: input.targetType,
            target_id: input.targetId,
            body: input.body,
        },
    });

    return normalizeDiagramCommentFromApi(dto);
};

export const updateDiagramComment = async (
    diagramId: string,
    commentId: number,
    input: UpdateDiagramCommentInput
): Promise<DiagramComment> => {
    const dto = await apiRequest<DiagramCommentDto>(
        commentPath(diagramId, commentId),
        {
            method: 'PATCH',
            data: {
                body: input.body,
            },
        }
    );

    return normalizeDiagramCommentFromApi(dto);
};

export const deleteDiagramComment = async (
    diagramId: string,
    commentId: number
): Promise<void> => {
    await apiRequest<null>(commentPath(diagramId, commentId), {
        method: 'DELETE',
    });
};
