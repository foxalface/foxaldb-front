import type { CursorState } from './cursor-types';

export const REMOTE_CURSOR_STALE_MS = 2000;

export type RemoteCursorsState = Map<number, CursorState>;

export type CursorAction =
    | { type: 'UPDATE'; cursor: CursorState }
    | { type: 'REMOVE'; userId: number }
    | { type: 'CLEAR' }
    | { type: 'MARK_STALE'; userId: number };

export const initialRemoteCursorsState = (): RemoteCursorsState => new Map();

export const cursorReducer = (
    state: RemoteCursorsState,
    action: CursorAction
): RemoteCursorsState => {
    switch (action.type) {
        case 'UPDATE': {
            const cursors = new Map(state);
            cursors.set(action.cursor.userId, action.cursor);
            return cursors;
        }

        case 'REMOVE': {
            if (!state.has(action.userId)) {
                return state;
            }

            const cursors = new Map(state);
            cursors.delete(action.userId);
            return cursors;
        }

        case 'CLEAR':
            return new Map();

        case 'MARK_STALE': {
            const existing = state.get(action.userId);

            if (existing === undefined) {
                return state;
            }

            const cursors = new Map(state);
            cursors.set(action.userId, { ...existing, stale: true });
            return cursors;
        }

        default:
            return state;
    }
};
