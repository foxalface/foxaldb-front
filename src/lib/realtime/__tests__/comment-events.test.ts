import { describe, expect, it } from 'vitest';
import type { DiagramComment } from '@/lib/comments/comment-types';
import {
    DIAGRAM_COMMENT_CREATED_EVENT,
    DIAGRAM_COMMENT_DELETED_EVENT,
    DIAGRAM_COMMENT_UPDATED_EVENT,
    parseDiagramCommentCreatedPayload,
    parseDiagramCommentDeletedPayload,
    parseDiagramCommentUpdatedPayload,
    type DiagramCommentMutationPayload,
} from '../comment-events';

const baseComment = (
    overrides: Partial<DiagramComment> = {}
): DiagramComment => ({
    id: 10,
    diagramId: 42,
    targetType: 'diagram',
    targetId: null,
    body: 'Hello',
    user: { id: 7, name: 'Alice' },
    createdAt: '2026-07-19T10:00:00.000Z',
    updatedAt: '2026-07-19T10:05:00.000Z',
    ...overrides,
});

const baseMutationPayload = (
    overrides: Partial<DiagramCommentMutationPayload> = {}
): DiagramCommentMutationPayload => {
    const comment = overrides.comment ?? baseComment();

    return {
        diagramId: overrides.diagramId ?? comment.diagramId,
        userId: overrides.userId ?? 7,
        comment,
        sentAt: overrides.sentAt ?? '2026-07-19T10:06:00.000Z',
    };
};

describe('comment event names', () => {
    it('uses exact Created name with leading dot', () => {
        expect(DIAGRAM_COMMENT_CREATED_EVENT).toBe('.DiagramCommentCreated');
    });

    it('uses exact Updated name with leading dot', () => {
        expect(DIAGRAM_COMMENT_UPDATED_EVENT).toBe('.DiagramCommentUpdated');
    });

    it('uses exact Deleted name with leading dot', () => {
        expect(DIAGRAM_COMMENT_DELETED_EVENT).toBe('.DiagramCommentDeleted');
    });
});

describe.each([
    ['Created', parseDiagramCommentCreatedPayload],
    ['Updated', parseDiagramCommentUpdatedPayload],
] as const)('parseDiagramComment%sPayload', (_label, parse) => {
    it('parses a valid diagram-level comment', () => {
        const input = baseMutationPayload();

        expect(parse(input)).toEqual(input);
    });

    it('parses a valid table target', () => {
        const input = baseMutationPayload({
            comment: baseComment({
                targetType: 'table',
                targetId: 'table-1',
            }),
        });

        expect(parse(input)).toEqual(input);
    });

    it('parses a valid field target', () => {
        const input = baseMutationPayload({
            comment: baseComment({
                targetType: 'field',
                targetId: 'field-1',
            }),
        });

        expect(parse(input)).toEqual(input);
    });

    it('parses a valid relationship target', () => {
        const input = baseMutationPayload({
            comment: baseComment({
                targetType: 'relationship',
                targetId: 'rel-1',
            }),
        });

        expect(parse(input)).toEqual(input);
    });

    it('preserves null user', () => {
        const input = baseMutationPayload({
            comment: baseComment({ user: null }),
        });

        expect(parse(input)?.comment.user).toBeNull();
    });

    it('preserves user id and name', () => {
        const input = baseMutationPayload({
            comment: baseComment({
                user: { id: 99, name: 'Bob' },
            }),
        });

        expect(parse(input)?.comment.user).toEqual({ id: 99, name: 'Bob' });
    });

    it('preserves timestamp strings exactly', () => {
        const sentAt = '2026-07-19T12:34:56.789+02:00';
        const createdAt = '2026-01-01T00:00:00.000Z';
        const updatedAt = '2026-01-02T00:00:00.000Z';
        const input = baseMutationPayload({
            sentAt,
            comment: baseComment({ createdAt, updatedAt }),
        });

        const parsed = parse(input);

        expect(parsed?.sentAt).toBe(sentAt);
        expect(parsed?.comment.createdAt).toBe(createdAt);
        expect(parsed?.comment.updatedAt).toBe(updatedAt);
    });

    it('does not mutate the input object', () => {
        const input = baseMutationPayload({
            comment: baseComment({
                targetType: 'table',
                targetId: 'table-1',
            }),
        });
        const snapshot = structuredClone(input);

        parse(input);

        expect(input).toEqual(snapshot);
    });

    it('rejects null', () => {
        expect(parse(null)).toBeNull();
    });

    it('rejects arrays', () => {
        expect(parse([])).toBeNull();
    });

    it('rejects missing envelope fields', () => {
        expect(
            parse({
                diagramId: 42,
                comment: baseComment(),
                sentAt: '2026-07-19T10:06:00.000Z',
            })
        ).toBeNull();
        expect(
            parse({
                userId: 7,
                comment: baseComment(),
                sentAt: '2026-07-19T10:06:00.000Z',
            })
        ).toBeNull();
        expect(
            parse({
                diagramId: 42,
                userId: 7,
                sentAt: '2026-07-19T10:06:00.000Z',
            })
        ).toBeNull();
        expect(
            parse({
                diagramId: 42,
                userId: 7,
                comment: baseComment(),
            })
        ).toBeNull();
    });

    it('rejects invalid envelope diagramId', () => {
        expect(
            parse(baseMutationPayload({ diagramId: 42.5 as unknown as number }))
        ).toBeNull();
        expect(
            parse(
                baseMutationPayload({
                    diagramId: '42' as unknown as number,
                })
            )
        ).toBeNull();
        expect(
            parse(
                baseMutationPayload({
                    diagramId: Number.POSITIVE_INFINITY,
                })
            )
        ).toBeNull();
    });

    it('rejects invalid userId', () => {
        expect(
            parse(baseMutationPayload({ userId: 1.5 as unknown as number }))
        ).toBeNull();
        expect(
            parse(
                baseMutationPayload({
                    userId: '7' as unknown as number,
                })
            )
        ).toBeNull();
    });

    it('rejects empty sentAt', () => {
        expect(parse(baseMutationPayload({ sentAt: '' }))).toBeNull();
    });

    it('rejects missing comment', () => {
        expect(
            parse({
                diagramId: 42,
                userId: 7,
                comment: null,
                sentAt: '2026-07-19T10:06:00.000Z',
            })
        ).toBeNull();
    });

    it('rejects invalid comment ID', () => {
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({
                        id: 1.5 as unknown as number,
                    }),
                })
            )
        ).toBeNull();
    });

    it('rejects unsupported target type', () => {
        expect(
            parse(
                baseMutationPayload({
                    comment: {
                        ...baseComment(),
                        targetType: 'note' as DiagramComment['targetType'],
                    },
                })
            )
        ).toBeNull();
    });

    it('rejects diagram target with non-null targetId', () => {
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({
                        targetType: 'diagram',
                        targetId: 'not-null' as unknown as null,
                    }),
                })
            )
        ).toBeNull();
    });

    it('rejects entity target with null targetId', () => {
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({
                        targetType: 'table',
                        targetId: null,
                    }),
                })
            )
        ).toBeNull();
    });

    it('rejects entity target with empty targetId', () => {
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({
                        targetType: 'field',
                        targetId: '',
                    }),
                })
            )
        ).toBeNull();
    });

    it('rejects malformed user', () => {
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({
                        user: { id: 1.5, name: 'Alice' } as never,
                    }),
                })
            )
        ).toBeNull();
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({
                        user: { id: 1, name: 2 } as never,
                    }),
                })
            )
        ).toBeNull();
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({
                        user: 'Alice' as never,
                    }),
                })
            )
        ).toBeNull();
    });

    it('rejects missing body', () => {
        const withoutBody = {
            id: 10,
            diagramId: 42,
            targetType: 'diagram' as const,
            targetId: null,
            user: { id: 7, name: 'Alice' },
            createdAt: '2026-07-19T10:00:00.000Z',
            updatedAt: '2026-07-19T10:05:00.000Z',
        };

        expect(
            parse(
                baseMutationPayload({
                    comment: withoutBody as DiagramComment,
                })
            )
        ).toBeNull();
    });

    it('rejects invalid timestamps', () => {
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({ createdAt: '' }),
                })
            )
        ).toBeNull();
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({ updatedAt: '' }),
                })
            )
        ).toBeNull();
        expect(
            parse(
                baseMutationPayload({
                    comment: baseComment({
                        createdAt: null as unknown as string,
                    }),
                })
            )
        ).toBeNull();
    });

    it('rejects mismatch between envelope diagramId and comment.diagramId', () => {
        expect(
            parse(
                baseMutationPayload({
                    diagramId: 99,
                    comment: baseComment({ diagramId: 42 }),
                })
            )
        ).toBeNull();
    });

    it('does not require positive IDs (matches diagram-access-changed)', () => {
        const input = baseMutationPayload({
            diagramId: 0,
            userId: 0,
            comment: baseComment({ id: 0, diagramId: 0 }),
        });

        expect(parse(input)).toEqual(input);
    });
});

describe('plain-object validation', () => {
    it.each([
        ['Date', new Date()],
        ['Map', new Map()],
        ['Set', new Set()],
        ['RegExp', /x/],
        ['Error', new Error('nope')],
    ] as const)(
        'rejects %s for Created/Updated/Deleted parsers',
        (_label, value) => {
            expect(parseDiagramCommentCreatedPayload(value)).toBeNull();
            expect(parseDiagramCommentUpdatedPayload(value)).toBeNull();
            expect(parseDiagramCommentDeletedPayload(value)).toBeNull();
        }
    );

    it('still accepts Object.create(null) envelopes when fields are valid', () => {
        const comment = Object.assign(
            Object.create(null),
            baseComment()
        ) as DiagramComment;
        const input = Object.assign(Object.create(null), {
            diagramId: 42,
            userId: 7,
            comment,
            sentAt: '2026-07-19T10:06:00.000Z',
        });

        expect(parseDiagramCommentCreatedPayload(input)).toEqual({
            diagramId: 42,
            userId: 7,
            comment: baseComment(),
            sentAt: '2026-07-19T10:06:00.000Z',
        });
    });
});

describe('parseDiagramCommentDeletedPayload', () => {
    it('parses a valid payload', () => {
        const input = {
            diagramId: 42,
            commentId: 10,
            userId: 7,
            sentAt: '2026-07-19T10:06:00.000Z',
        };

        expect(parseDiagramCommentDeletedPayload(input)).toEqual(input);
    });

    it('rejects missing or invalid commentId', () => {
        expect(
            parseDiagramCommentDeletedPayload({
                diagramId: 42,
                userId: 7,
                sentAt: '2026-07-19T10:06:00.000Z',
            })
        ).toBeNull();
        expect(
            parseDiagramCommentDeletedPayload({
                diagramId: 42,
                commentId: 1.5,
                userId: 7,
                sentAt: '2026-07-19T10:06:00.000Z',
            })
        ).toBeNull();
        expect(
            parseDiagramCommentDeletedPayload({
                diagramId: 42,
                commentId: '10',
                userId: 7,
                sentAt: '2026-07-19T10:06:00.000Z',
            })
        ).toBeNull();
    });

    it('rejects malformed envelope', () => {
        expect(parseDiagramCommentDeletedPayload(null)).toBeNull();
        expect(parseDiagramCommentDeletedPayload([])).toBeNull();
        expect(
            parseDiagramCommentDeletedPayload({
                diagramId: '42',
                commentId: 10,
                userId: 7,
                sentAt: '2026-07-19T10:06:00.000Z',
            })
        ).toBeNull();
        expect(
            parseDiagramCommentDeletedPayload({
                diagramId: 42,
                commentId: 10,
                userId: 7,
                sentAt: '',
            })
        ).toBeNull();
    });

    it('preserves timestamp string exactly', () => {
        const sentAt = '2026-07-19T12:34:56.789+02:00';

        expect(
            parseDiagramCommentDeletedPayload({
                diagramId: 42,
                commentId: 10,
                userId: 7,
                sentAt,
            })?.sentAt
        ).toBe(sentAt);
    });

    it('does not mutate the input object', () => {
        const input = {
            diagramId: 42,
            commentId: 10,
            userId: 7,
            sentAt: '2026-07-19T10:06:00.000Z',
        };
        const snapshot = structuredClone(input);

        parseDiagramCommentDeletedPayload(input);

        expect(input).toEqual(snapshot);
    });
});
