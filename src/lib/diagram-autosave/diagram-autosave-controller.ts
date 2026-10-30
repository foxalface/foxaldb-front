import type { Diagram } from '@/lib/domain/diagram';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DatabaseType } from '@/lib/domain/database-type';
import { readDiagramContentHashFromApi } from '@/lib/api/diagram-content-hash';
import { updateDiagram } from '@/lib/api/diagrams';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { isStaleDiagramContentError } from './diagram-autosave-stale';

export const AUTOSAVE_DEBOUNCE_MS = 900;

type AutosaveSnapshotContent = Pick<
    Diagram,
    | 'name'
    | 'databaseType'
    | 'databaseEdition'
    | 'tables'
    | 'relationships'
    | 'dependencies'
    | 'areas'
    | 'customTypes'
    | 'notes'
>;

interface ObservedDiagram {
    diagramId: string;
    payload: string;
    diagram: Diagram;
}

export interface DiagramAutosaveStaleHandlers {
    refetchDiagram: (diagramId: string) => Promise<Diagram>;
    replaceAuthoritative: (diagram: Diagram) => Promise<void>;
}

const toAutosaveSnapshot = (diagram: {
    name: string;
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    tables: NonNullable<Diagram['tables']>;
    relationships: NonNullable<Diagram['relationships']>;
    dependencies: NonNullable<Diagram['dependencies']>;
    areas: NonNullable<Diagram['areas']>;
    customTypes: NonNullable<Diagram['customTypes']>;
    notes: NonNullable<Diagram['notes']>;
}): string => JSON.stringify(diagram satisfies AutosaveSnapshotContent);

export const diagramAutosavePayload = (diagram: Diagram): string =>
    toAutosaveSnapshot({
        name: diagram.name ?? 'Untitled diagram',
        databaseType: diagram.databaseType,
        databaseEdition: diagram.databaseEdition,
        tables: diagram.tables ?? [],
        relationships: diagram.relationships ?? [],
        dependencies: diagram.dependencies ?? [],
        areas: diagram.areas ?? [],
        customTypes: diagram.customTypes ?? [],
        notes: diagram.notes ?? [],
    });

/**
 * Generic autosave control. Callers can persist the current editor snapshot
 * immediately or mark an already-persisted diagram as clean.
 */
class DiagramAutosaveController {
    private timer: ReturnType<typeof setTimeout> | null = null;

    private tail: Promise<void> = Promise.resolve();

    private depth = 0;

    private epoch = 0;

    private enabled = false;

    private activeDiagramId: string | null = null;

    private authoritativeContentHash: string | null = null;

    private serverInitializedDiagramId: string | null = null;

    private lastSavedPayload: string | null = null;

    private discardPayload: string | null = null;

    private latest: ObservedDiagram | null = null;

    private staleHandlers: DiagramAutosaveStaleHandlers | null = null;

    private failureNotifier: (() => void) | null = null;

    private failureNotifiedForEpisode = false;

    setFailureNotifier(notifier: (() => void) | null): void {
        this.failureNotifier = notifier;
    }

    private notifySaveFailure(): void {
        if (this.failureNotifiedForEpisode || this.failureNotifier === null) {
            return;
        }

        this.failureNotifiedForEpisode = true;
        this.failureNotifier();
    }

    private clearSaveFailureEpisode(): void {
        this.failureNotifiedForEpisode = false;
    }

    setStaleHandlers(handlers: DiagramAutosaveStaleHandlers | null): void {
        this.staleHandlers = handlers;
    }

    setEnabled(enabled: boolean): void {
        if (this.enabled === enabled) {
            if (!enabled) {
                this.clearTimer();
            }

            return;
        }

        if (!enabled) {
            this.invalidateInFlight();
        }

        this.enabled = enabled;
    }

    initializeFromServer(diagramId: string, contentHash: string): void {
        if (
            this.activeDiagramId !== null &&
            this.activeDiagramId !== diagramId
        ) {
            this.invalidateInFlight();
        }

        this.serverInitializedDiagramId = diagramId;
        this.authoritativeContentHash = contentHash;
    }

    setAuthoritativeContentHash(diagramId: string, contentHash: string): void {
        if (this.activeDiagramId !== diagramId) {
            this.activeDiagramId = diagramId;
        }

        this.authoritativeContentHash = contentHash;
    }

    readAuthoritativeContentHash(): string | null {
        return this.authoritativeContentHash;
    }

    observe(diagram: Diagram, schedule: boolean): void {
        const diagramId = String(diagram.id);
        const payload = diagramAutosavePayload(diagram);

        if (
            this.activeDiagramId !== null &&
            this.activeDiagramId !== diagramId
        ) {
            this.invalidateInFlight();
        }

        this.latest = { diagramId, payload, diagram };

        if (this.activeDiagramId !== diagramId) {
            this.activeDiagramId = diagramId;
            this.lastSavedPayload = payload;

            if (this.serverInitializedDiagramId !== diagramId) {
                this.authoritativeContentHash = null;
            }

            this.clearTimer();
            return;
        }

        if (payload === this.lastSavedPayload) {
            this.clearTimer();
            return;
        }

        if (!this.enabled || !schedule) {
            this.clearTimer();
            return;
        }

        this.clearTimer();
        this.timer = setTimeout(() => {
            this.timer = null;
            void this.enqueue(() => this.saveLatestIfDirty()).catch(
                (error: unknown) => {
                    if (isStaleDiagramContentError(error)) {
                        return;
                    }

                    this.notifySaveFailure();
                    console.error('Failed to autosave diagram', error);
                }
            );
        }, AUTOSAVE_DEBOUNCE_MS);
    }

    clearTimer(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    /**
     * Ignores an in-flight completion. The HTTP request is not aborted.
     */
    private invalidateInFlight(): void {
        this.epoch += 1;
        this.clearTimer();
        this.clearSaveFailureEpisode();
    }

    /**
     * Drops a not-yet-started save. An in-flight request cannot be aborted;
     * its completion will not move the clean baseline or start another save.
     */
    cancelPending(): void {
        this.invalidateInFlight();
        this.discardPayload = this.latest?.payload ?? null;
    }

    /**
     * Session end: cancel the debounce and forget the online snapshot so it
     * cannot be flushed or retried. A request already awaiting the network
     * can still complete; its result is ignored and is not written to Dexie.
     */
    abandon(): void {
        this.invalidateInFlight();
        this.enabled = false;
        this.activeDiagramId = null;
        this.latest = null;
        this.lastSavedPayload = null;
        this.discardPayload = null;
    }

    acceptAuthoritative(diagram: Diagram, contentHash?: string): void {
        this.invalidateInFlight();
        this.discardPayload = null;
        const diagramId = String(diagram.id);
        const payload = diagramAutosavePayload(diagram);
        this.activeDiagramId = diagramId;
        this.lastSavedPayload = payload;
        this.latest = { diagramId, payload, diagram };

        if (contentHash !== undefined) {
            this.authoritativeContentHash = contentHash;
        }
    }

    baseline(): string | null {
        return this.lastSavedPayload;
    }

    async flush(): Promise<void> {
        this.clearTimer();

        if (!this.enabled || this.latest === null) {
            return;
        }

        if (this.depth === 0 && this.latest.payload === this.lastSavedPayload) {
            return;
        }

        await this.enqueue(() => this.saveLatestIfDirty());
    }

    reset(): void {
        this.invalidateInFlight();
        this.tail = Promise.resolve();
        this.depth = 0;
        this.enabled = false;
        this.activeDiagramId = null;
        this.authoritativeContentHash = null;
        this.serverInitializedDiagramId = null;
        this.lastSavedPayload = null;
        this.discardPayload = null;
        this.latest = null;
        this.staleHandlers = null;
    }

    private enqueue(task: () => Promise<void>): Promise<void> {
        this.depth += 1;
        const run = this.tail.then(task, task);
        this.tail = run.then(
            () => {
                this.depth -= 1;
            },
            () => {
                this.depth -= 1;
            }
        );

        return run;
    }

    private async handleStaleSave(
        diagramId: string,
        failedPayload: string
    ): Promise<void> {
        const handlers = this.staleHandlers;

        if (handlers === null) {
            return;
        }

        const diagram = await handlers.refetchDiagram(diagramId);

        if (this.latest?.payload === failedPayload) {
            await handlers.replaceAuthoritative(diagram);
            return;
        }
    }

    private async saveLatestIfDirty(): Promise<void> {
        const epoch = this.epoch;

        while (this.enabled && this.latest !== null) {
            if (epoch !== this.epoch) {
                return;
            }

            const state = this.latest;

            if (
                state.payload === this.lastSavedPayload ||
                state.payload === this.discardPayload
            ) {
                return;
            }

            if (state.diagramId !== this.activeDiagramId) {
                return;
            }

            if (!isValidBackendDiagramId(state.diagramId)) {
                return;
            }

            const baseContentHash = this.authoritativeContentHash;

            if (baseContentHash === null) {
                console.warn(
                    '[DiagramAutosave] Skipping save without authoritative content hash',
                    state.diagramId
                );
                return;
            }

            const failedPayload = state.payload;

            try {
                const response = await updateDiagram(state.diagramId, {
                    name: state.diagram.name ?? 'Untitled diagram',
                    content: state.diagram,
                    baseContentHash,
                });

                if (epoch !== this.epoch) {
                    return;
                }

                if (state.diagramId !== this.activeDiagramId) {
                    return;
                }

                const nextHash = readDiagramContentHashFromApi(response);

                if (nextHash !== null) {
                    this.authoritativeContentHash = nextHash;
                }

                this.lastSavedPayload = state.payload;
                this.clearSaveFailureEpisode();
            } catch (error: unknown) {
                if (isStaleDiagramContentError(error)) {
                    await this.handleStaleSave(state.diagramId, failedPayload);

                    if (epoch !== this.epoch) {
                        return;
                    }

                    throw error;
                }

                this.notifySaveFailure();
                throw error;
            }
        }
    }
}

const controller = new DiagramAutosaveController();

export const setDiagramAutosaveEnabled = (enabled: boolean): void => {
    controller.setEnabled(enabled);
};

export const configureDiagramAutosaveStaleHandlers = (
    handlers: DiagramAutosaveStaleHandlers | null
): void => {
    controller.setStaleHandlers(handlers);
};

export const configureDiagramAutosaveFailureNotifier = (
    notifier: (() => void) | null
): void => {
    controller.setFailureNotifier(notifier);
};

export const initializeDiagramAutosaveFromServer = (
    diagramId: string,
    contentHash: string
): void => {
    controller.initializeFromServer(diagramId, contentHash);
};

export const setDiagramAutosaveContentHash = (
    diagramId: string,
    contentHash: string
): void => {
    controller.setAuthoritativeContentHash(diagramId, contentHash);
};

export const readDiagramAutosaveContentHash = (): string | null =>
    controller.readAuthoritativeContentHash();

export const observeDiagramForAutosave = (
    diagram: Diagram,
    options: { schedule: boolean }
): void => {
    controller.observe(diagram, options.schedule);
};

export const clearScheduledDiagramAutosave = (): void => {
    controller.clearTimer();
};

export const cancelPendingDiagramAutosave = (): void => {
    controller.cancelPending();
};

export const abandonDiagramAutosave = (): void => {
    controller.abandon();
};

export const acceptAuthoritativeDiagram = (
    diagram: Diagram,
    contentHash?: string
): void => {
    controller.acceptAuthoritative(diagram, contentHash);
};

export const flushDiagramAutosave = (): Promise<void> => controller.flush();

export const readDiagramAutosaveBaseline = (): string | null =>
    controller.baseline();

export const resetDiagramAutosaveForTests = (): void => {
    controller.reset();
};
