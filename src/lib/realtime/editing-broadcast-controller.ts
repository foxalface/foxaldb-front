import { areEditingSnapshotsEqual } from './editing-utils';
import type { EditingItem, EditingWhisperPayload } from './editing-types';

export const DEFAULT_EDITING_BROADCAST_DEBOUNCE_MS = 150;

export const DEFAULT_EDITING_HEARTBEAT_MS = 1000;

export interface EditingBroadcastControllerOptions {
    selfUserId: number;
    sendEditing: (payload: EditingWhisperPayload) => void;
    debounceMs?: number;
    heartbeatMs?: number;
    scheduleTimeout?: (callback: () => void, delayMs: number) => number;
    cancelTimeout?: (timeoutId: number) => void;
    scheduleInterval?: (callback: () => void, delayMs: number) => number;
    cancelInterval?: (intervalId: number) => void;
}

/**
 * Emits editing awareness whispers for the local user. Sends the full editing
 * snapshot (never values or keystrokes), debounces bursts of focus/blur
 * transitions, and dedupes identical snapshots so we do not spam the channel.
 *
 * While the local user is actively editing (non-empty snapshot) it also
 * heartbeats the same snapshot on an interval so remote clients keep the
 * awareness badge alive past their stale timeout. The heartbeat intentionally
 * bypasses dedupe (it must resend unchanged snapshots) and stops as soon as the
 * snapshot becomes empty or the controller is reset/disposed.
 */
export class EditingBroadcastController {
    private readonly selfUserId: number;

    private readonly sendEditing: (payload: EditingWhisperPayload) => void;

    private readonly debounceMs: number;

    private readonly heartbeatMs: number;

    private readonly scheduleTimeout: (
        callback: () => void,
        delayMs: number
    ) => number;

    private readonly cancelTimeout: (timeoutId: number) => void;

    private readonly scheduleInterval: (
        callback: () => void,
        delayMs: number
    ) => number;

    private readonly cancelInterval: (intervalId: number) => void;

    private currentSnapshot: EditingItem[] = [];

    private lastSentSnapshot: EditingItem[] | null = null;

    private timeoutId: number | undefined;

    private heartbeatId: number | undefined;

    private disposed = false;

    constructor(options: EditingBroadcastControllerOptions) {
        this.selfUserId = options.selfUserId;
        this.sendEditing = options.sendEditing;
        this.debounceMs =
            options.debounceMs ?? DEFAULT_EDITING_BROADCAST_DEBOUNCE_MS;
        this.heartbeatMs = options.heartbeatMs ?? DEFAULT_EDITING_HEARTBEAT_MS;
        this.scheduleTimeout =
            options.scheduleTimeout ??
            ((callback, delayMs) => window.setTimeout(callback, delayMs));
        this.cancelTimeout =
            options.cancelTimeout ??
            ((timeoutId) => window.clearTimeout(timeoutId));
        this.scheduleInterval =
            options.scheduleInterval ??
            ((callback, delayMs) => window.setInterval(callback, delayMs));
        this.cancelInterval =
            options.cancelInterval ??
            ((intervalId) => window.clearInterval(intervalId));
    }

    startEditing(item: EditingItem): void {
        this.setSnapshot([item]);
    }

    updateEditing(items: EditingItem[]): void {
        this.setSnapshot([...items]);
    }

    stopEditing(): void {
        this.setSnapshot([]);
    }

    /**
     * Clears local editing state without emitting. Use when the transport is no
     * longer available (diagram switch / logout) and other clients will drop
     * the local user through presence anyway.
     */
    reset(): void {
        this.cancelScheduledFlush();
        this.stopHeartbeat();
        this.currentSnapshot = [];
        this.lastSentSnapshot = null;
    }

    /**
     * Emits an empty snapshot (if others believe the local user is editing) and
     * clears all state. Use on unmount / teardown.
     */
    dispose(): void {
        this.cancelScheduledFlush();
        this.stopHeartbeat();

        const othersThinkWeAreEditing =
            this.lastSentSnapshot !== null && this.lastSentSnapshot.length > 0;

        if (!this.disposed && othersThinkWeAreEditing) {
            this.emit([]);
        }

        this.currentSnapshot = [];
        this.lastSentSnapshot = null;
        this.disposed = true;
    }

    private setSnapshot(next: EditingItem[]): void {
        if (this.disposed) {
            return;
        }

        this.currentSnapshot = next;
        this.scheduleFlush();
    }

    private scheduleFlush(): void {
        this.cancelScheduledFlush();

        this.timeoutId = this.scheduleTimeout(() => {
            this.timeoutId = undefined;
            this.flush();
        }, this.debounceMs);
    }

    private cancelScheduledFlush(): void {
        if (this.timeoutId === undefined) {
            return;
        }

        this.cancelTimeout(this.timeoutId);
        this.timeoutId = undefined;
    }

    private flush(): void {
        if (this.disposed) {
            return;
        }

        const next = this.currentSnapshot;

        if (
            this.lastSentSnapshot !== null &&
            areEditingSnapshotsEqual(this.lastSentSnapshot, next)
        ) {
            return;
        }

        this.emit(next);
    }

    private emit(edits: EditingItem[]): void {
        this.sendEditing({ userId: this.selfUserId, edits });
        this.lastSentSnapshot = edits;

        if (edits.length > 0) {
            this.ensureHeartbeat();
        } else {
            this.stopHeartbeat();
        }
    }

    private ensureHeartbeat(): void {
        if (this.disposed || this.heartbeatId !== undefined) {
            return;
        }

        this.heartbeatId = this.scheduleInterval(() => {
            this.onHeartbeat();
        }, this.heartbeatMs);
    }

    private onHeartbeat(): void {
        if (this.disposed || this.currentSnapshot.length === 0) {
            this.stopHeartbeat();
            return;
        }

        // Resend the unchanged snapshot so remote clients refresh their stale
        // timers. This deliberately bypasses the flush dedupe.
        this.emit(this.currentSnapshot);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatId === undefined) {
            return;
        }

        this.cancelInterval(this.heartbeatId);
        this.heartbeatId = undefined;
    }
}
