import { describe, expect, it, vi } from 'vitest';
import { MovementBroadcastController } from '../movement-broadcast-controller';
import { CURSOR_SEND_MIN_INTERVAL_MS } from '../cursor-send-utils';
import type { MovementWhisperPayload } from '../movement-types';

const createController = (options?: {
    now?: () => number;
    getEndPositions?: (ids: ReadonlySet<string>) => Array<{
        id: string;
        x: number;
        y: number;
    }>;
}) => {
    const sent: MovementWhisperPayload[] = [];
    let frameCallback: (() => void) | null = null;
    let now = 0;

    const controller = new MovementBroadcastController({
        selfUserId: 7,
        sendMovement: (payload) => {
            sent.push(payload);
        },
        getEndPositions:
            options?.getEndPositions ??
            ((ids) =>
                [...ids].map((id) => ({
                    id,
                    x: 100,
                    y: 200,
                }))),
        now: options?.now ?? (() => now),
        scheduleFrame: (callback) => {
            frameCallback = callback;
            return 1;
        },
        cancelFrame: () => {
            frameCallback = null;
        },
    });

    const flushFrame = (): void => {
        frameCallback?.();
        frameCallback = null;
    };

    const advanceNow = (milliseconds: number): void => {
        now += milliseconds;
    };

    return {
        controller,
        sent,
        flushFrame,
        advanceNow,
        hasScheduledFrame: () => frameCallback !== null,
    };
};

describe('MovementBroadcastController', () => {
    it('batches rapid snapshot updates into a single frame flush', () => {
        const { controller, sent, flushFrame } = createController();

        controller.onDraggingSnapshotChange([{ id: 'a', x: 0, y: 0 }]);
        controller.onDraggingSnapshotChange([{ id: 'a', x: 5, y: 0 }]);
        controller.onDraggingSnapshotChange([{ id: 'a', x: 10, y: 0 }]);

        expect(sent).toHaveLength(0);

        flushFrame();

        expect(sent).toHaveLength(1);
        expect(sent[0]).toEqual({
            userId: 7,
            phase: 'move',
            tables: [{ id: 'a', x: 10, y: 0 }],
        });
    });

    it('filters movement below the threshold during drag', () => {
        const { controller, sent, flushFrame } = createController();

        controller.onDraggingSnapshotChange([{ id: 'a', x: 0, y: 0 }]);
        flushFrame();

        controller.onDraggingSnapshotChange([{ id: 'a', x: 1, y: 0 }]);
        flushFrame();

        expect(sent).toHaveLength(1);
        expect(sent[0]?.tables[0]).toEqual({ id: 'a', x: 0, y: 0 });
    });

    it('emits phase end exactly once when dragging finishes', () => {
        const { controller, sent, flushFrame } = createController();

        controller.onDraggingSnapshotChange([{ id: 'a', x: 0, y: 0 }]);
        flushFrame();

        controller.onDraggingSnapshotChange([]);
        flushFrame();
        flushFrame();

        expect(sent).toHaveLength(2);
        expect(sent[0]?.phase).toBe('move');
        expect(sent[1]).toEqual({
            userId: 7,
            phase: 'end',
            tables: [{ id: 'a', x: 100, y: 200 }],
        });
    });

    it('does not send duplicate move snapshots', () => {
        const { controller, sent, flushFrame, advanceNow } = createController();

        controller.onDraggingSnapshotChange([{ id: 'a', x: 0, y: 0 }]);
        flushFrame();

        advanceNow(CURSOR_SEND_MIN_INTERVAL_MS);
        controller.onDraggingSnapshotChange([{ id: 'a', x: 0, y: 0 }]);
        flushFrame();

        expect(sent).toHaveLength(1);
    });

    it('tracks locally dragging table ids while a drag is active', () => {
        const { controller, flushFrame } = createController();

        controller.onDraggingSnapshotChange([
            { id: 'a', x: 0, y: 0 },
            { id: 'b', x: 10, y: 10 },
        ]);
        flushFrame();

        expect([...controller.getLocalDraggingTableIds()]).toEqual(['a', 'b']);

        controller.onDraggingSnapshotChange([]);
        flushFrame();

        expect(controller.getLocalDraggingTableIds().size).toBe(0);
    });

    it('schedules only one animation frame at a time', () => {
        const scheduleFrame = vi.fn((callback: () => void) => {
            callback();
            return 1;
        });
        const sent: MovementWhisperPayload[] = [];

        const controller = new MovementBroadcastController({
            selfUserId: 1,
            sendMovement: (payload) => {
                sent.push(payload);
            },
            getEndPositions: () => [],
            scheduleFrame,
            cancelFrame: vi.fn(),
        });

        controller.onDraggingSnapshotChange([{ id: 'a', x: 0, y: 0 }]);
        controller.onDraggingSnapshotChange([{ id: 'a', x: 10, y: 0 }]);

        expect(scheduleFrame).toHaveBeenCalledTimes(1);
    });

    it('dispose cancels a pending frame without throwing', () => {
        const cancelAnimationFrameSpy = vi.spyOn(
            globalThis,
            'cancelAnimationFrame'
        );
        const requestAnimationFrameSpy = vi
            .spyOn(globalThis, 'requestAnimationFrame')
            .mockImplementation(() => 99);

        const sendMovement = vi.fn();
        const controller = new MovementBroadcastController({
            selfUserId: 1,
            sendMovement,
            getEndPositions: () => [],
        });

        controller.onDraggingSnapshotChange([{ id: 'a', x: 0, y: 0 }]);

        expect(() => controller.dispose()).not.toThrow();
        expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(99);
        expect(sendMovement).not.toHaveBeenCalled();

        expect(() => controller.dispose()).not.toThrow();
        expect(() => controller.reset()).not.toThrow();
        expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(1);

        requestAnimationFrameSpy.mockRestore();
        cancelAnimationFrameSpy.mockRestore();
    });
});
