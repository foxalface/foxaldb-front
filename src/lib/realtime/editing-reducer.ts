import type { EditingItem, UserEditingState } from './editing-types';

export type RemoteEditingState = Map<number, UserEditingState>;

export type EditingAction =
    | {
          type: 'UPDATE';
          userId: number;
          edits: EditingItem[];
          receivedAt: number;
      }
    | { type: 'REMOVE'; userId: number }
    | { type: 'CLEAR' };

export const initialRemoteEditingState = (): RemoteEditingState => new Map();

export const editingReducer = (
    state: RemoteEditingState,
    action: EditingAction
): RemoteEditingState => {
    switch (action.type) {
        case 'UPDATE': {
            if (action.edits.length === 0) {
                if (!state.has(action.userId)) {
                    return state;
                }

                const edits = new Map(state);
                edits.delete(action.userId);
                return edits;
            }

            const edits = new Map(state);
            edits.set(action.userId, {
                edits: action.edits,
                receivedAt: action.receivedAt,
            });
            return edits;
        }

        case 'REMOVE': {
            if (!state.has(action.userId)) {
                return state;
            }

            const edits = new Map(state);
            edits.delete(action.userId);
            return edits;
        }

        case 'CLEAR':
            if (state.size === 0) {
                return state;
            }

            return new Map();

        default:
            return state;
    }
};
