import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '../client';
import type { DiagramCommentDto } from '../diagram-comments';

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('../client', async () => {
    const actual = (await vi.importActual('../client')) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

import { ApiError } from '../client';
import {
    createDiagramComment,
    deleteDiagramComment,
    listDiagramComments,
    updateDiagramComment,
} from '../diagram-comments';

const ENCODED_DIAGRAM_ID = 'équipe / alpha&1';

const sampleDto = (
    overrides: Partial<DiagramCommentDto> = {}
): DiagramCommentDto => ({
    id: 10,
    diagram_id: 42,
    target_type: 'table',
    target_id: 'table-1',
    body: 'Note',
    user: {
        id: 7,
        name: 'Alex',
    },
    created_at: '2026-07-19T10:00:00.000000Z',
    updated_at: '2026-07-19T11:00:00.000000Z',
    ...overrides,
});

describe('diagram-comments API', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
    });

    describe('listDiagramComments', () => {
        it('calls the unfiltered list URL', async () => {
            apiRequestMock.mockResolvedValueOnce({ data: [] });

            await listDiagramComments('42');

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments'
            );
        });

        it('encodes diagram IDs in the list URL path', async () => {
            apiRequestMock.mockResolvedValueOnce({ data: [] });

            await listDiagramComments(ENCODED_DIAGRAM_ID);

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/%C3%A9quipe%20%2F%20alpha%261/comments'
            );
        });

        it('emits target_type=diagram without target_id', async () => {
            apiRequestMock.mockResolvedValueOnce({ data: [] });

            await listDiagramComments('42', {
                targetType: 'diagram',
                targetId: null,
            });

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments?target_type=diagram'
            );
        });

        it('emits encoded target_type and target_id for table filters', async () => {
            apiRequestMock.mockResolvedValueOnce({ data: [] });

            await listDiagramComments('42', {
                targetType: 'table',
                targetId: 'table/with spaces',
            });

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments?target_type=table&target_id=table%2Fwith+spaces'
            );
        });

        it('emits query params for field filters', async () => {
            apiRequestMock.mockResolvedValueOnce({ data: [] });

            await listDiagramComments('42', {
                targetType: 'field',
                targetId: 'field-1',
            });

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments?target_type=field&target_id=field-1'
            );
        });

        it('emits query params for relationship filters', async () => {
            apiRequestMock.mockResolvedValueOnce({ data: [] });

            await listDiagramComments('42', {
                targetType: 'relationship',
                targetId: 'rel-1',
            });

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments?target_type=relationship&target_id=rel-1'
            );
        });

        it('unwraps data and normalizes every DTO', async () => {
            apiRequestMock.mockResolvedValueOnce({
                data: [
                    sampleDto({
                        id: 1,
                        target_type: 'diagram',
                        target_id: null,
                    }),
                    sampleDto({
                        id: 2,
                        target_type: 'field',
                        target_id: 'f-1',
                        user: null,
                    }),
                ],
            });

            const result = await listDiagramComments('42');

            expect(result).toEqual([
                {
                    id: 1,
                    diagramId: 42,
                    targetType: 'diagram',
                    targetId: null,
                    body: 'Note',
                    user: { id: 7, name: 'Alex' },
                    createdAt: '2026-07-19T10:00:00.000000Z',
                    updatedAt: '2026-07-19T11:00:00.000000Z',
                },
                {
                    id: 2,
                    diagramId: 42,
                    targetType: 'field',
                    targetId: 'f-1',
                    body: 'Note',
                    user: null,
                    createdAt: '2026-07-19T10:00:00.000000Z',
                    updatedAt: '2026-07-19T11:00:00.000000Z',
                },
            ]);
        });
    });

    describe('createDiagramComment', () => {
        it('POSTs snake_case payload for a diagram target with null target_id', async () => {
            apiRequestMock.mockResolvedValueOnce(
                sampleDto({ target_type: 'diagram', target_id: null })
            );

            await createDiagramComment('42', {
                targetType: 'diagram',
                targetId: null,
                body: 'Diagram note',
            });

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments',
                {
                    method: 'POST',
                    data: {
                        target_type: 'diagram',
                        target_id: null,
                        body: 'Diagram note',
                    },
                }
            );
        });

        it('POSTs entity target IDs and normalizes the response', async () => {
            apiRequestMock.mockResolvedValueOnce(
                sampleDto({
                    target_type: 'relationship',
                    target_id: 'rel-9',
                    body: 'Rel note',
                })
            );

            const result = await createDiagramComment('42', {
                targetType: 'relationship',
                targetId: 'rel-9',
                body: 'Rel note',
            });

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments',
                {
                    method: 'POST',
                    data: {
                        target_type: 'relationship',
                        target_id: 'rel-9',
                        body: 'Rel note',
                    },
                }
            );

            expect(result).toEqual({
                id: 10,
                diagramId: 42,
                targetType: 'relationship',
                targetId: 'rel-9',
                body: 'Rel note',
                user: { id: 7, name: 'Alex' },
                createdAt: '2026-07-19T10:00:00.000000Z',
                updatedAt: '2026-07-19T11:00:00.000000Z',
            });
        });
    });

    describe('updateDiagramComment', () => {
        it('PATCHes body only and normalizes the response', async () => {
            apiRequestMock.mockResolvedValueOnce(
                sampleDto({ body: 'Updated' })
            );

            const result = await updateDiagramComment('42', 10, {
                body: 'Updated',
            });

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments/10',
                {
                    method: 'PATCH',
                    data: {
                        body: 'Updated',
                    },
                }
            );

            expect(result.body).toBe('Updated');
            expect(result.diagramId).toBe(42);
            expect(result.targetType).toBe('table');
        });

        it('encodes diagram IDs in the update URL path', async () => {
            apiRequestMock.mockResolvedValueOnce(
                sampleDto({ body: 'Updated' })
            );

            await updateDiagramComment(ENCODED_DIAGRAM_ID, 10, {
                body: 'Updated',
            });

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/%C3%A9quipe%20%2F%20alpha%261/comments/10',
                {
                    method: 'PATCH',
                    data: {
                        body: 'Updated',
                    },
                }
            );
        });
    });

    describe('deleteDiagramComment', () => {
        it('DELETEs the comment URL and resolves void for a null 204 response', async () => {
            apiRequestMock.mockResolvedValueOnce(null);

            await expect(
                deleteDiagramComment('42', 10)
            ).resolves.toBeUndefined();

            expect(apiRequestMock).toHaveBeenCalledWith(
                '/diagrams/42/comments/10',
                {
                    method: 'DELETE',
                }
            );
        });
    });

    describe('error propagation', () => {
        it('propagates ApiError unchanged', async () => {
            const error = new ApiError('Forbidden', 403, {
                message: 'Forbidden',
            });
            apiRequestMock.mockRejectedValueOnce(error);

            await expect(listDiagramComments('42')).rejects.toBe(error);
        });
    });
});
