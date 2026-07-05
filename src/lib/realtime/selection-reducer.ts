import type { SelectionItem, UserSelectionState } from './selection-types';

export type RemoteSelectionsState = Map<number, UserSelectionState>;

export type SelectionAction =
    | {
          type: 'UPDATE';
          userId: number;
          selections: SelectionItem[];
          receivedAt: number;
      }
    | { type: 'REMOVE'; userId: number }
    | { type: 'CLEAR' };

export const initialRemoteSelectionsState = (): RemoteSelectionsState =>
    new Map();

export const selectionReducer = (
    state: RemoteSelectionsState,
    action: SelectionAction
): RemoteSelectionsState => {
    switch (action.type) {
        case 'UPDATE': {
            if (action.selections.length === 0) {
                if (!state.has(action.userId)) {
                    return state;
                }

                const selections = new Map(state);
                selections.delete(action.userId);
                return selections;
            }

            const selections = new Map(state);
            selections.set(action.userId, {
                selections: action.selections,
                receivedAt: action.receivedAt,
            });
            return selections;
        }

        case 'REMOVE': {
            if (!state.has(action.userId)) {
                return state;
            }

            const selections = new Map(state);
            selections.delete(action.userId);
            return selections;
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
