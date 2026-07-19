import { describe, expect, it, vi } from 'vitest';
import {
    commentsReducer,
    initialCommentsState,
} from '@/lib/comments/comment-reducer';
import type { CommentsAction } from '@/lib/comments/comment-reducer';
import type { DiagramComment } from '@/lib/comments/comment-types';
import {
    DIAGRAM_COMMENT_CREATED_EVENT,
    DIAGRAM_COMMENT_DELETED_EVENT,
    DIAGRAM_COMMENT_UPDATED_EVENT,
} from '../comment-events';
import {
    subscribeToDiagramCommentEvents,
    type DiagramCommentEventChannel,
} from '../comment-subscriber';

type EventCallback = (payload: unknown) => void;

const createFakeChannel = (): DiagramCommentEventChannel & {
    listeners: Map<string, Set<EventCallback>>;
    stopListeningCalls: Array<{
        event: string;
        callback: EventCallback | undefined;
    }>;
    leaveCalls: number;
    emit: (event: string, payload: unknown) => void;
} => {
    const listeners = new Map<string, Set<EventCallback>>();
    const stopListeningCalls: Array<{
        event: string;
        callback: EventCallback | undefined;
    }> = [];

    const channel: DiagramCommentEventChannel & {
        listeners: Map<string, Set<EventCallback>>;
        stopListeningCalls: typeof stopListeningCalls;
        leaveCalls: number;
        emit: (event: string, payload: unknown) => void;
    } = {
        listeners,
        stopListeningCalls,
        leaveCalls: 0,
        listen(event, callback) {
            let set = listeners.get(event);
            if (set === undefined) {
                set = new Set();
                listeners.set(event, set);
            }
            set.add(callback);
            return channel;
        },
        stopListening(event, callback) {
            stopListeningCalls.push({ event, callback });
            const set = listeners.get(event);
            if (set === undefined) {
                return channel;
            }
            if (callback === undefined) {
                set.clear();
            } else {
                set.delete(callback);
            }
            return channel;
        },
        emit(event, payload) {
            const set = listeners.get(event);
            if (set === undefined) {
                return;
            }
            for (const callback of set) {
                callback(payload);
            }
        },
    };

    return channel;
};

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

const createdPayload = (
    overrides: {
        diagramId?: number;
        userId?: number;
        comment?: DiagramComment;
        sentAt?: string;
    } = {}
) => {
    const comment = overrides.comment ?? baseComment();

    return {
        diagramId: overrides.diagramId ?? comment.diagramId,
        userId: overrides.userId ?? 7,
        comment,
        sentAt: overrides.sentAt ?? '2026-07-19T10:06:00.000Z',
    };
};

const deletedPayload = (
    overrides: {
        diagramId?: number;
        commentId?: number;
        userId?: number;
        sentAt?: string;
    } = {}
) => ({
    diagramId: overrides.diagramId ?? 42,
    commentId: overrides.commentId ?? 10,
    userId: overrides.userId ?? 7,
    sentAt: overrides.sentAt ?? '2026-07-19T10:06:00.000Z',
});

describe('subscribeToDiagramCommentEvents', () => {
    it('subscribes to exactly three event names with leading dots', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        expect([...channel.listeners.keys()].sort()).toEqual([
            DIAGRAM_COMMENT_CREATED_EVENT,
            DIAGRAM_COMMENT_DELETED_EVENT,
            DIAGRAM_COMMENT_UPDATED_EVENT,
        ]);
        expect(DIAGRAM_COMMENT_CREATED_EVENT.startsWith('.')).toBe(true);
        expect(DIAGRAM_COMMENT_UPDATED_EVENT.startsWith('.')).toBe(true);
        expect(DIAGRAM_COMMENT_DELETED_EVENT.startsWith('.')).toBe(true);
    });

    it('dispatches COMMENT_UPSERTED for valid Created', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();
        const comment = baseComment();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(
            DIAGRAM_COMMENT_CREATED_EVENT,
            createdPayload({ comment })
        );

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: 'COMMENT_UPSERTED',
            comment,
        });
    });

    it('dispatches COMMENT_UPSERTED for valid Updated', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();
        const comment = baseComment({ body: 'Updated body' });

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(
            DIAGRAM_COMMENT_UPDATED_EVENT,
            createdPayload({ comment })
        );

        expect(dispatch).toHaveBeenCalledWith({
            type: 'COMMENT_UPSERTED',
            comment,
        });
    });

    it('dispatches COMMENT_REMOVED for valid Deleted', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_COMMENT_DELETED_EVENT, deletedPayload());

        expect(dispatch).toHaveBeenCalledWith({
            type: 'COMMENT_REMOVED',
            commentId: 10,
        });
    });

    it('dispatches nothing for malformed payloads', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(DIAGRAM_COMMENT_CREATED_EVENT, null);
        channel.emit(DIAGRAM_COMMENT_UPDATED_EVENT, { diagramId: 42 });
        channel.emit(DIAGRAM_COMMENT_DELETED_EVENT, {
            diagramId: 42,
            userId: 7,
            sentAt: '2026-07-19T10:06:00.000Z',
        });

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('dispatches nothing for foreign diagram Created', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(
            DIAGRAM_COMMENT_CREATED_EVENT,
            createdPayload({
                diagramId: 99,
                comment: baseComment({ diagramId: 99 }),
            })
        );

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('dispatches nothing for foreign diagram Updated', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(
            DIAGRAM_COMMENT_UPDATED_EVENT,
            createdPayload({
                diagramId: 99,
                comment: baseComment({ diagramId: 99 }),
            })
        );

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('dispatches nothing for foreign diagram Deleted', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(
            DIAGRAM_COMMENT_DELETED_EVENT,
            deletedPayload({ diagramId: 99 })
        );

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('dispatches nothing when active diagram ID is non-numeric', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: 'local-diagram',
            dispatch,
        });

        channel.emit(DIAGRAM_COMMENT_CREATED_EVENT, createdPayload());
        channel.emit(DIAGRAM_COMMENT_UPDATED_EVENT, createdPayload());
        channel.emit(DIAGRAM_COMMENT_DELETED_EVENT, deletedPayload());

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('does not filter out own actor userId', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();
        const comment = baseComment();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        channel.emit(
            DIAGRAM_COMMENT_CREATED_EVENT,
            createdPayload({ userId: 7, comment })
        );

        expect(dispatch).toHaveBeenCalledWith({
            type: 'COMMENT_UPSERTED',
            comment,
        });
    });

    it('dispatches duplicate Created events with the same reducer action shape', () => {
        const channel = createFakeChannel();
        const actions: CommentsAction[] = [];
        const comment = baseComment();

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch: (action) => {
                actions.push(action);
            },
        });

        const payload = createdPayload({ comment });
        channel.emit(DIAGRAM_COMMENT_CREATED_EVENT, payload);
        channel.emit(DIAGRAM_COMMENT_CREATED_EVENT, payload);

        expect(actions).toEqual([
            { type: 'COMMENT_UPSERTED', comment },
            { type: 'COMMENT_UPSERTED', comment },
        ]);

        let state = commentsReducer(initialCommentsState(), {
            type: 'LOAD_STARTED',
            diagramId: '42',
            generation: 1,
        });
        state = commentsReducer(state, {
            type: 'LOAD_SUCCEEDED',
            diagramId: '42',
            generation: 1,
            comments: [],
        });

        for (const action of actions) {
            state = commentsReducer(state, action);
        }

        expect(state.byId.size).toBe(1);
        expect(state.byId.get(10)).toEqual(comment);
    });

    it('cleanup removes the three exact callbacks without leaving the channel', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        const cleanup = subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        const createdCallback = [
            ...channel.listeners.get(DIAGRAM_COMMENT_CREATED_EVENT)!,
        ][0];
        const updatedCallback = [
            ...channel.listeners.get(DIAGRAM_COMMENT_UPDATED_EVENT)!,
        ][0];
        const deletedCallback = [
            ...channel.listeners.get(DIAGRAM_COMMENT_DELETED_EVENT)!,
        ][0];

        cleanup();

        expect(channel.stopListeningCalls).toEqual([
            {
                event: DIAGRAM_COMMENT_CREATED_EVENT,
                callback: createdCallback,
            },
            {
                event: DIAGRAM_COMMENT_UPDATED_EVENT,
                callback: updatedCallback,
            },
            {
                event: DIAGRAM_COMMENT_DELETED_EVENT,
                callback: deletedCallback,
            },
        ]);
        expect(channel.leaveCalls).toBe(0);
        expect(channel.listeners.get(DIAGRAM_COMMENT_CREATED_EVENT)?.size).toBe(
            0
        );
        expect(channel.listeners.get(DIAGRAM_COMMENT_UPDATED_EVENT)?.size).toBe(
            0
        );
        expect(channel.listeners.get(DIAGRAM_COMMENT_DELETED_EVENT)?.size).toBe(
            0
        );
    });

    it('cleanup called twice is harmless', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        const cleanup = subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        cleanup();
        cleanup();

        expect(channel.stopListeningCalls).toHaveLength(3);
    });

    it('events emitted after cleanup dispatch nothing', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        const cleanup = subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch,
        });

        cleanup();

        channel.emit(DIAGRAM_COMMENT_CREATED_EVENT, createdPayload());
        channel.emit(DIAGRAM_COMMENT_UPDATED_EVENT, createdPayload());
        channel.emit(DIAGRAM_COMMENT_DELETED_EVENT, deletedPayload());

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('duplicate removes remain harmless through the real reducer', () => {
        const channel = createFakeChannel();
        let state = commentsReducer(initialCommentsState(), {
            type: 'LOAD_STARTED',
            diagramId: '42',
            generation: 1,
        });
        state = commentsReducer(state, {
            type: 'LOAD_SUCCEEDED',
            diagramId: '42',
            generation: 1,
            comments: [baseComment()],
        });

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch: (action) => {
                state = commentsReducer(state, action);
            },
        });

        channel.emit(DIAGRAM_COMMENT_DELETED_EVENT, deletedPayload());
        channel.emit(DIAGRAM_COMMENT_DELETED_EVENT, deletedPayload());

        expect(state.byId.size).toBe(0);
        expect(state.byId.has(10)).toBe(false);
    });

    it('never invokes API helpers or creates Echo', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();

        expect(() =>
            subscribeToDiagramCommentEvents({
                channel,
                diagramId: '42',
                dispatch,
            })
        ).not.toThrow();

        expect(channel.leaveCalls).toBe(0);
        expect(Object.keys(channel)).not.toContain('private');
        expect(Object.keys(channel)).not.toContain('leave');
        expect(Object.keys(channel)).not.toContain('leaveChannel');
    });

    it('cleanup of one subscriber leaves the other subscriber active', () => {
        const channel = createFakeChannel();
        const dispatchA = vi.fn();
        const dispatchB = vi.fn();
        const comment = baseComment();

        const cleanupA = subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch: dispatchA,
        });
        const cleanupB = subscribeToDiagramCommentEvents({
            channel,
            diagramId: '42',
            dispatch: dispatchB,
        });

        cleanupA();

        channel.emit(
            DIAGRAM_COMMENT_CREATED_EVENT,
            createdPayload({ comment })
        );

        expect(dispatchA).not.toHaveBeenCalled();
        expect(dispatchB).toHaveBeenCalledTimes(1);
        expect(dispatchB).toHaveBeenCalledWith({
            type: 'COMMENT_UPSERTED',
            comment,
        });

        cleanupB();

        expect(channel.listeners.get(DIAGRAM_COMMENT_CREATED_EVENT)?.size).toBe(
            0
        );
        expect(channel.listeners.get(DIAGRAM_COMMENT_UPDATED_EVENT)?.size).toBe(
            0
        );
        expect(channel.listeners.get(DIAGRAM_COMMENT_DELETED_EVENT)?.size).toBe(
            0
        );
    });

    it('does not activate for an unsafe integer diagram id string', () => {
        const channel = createFakeChannel();
        const dispatch = vi.fn();
        const unsafeDiagramId = String(Number.MAX_SAFE_INTEGER + 1);

        expect(Number.isSafeInteger(Number(unsafeDiagramId))).toBe(false);

        subscribeToDiagramCommentEvents({
            channel,
            diagramId: unsafeDiagramId,
            dispatch,
        });

        channel.emit(
            DIAGRAM_COMMENT_CREATED_EVENT,
            createdPayload({
                diagramId: Number(unsafeDiagramId),
                comment: baseComment({
                    diagramId: Number(unsafeDiagramId),
                }),
            })
        );
        channel.emit(DIAGRAM_COMMENT_UPDATED_EVENT, createdPayload());
        channel.emit(DIAGRAM_COMMENT_DELETED_EVENT, deletedPayload());

        expect(dispatch).not.toHaveBeenCalled();
    });
});
