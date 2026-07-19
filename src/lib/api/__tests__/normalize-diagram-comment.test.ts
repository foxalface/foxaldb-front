import { describe, expect, it } from 'vitest';
import type { DiagramCommentDto } from '../diagram-comments';
import { normalizeDiagramCommentFromApi } from '../normalize-diagram-comment';

const baseDto = (
    overrides: Partial<DiagramCommentDto> = {}
): DiagramCommentDto => ({
    id: 10,
    diagram_id: 42,
    target_type: 'diagram',
    target_id: null,
    body: 'Hello comment',
    user: {
        id: 7,
        name: 'Alex',
    },
    created_at: '2026-07-19T10:00:00.000000Z',
    updated_at: '2026-07-19T11:00:00.000000Z',
    ...overrides,
});

describe('normalizeDiagramCommentFromApi', () => {
    it('maps a full snake_case DTO to the camelCase domain model', () => {
        expect(normalizeDiagramCommentFromApi(baseDto())).toEqual({
            id: 10,
            diagramId: 42,
            targetType: 'diagram',
            targetId: null,
            body: 'Hello comment',
            user: {
                id: 7,
                name: 'Alex',
            },
            createdAt: '2026-07-19T10:00:00.000000Z',
            updatedAt: '2026-07-19T11:00:00.000000Z',
        });
    });

    it('preserves a null user', () => {
        expect(
            normalizeDiagramCommentFromApi(baseDto({ user: null })).user
        ).toBeNull();
    });

    it('normalizes all four target types', () => {
        expect(
            normalizeDiagramCommentFromApi(
                baseDto({ target_type: 'diagram', target_id: null })
            )
        ).toMatchObject({ targetType: 'diagram', targetId: null });

        expect(
            normalizeDiagramCommentFromApi(
                baseDto({ target_type: 'table', target_id: 'table-1' })
            )
        ).toMatchObject({ targetType: 'table', targetId: 'table-1' });

        expect(
            normalizeDiagramCommentFromApi(
                baseDto({ target_type: 'field', target_id: 'field-1' })
            )
        ).toMatchObject({ targetType: 'field', targetId: 'field-1' });

        expect(
            normalizeDiagramCommentFromApi(
                baseDto({
                    target_type: 'relationship',
                    target_id: 'rel-1',
                })
            )
        ).toMatchObject({
            targetType: 'relationship',
            targetId: 'rel-1',
        });
    });

    it('preserves timestamp strings unchanged', () => {
        const createdAt = '2026-01-02T03:04:05.678901Z';
        const updatedAt = '2026-02-03T04:05:06.789012Z';

        const result = normalizeDiagramCommentFromApi(
            baseDto({
                created_at: createdAt,
                updated_at: updatedAt,
            })
        );

        expect(result.createdAt).toBe(createdAt);
        expect(result.updatedAt).toBe(updatedAt);
    });

    it('does not mutate the input DTO', () => {
        const dto = baseDto({
            user: { id: 1, name: 'Sam' },
        });
        const snapshot = structuredClone(dto);

        normalizeDiagramCommentFromApi(dto);

        expect(dto).toEqual(snapshot);
    });

    it('preserves body text exactly', () => {
        const body = '  spaced\nnewlines & <tags>  ';

        expect(normalizeDiagramCommentFromApi(baseDto({ body })).body).toBe(
            body
        );
    });
});
