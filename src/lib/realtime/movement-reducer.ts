import type { MovementPhase, MovementTablePosition } from './movement-types';

export type RemoteMovementsState = Map<
    number,
    {
        phase: MovementPhase;
        tables: MovementTablePosition[];
        receivedAt: number;
    }
>;

export type MovementAction =
    | {
          type: 'UPDATE';
          userId: number;
          phase: MovementPhase;
          tables: MovementTablePosition[];
          receivedAt: number;
      }
    | { type: 'REMOVE'; userId: number }
    | { type: 'CLEAR' };

export const initialRemoteMovementsState = (): RemoteMovementsState =>
    new Map();

export const movementReducer = (
    state: RemoteMovementsState,
    action: MovementAction
): RemoteMovementsState => {
    switch (action.type) {
        case 'UPDATE': {
            const movements = new Map(state);
            movements.set(action.userId, {
                phase: action.phase,
                tables: action.tables,
                receivedAt: action.receivedAt,
            });
            return movements;
        }

        case 'REMOVE': {
            if (!state.has(action.userId)) {
                return state;
            }

            const movements = new Map(state);
            movements.delete(action.userId);
            return movements;
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
