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
    tickHeartbeat: () => void;
    hasHeartbeat: () => boolean;
}

const createHarness = (selfUserId = 1): Harness => {
    const sendEditing = vi.fn<(payload: EditingWhisperPayload) => void>();
    let pending: (() => void) | null = null;
    let heartbeat: (() => void) | null = null;

    const controller = new EditingBroadcastController({
        selfUserId,
        scheduleTimeout: (callback) => {
            pending = callback;
            return 1;
        },
        cancelTimeout: () => {
            pending = null;
        },
        scheduleInterval: (callback) => {
            heartbeat = callback;
            return 2;
        },
        cancelInterval: () => {
            heartbeat = null;
        },
        sendEditing,
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
        tickHeartbeat: () => {
            heartbeat?.();
        },
        hasHeartbeat: () => heartbeat !== null,
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

    it('heartbeats the non-empty snapshot while editing stays active', () => {
        const { controller, sendEditing, flushDebounce, tickHeartbeat } =
            createHarness();

        controller.startEditing(createTableEditingItem('table-1'));
        flushDebounce();
        expect(sendEditing).toHaveBeenCalledTimes(1);

        // Heartbeat must resend the same unchanged snapshot (bypassing dedupe).
        tickHeartbeat();
        tickHeartbeat();

        expect(sendEditing).toHaveBeenCalledTimes(3);
        expect(sendEditing).toHaveBeenLastCalledWith({
            userId: 1,
            edits: [{ entityType: 'table', entityId: 'table-1' }],
        });
    });

    it('starts the heartbeat only after a non-empty snapshot is emitted', () => {
        const { controller, flushDebounce, hasHeartbeat } = createHarness();

        expect(hasHeartbeat()).toBe(false);

        controller.startEditing(createTableEditingItem('table-1'));
        expect(hasHeartbeat()).toBe(false);

        flushDebounce();
        expect(hasHeartbeat()).toBe(true);
    });

    it('stopEditing sends empty edits and stops the heartbeat', () => {
        const { controller, sendEditing, flushDebounce, hasHeartbeat } =
            createHarness();

        controller.startEditing(createFieldEditingItem('field-1'));
        flushDebounce();
        expect(hasHeartbeat()).toBe(true);

        controller.stopEditing();
        flushDebounce();

        expect(sendEditing).toHaveBeenLastCalledWith({ userId: 1, edits: [] });
        expect(hasHeartbeat()).toBe(false);
    });

    it('heartbeat stops resending once the snapshot becomes empty', () => {
        const { controller, sendEditing, flushDebounce, tickHeartbeat } =
            createHarness();

        controller.startEditing(createFieldEditingItem('field-1'));
        flushDebounce();
        controller.stopEditing();
        flushDebounce();
        sendEditing.mockClear();

        // A stray heartbeat tick after clearing must not resend anything.
        tickHeartbeat();

        expect(sendEditing).not.toHaveBeenCalled();
    });

    it('dispose stops the heartbeat and clears editing', () => {
        const {
            controller,
            sendEditing,
            flushDebounce,
            tickHeartbeat,
            hasHeartbeat,
        } = createHarness();

        controller.startEditing(createTableEditingItem('table-1'));
        flushDebounce();
        expect(hasHeartbeat()).toBe(true);
        sendEditing.mockClear();

        controller.dispose();

        expect(hasHeartbeat()).toBe(false);
        expect(sendEditing).toHaveBeenCalledTimes(1);
        expect(sendEditing).toHaveBeenCalledWith({ userId: 1, edits: [] });

        // Any late heartbeat tick after dispose must be a no-op.
        tickHeartbeat();
        expect(sendEditing).toHaveBeenCalledTimes(1);
    });

    it('switching the edited entity keeps a single heartbeat resending the latest snapshot', () => {
        const { controller, sendEditing, flushDebounce, tickHeartbeat } =
            createHarness();

        controller.startEditing(createFieldEditingItem('field-a'));
        flushDebounce();
        controller.startEditing(createFieldEditingItem('field-b'));
        flushDebounce();
        sendEditing.mockClear();

        tickHeartbeat();

        expect(sendEditing).toHaveBeenCalledTimes(1);
        expect(sendEditing).toHaveBeenLastCalledWith({
            userId: 1,
            edits: [{ entityType: 'field', entityId: 'field-b' }],
        });
    });
});
