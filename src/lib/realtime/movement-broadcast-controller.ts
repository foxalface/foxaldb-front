import { shouldSendMovementUpdate } from './movement-send-utils';
import type { MovementPhase, MovementWhisperPayload } from './movement-types';
import type { MovementTablePosition } from './movement-types';

export interface MovementBroadcastControllerOptions {
    selfUserId: number;
    sendMovement: (payload: MovementWhisperPayload) => void;
    getEndPositions: (ids: ReadonlySet<string>) => MovementTablePosition[];
    now?: () => number;
    scheduleFrame?: (callback: () => void) => number;
    cancelFrame?: (frameId: number) => void;
}

export class MovementBroadcastController {
    private readonly selfUserId: number;

    private readonly sendMovement: (payload: MovementWhisperPayload) => void;

    private readonly getEndPositions: (
        ids: ReadonlySet<string>
    ) => MovementTablePosition[];

    private readonly now: () => number;

    private readonly customScheduleFrame?: (callback: () => void) => number;

    private readonly customCancelFrame?: (frameId: number) => void;

    private readonly localDraggingTableIds = new Set<string>();

    private lastSentSnapshot: MovementTablePosition[] | null = null;

    private lastSentAt = 0;

    private pendingSnapshot: MovementTablePosition[] | null = null;

    private animationFrameId: number | undefined;

    constructor(options: MovementBroadcastControllerOptions) {
        this.selfUserId = options.selfUserId;
        this.sendMovement = options.sendMovement;
        this.getEndPositions = options.getEndPositions;
        this.now = options.now ?? (() => Date.now());
        this.customScheduleFrame = options.scheduleFrame;
        this.customCancelFrame = options.cancelFrame;
    }

    getLocalDraggingTableIds(): ReadonlySet<string> {
        return this.localDraggingTableIds;
    }

    onDraggingSnapshotChange(snapshot: MovementTablePosition[]): void {
        this.pendingSnapshot = snapshot;
        this.scheduleFlush();
    }

    reset(): void {
        this.cancelScheduledFlush();
        this.pendingSnapshot = null;
        this.localDraggingTableIds.clear();
        this.lastSentSnapshot = null;
        this.lastSentAt = 0;
    }

    dispose(): void {
        this.reset();
    }

    private cancelScheduledFlush(): void {
        if (this.animationFrameId === undefined) {
            return;
        }

        const frameId = this.animationFrameId;
        this.animationFrameId = undefined;

        if (this.customCancelFrame !== undefined) {
            this.customCancelFrame(frameId);
            return;
        }

        globalThis.cancelAnimationFrame(frameId);
    }

    private scheduleFlush(): void {
        if (this.animationFrameId !== undefined) {
            return;
        }

        const onFrame = (): void => {
            this.animationFrameId = undefined;
            this.flush();
        };

        this.animationFrameId =
            this.customScheduleFrame?.(onFrame) ??
            globalThis.requestAnimationFrame(onFrame);
    }

    private flush(): void {
        const snapshot = this.pendingSnapshot ?? [];

        if (snapshot.length > 0) {
            this.localDraggingTableIds.clear();

            for (const table of snapshot) {
                this.localDraggingTableIds.add(table.id);
            }

            const now = this.now();

            if (
                shouldSendMovementUpdate(
                    this.lastSentSnapshot,
                    snapshot,
                    this.lastSentAt,
                    now
                )
            ) {
                this.emitMovement('move', snapshot);
                this.lastSentSnapshot = snapshot;
                this.lastSentAt = now;
            }

            return;
        }

        if (this.localDraggingTableIds.size === 0) {
            return;
        }

        const endTables = this.getEndPositions(this.localDraggingTableIds);

        if (endTables.length > 0) {
            this.emitMovement('end', endTables);
        }

        this.localDraggingTableIds.clear();
        this.lastSentSnapshot = null;
        this.lastSentAt = 0;
    }

    private emitMovement(
        phase: MovementPhase,
        tables: MovementTablePosition[]
    ): void {
        this.sendMovement({
            userId: this.selfUserId,
            phase,
            tables,
        });
    }
}
