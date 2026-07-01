import type { CursorAction } from './cursor-reducer';

export type CursorActionListener = (action: CursorAction) => void;

export class CursorActionSubscriber {
    private readonly listeners = new Set<CursorActionListener>();

    subscribe(listener: CursorActionListener): () => void {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    dispatch(action: CursorAction): void {
        for (const listener of this.listeners) {
            listener(action);
        }
    }
}
