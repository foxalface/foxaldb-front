import type { EditingAction } from './editing-reducer';

export type EditingActionListener = (action: EditingAction) => void;

export class EditingActionSubscriber {
    private readonly listeners = new Set<EditingActionListener>();

    subscribe(listener: EditingActionListener): () => void {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    dispatch(action: EditingAction): void {
        for (const listener of this.listeners) {
            listener(action);
        }
    }
}
