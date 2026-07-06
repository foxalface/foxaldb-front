import type { MovementAction } from './movement-reducer';

export type MovementActionListener = (action: MovementAction) => void;

export class MovementActionSubscriber {
    private readonly listeners = new Set<MovementActionListener>();

    subscribe(listener: MovementActionListener): () => void {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    dispatch(action: MovementAction): void {
        for (const listener of this.listeners) {
            listener(action);
        }
    }
}
