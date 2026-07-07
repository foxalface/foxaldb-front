import { describe, expect, it, vi } from 'vitest';
import { EditingBroadcastController } from '../editing-broadcast-controller';
import type { EditingWhisperPayload } from '../editing-types';
import {
    createFieldEditingItem,
    createTableEditingItem,
} from '../editing-utils';

interface Harness {
    controller: EditingBroadcastController;
    sendEditing: ReturnType<typeof vi.fn>;
    flushDebounce: () => void;
    hasPending: () => boolean;
}

const createHarness = (selfUserId = 1): Harness => {
    const sendEditing = vi.fn<(payload: EditingWhisperPayload) => void>();
    let pending: (() => void) | null = null;

    const controller = new EditingBroadcastController({
        selfUserId,
        sendEditing,
        scheduleTimeout: (callback) => {
            pending = callback;
            return 1;
        },
        cancelTimeout: () => {
            pending = null;
        },
    });

    return {
        controller,
        sendEditing,
        flushDebounce: () => {
            const callback = pending;
            pending = null;
            callback?.();
        },
        hasPending: () => pending !== null,
    };
};

describe('EditingBroadcastController', () => {
    it('sends the full snapshot after the debounce flush', () => {
        const { controller, sendEditing, flushDebounce } = createHarness();

        controller.startEditing(createTableEditingItem('table-1'));
        expect(sendEditing).not.toHaveBeenCalled();

        flushDebounce();

        expect(sendEditing).toHaveBeenCalledTimes(1);
        expect(sendEditing).toHaveBeenCalledWith({
            userId: 1,
            edits: [{ entityType: 'table', entityId: 'table-1' }],
        });
    });

    it('dedupes identical snapshots', () => {
        const { controller, sendEditing, flushDebounce } = createHarness();

        controller.startEditing(createFieldEditingItem('field-1'));
        flushDebounce();
        controller.startEditing(createFieldEditingItem('field-1'));
        flushDebounce();

        expect(sendEditing).toHaveBeenCalledTimes(1);
    });

    it('coalesces a blur/focus burst into a single send', () => {
        const { controller, sendEditing, flushDebounce } = createHarness();

        controller.startEditing(createFieldEditingItem('field-a'));
        controller.stopEditing();
        controller.startEditing(createFieldEditingItem('field-b'));
        flushDebounce();

        expect(sendEditing).toHaveBeenCalledTimes(1);
        expect(sendEditing).toHaveBeenCalledWith({
            userId: 1,
            edits: [{ entityType: 'field', entityId: 'field-b' }],
        });
    });

    it('stopEditing sends an empty edits snapshot', () => {
        const { controller, sendEditing, flushDebounce } = createHarness();

        controller.startEditing(createFieldEditingItem('field-1'));
        flushDebounce();
        controller.stopEditing();
        flushDebounce();

        expect(sendEditing).toHaveBeenLastCalledWith({
            userId: 1,
            edits: [],
        });
    });

    it('dispose clears editing by sending empty edits when others were notified', () => {
        const { controller, sendEditing, flushDebounce } = createHarness();

        controller.startEditing(createTableEditingItem('table-1'));
        flushDebounce();
        sendEditing.mockClear();

        controller.dispose();

        expect(sendEditing).toHaveBeenCalledTimes(1);
        expect(sendEditing).toHaveBeenCalledWith({ userId: 1, edits: [] });
    });

    it('dispose does not emit when nothing was ever broadcast', () => {
        const { controller, sendEditing, flushDebounce } = createHarness();

        controller.startEditing(createTableEditingItem('table-1'));
        // dispose before the debounce ever flushes a snapshot
        controller.dispose();
        flushDebounce();

        expect(sendEditing).not.toHaveBeenCalled();
    });

    it('ignores editing calls after dispose', () => {
        const { controller, sendEditing, flushDebounce, hasPending } =
            createHarness();

        controller.dispose();
        controller.startEditing(createTableEditingItem('table-1'));
        flushDebounce();

        expect(hasPending()).toBe(false);
        expect(sendEditing).not.toHaveBeenCalled();
    });

    it('reset clears state without emitting', () => {
        const { controller, sendEditing, flushDebounce } = createHarness();

        controller.startEditing(createTableEditingItem('table-1'));
        flushDebounce();
        sendEditing.mockClear();

        controller.reset();

        expect(sendEditing).not.toHaveBeenCalled();
    });
});
