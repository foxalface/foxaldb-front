import { areEditingSnapshotsEqual } from './editing-utils';
import type { EditingItem, EditingWhisperPayload } from './editing-types';

export const DEFAULT_EDITING_BROADCAST_DEBOUNCE_MS = 150;

export interface EditingBroadcastControllerOptions {
    selfUserId: number;
    sendEditing: (payload: EditingWhisperPayload) => void;
    debounceMs?: number;
    scheduleTimeout?: (callback: () => void, delayMs: number) => number;
    cancelTimeout?: (timeoutId: number) => void;
}

/**
 * Emits editing awareness whispers for the local user. Sends the full editing
 * snapshot (never values or keystrokes), debounces bursts of focus/blur
 * transitions, and dedupes identical snapshots so we do not spam the channel.
 */
export class EditingBroadcastController {
    private readonly selfUserId: number;

    private readonly sendEditing: (payload: EditingWhisperPayload) => void;

    private readonly debounceMs: number;

    private readonly scheduleTimeout: (
        callback: () => void,
        delayMs: number
    ) => number;

    private readonly cancelTimeout: (timeoutId: number) => void;

    private currentSnapshot: EditingItem[] = [];

    private lastSentSnapshot: EditingItem[] | null = null;

    private timeoutId: number | undefined;

    private disposed = false;

    constructor(options: EditingBroadcastControllerOptions) {
        this.selfUserId = options.selfUserId;
        this.sendEditing = options.sendEditing;
        this.debounceMs =
            options.debounceMs ?? DEFAULT_EDITING_BROADCAST_DEBOUNCE_MS;
        this.scheduleTimeout =
            options.scheduleTimeout ??
            ((callback, delayMs) => window.setTimeout(callback, delayMs));
        this.cancelTimeout =
            options.cancelTimeout ??
            ((timeoutId) => window.clearTimeout(timeoutId));
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
        this.currentSnapshot = [];
        this.lastSentSnapshot = null;
    }

    /**
     * Emits an empty snapshot (if others believe the local user is editing) and
     * clears all state. Use on unmount / teardown.
     */
    dispose(): void {
        this.cancelScheduledFlush();

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
    }
}
