import type { Diagram } from '@/lib/domain/diagram';
import { getClientId } from '@/lib/realtime/client-id';

const CONTENT_HASH = /^[a-f0-9]{64}$/;

export const APPLY_SCHEMA_MERGE_ACTION = 'apply_schema_merge';

/**
 * Compact DiagramOperation broadcast for a completed schema merge.
 * `data` is a hash and timestamp. It is not diagram content.
 */
export interface ApplySchemaMergeRealtimeEvent {
    action: typeof APPLY_SCHEMA_MERGE_ACTION;
    resultContentHash: string;
    updatedAt: string | null;
    userId: number;
    clientId: string;
    sentAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseApplySchemaMergeEvent = (
    value: unknown
): ApplySchemaMergeRealtimeEvent | null => {
    if (!isRecord(value) || value.action !== APPLY_SCHEMA_MERGE_ACTION) {
        return null;
    }

    if (!isRecord(value.data)) {
        return null;
    }

    if (
        typeof value.data.resultContentHash !== 'string' ||
        !CONTENT_HASH.test(value.data.resultContentHash)
    ) {
        return null;
    }

    if (
        value.data.updatedAt !== null &&
        typeof value.data.updatedAt !== 'string'
    ) {
        return null;
    }

    if (
        typeof value.userId !== 'number' ||
        typeof value.clientId !== 'string'
    ) {
        return null;
    }

    if (value.clientId.length === 0 || typeof value.sentAt !== 'string') {
        return null;
    }

    return {
        action: APPLY_SCHEMA_MERGE_ACTION,
        resultContentHash: value.data.resultContentHash,
        updatedAt: value.data.updatedAt,
        userId: value.userId,
        clientId: value.clientId,
        sentAt: value.sentAt,
    };
};

export const isApplySchemaMergeAction = (value: unknown): boolean =>
    isRecord(value) && value.action === APPLY_SCHEMA_MERGE_ACTION;

export interface SchemaMergeRefreshHandlers {
    fetchDiagram: (diagramId: string) => Promise<Diagram>;
    replaceDiagram: (diagram: Diagram) => Promise<void>;
    cancelPendingAutosave: () => void;
}

interface RefreshState {
    diagramId: string | null;
    appliedHash: string | null;
    latestHash: string | null;
    inFlight: Promise<void> | null;
}

const state: RefreshState = {
    diagramId: null,
    appliedHash: null,
    latestHash: null,
    inFlight: null,
};

export const noteSchemaMergeAuthoritativeHash = (
    diagramId: string,
    resultContentHash: string
): void => {
    state.diagramId = diagramId;
    state.appliedHash = resultContentHash;
    state.latestHash = resultContentHash;
};

export const resetSchemaMergeRefresh = (): void => {
    state.diagramId = null;
    state.appliedHash = null;
    state.latestHash = null;
    state.inFlight = null;
};

const drain = async (
    diagramId: string,
    handlers: SchemaMergeRefreshHandlers
): Promise<void> => {
    while (
        state.latestHash !== null &&
        state.latestHash !== state.appliedHash
    ) {
        const target = state.latestHash;
        const diagram = await handlers.fetchDiagram(diagramId);

        if (state.diagramId !== diagramId) {
            return;
        }

        await handlers.replaceDiagram(diagram);

        if (state.diagramId !== diagramId) {
            return;
        }

        state.appliedHash = target;
    }
};

/**
 * Remote peers refetch the stored diagram once. The actor already applied
 * the HTTP body, so a broadcast with the current client id is ignored.
 * A hash already loaded is ignored. Overlapping events share one request
 * and continue until the newest hash has been fetched.
 */
export const handleApplySchemaMergeEvent = (
    event: ApplySchemaMergeRealtimeEvent,
    diagramId: string,
    handlers: SchemaMergeRefreshHandlers
): Promise<void> => {
    if (event.clientId === getClientId()) {
        return Promise.resolve();
    }

    if (state.diagramId !== diagramId) {
        state.diagramId = diagramId;
        state.appliedHash = null;
        state.latestHash = null;
        state.inFlight = null;
    }

    if (event.resultContentHash === state.appliedHash) {
        return Promise.resolve();
    }

    state.latestHash = event.resultContentHash;
    handlers.cancelPendingAutosave();

    if (state.inFlight) {
        return state.inFlight;
    }

    const run = drain(diagramId, handlers).finally(() => {
        if (state.inFlight === run) {
            state.inFlight = null;
        }
    });
    state.inFlight = run;

    return run;
};
