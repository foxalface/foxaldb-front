import type { SelectionAction } from './selection-reducer';

export type SelectionActionListener = (action: SelectionAction) => void;

export class SelectionActionSubscriber {
    private readonly listeners = new Set<SelectionActionListener>();

    subscribe(listener: SelectionActionListener): () => void {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    dispatch(action: SelectionAction): void {
        for (const listener of this.listeners) {
            listener(action);
        }
    }
}
