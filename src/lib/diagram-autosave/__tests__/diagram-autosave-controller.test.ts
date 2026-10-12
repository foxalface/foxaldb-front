import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import { ApiError } from '@/lib/api/client';

const updateDiagram = vi.fn();

vi.mock('@/lib/api/diagrams', () => ({
    updateDiagram: (...args: unknown[]) => updateDiagram(...args),
}));

import {
    AUTOSAVE_DEBOUNCE_MS,
    acceptAuthoritativeDiagram,
    cancelPendingDiagramAutosave,
    configureDiagramAutosaveStaleHandlers,
    diagramAutosavePayload,
    flushDiagramAutosave,
    initializeDiagramAutosaveFromServer,
    observeDiagramForAutosave,
    readDiagramAutosaveBaseline,
    readDiagramAutosaveContentHash,
    resetDiagramAutosaveForTests,
    setDiagramAutosaveContentHash,
    setDiagramAutosaveEnabled,
} from '../diagram-autosave-controller';

const hashA = 'a'.repeat(64);
const hashB = 'b'.repeat(64);
const hashC = 'c'.repeat(64);

const diagram = (name: string, tableId = 'table-1', id = '42'): Diagram =>
    ({
        id,
        name,
        databaseType: DatabaseType.POSTGRESQL,
        tables: [
            {
                id: tableId,
                name: 'users',
                x: 10,
                y: 20,
                fields: [],
                indexes: [],
                color: '#8eb7ff',
                isView: false,
                createdAt: 0,
            },
        ],
        relationships: [],
        dependencies: [],
        areas: [],
        customTypes: [],
        notes: [],
        createdAt: new Date(0),
        updatedAt: new Date(0),
    }) as Diagram;

const flushMicrotasks = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
};

describe('diagram autosave flush', () => {
    beforeEach(() => {
        vi.useFakeTimers({
            toFake: ['setTimeout', 'clearTimeout'],
        });
        updateDiagram.mockReset();
        updateDiagram.mockResolvedValue({ id: 42, content_hash: hashB });
        resetDiagramAutosaveForTests();
        setDiagramAutosaveEnabled(true);
        initializeDiagramAutosaveFromServer('42', hashA);
    });

    afterEach(() => {
        resetDiagramAutosaveForTests();
        vi.useRealTimers();
    });

    it('stores the initial authoritative hash from server load', () => {
        expect(readDiagramAutosaveContentHash()).toBe(hashA);
    });

    it('resolves immediately when nothing is pending', async () => {
        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('Saved'), { schedule: true });

        await flushDiagramAutosave();

        expect(updateDiagram).not.toHaveBeenCalled();
    });

    it('runs a pending debounced save immediately and cancels the timer', async () => {
        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('Edited'), { schedule: true });

        const pending = flushDiagramAutosave();
        await flushMicrotasks();
        expect(updateDiagram).toHaveBeenCalledTimes(1);
        expect(updateDiagram.mock.calls[0]?.[1].baseContentHash).toBe(hashA);
        expect(updateDiagram.mock.calls[0]?.[1].content.name).toBe('Edited');
        await pending;

        await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
        expect(updateDiagram).toHaveBeenCalledTimes(1);
    });

    it('awaits an in-flight save', async () => {
        let release: () => void = () => undefined;
        updateDiagram.mockImplementation(
            () =>
                new Promise((resolve) => {
                    release = () => resolve({ id: 42, content_hash: hashB });
                })
        );
        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('Edited'), { schedule: true });
        await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
        expect(updateDiagram).toHaveBeenCalledTimes(1);

        let settled = false;
        const pending = flushDiagramAutosave().then(() => {
            settled = true;
        });
        await flushMicrotasks();
        expect(settled).toBe(false);
        release();
        await pending;
        expect(settled).toBe(true);
        expect(updateDiagram).toHaveBeenCalledTimes(1);
    });

    it('persists a newer snapshot queued during an in-flight save', async () => {
        let releaseFirst: () => void = () => undefined;
        updateDiagram.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    releaseFirst = () =>
                        resolve({ id: 42, content_hash: hashB });
                })
        );
        updateDiagram.mockResolvedValueOnce({ id: 42, content_hash: hashC });
        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('First'), { schedule: true });

        const pending = flushDiagramAutosave();
        await flushMicrotasks();
        expect(updateDiagram).toHaveBeenCalledTimes(1);
        observeDiagramForAutosave(diagram('Second'), { schedule: true });
        releaseFirst();
        await pending;

        expect(updateDiagram).toHaveBeenCalledTimes(2);
        expect(updateDiagram.mock.calls[1]?.[1].content.name).toBe('Second');
        expect(updateDiagram.mock.calls[1]?.[1].baseContentHash).toBe(hashB);
        expect(readDiagramAutosaveBaseline()).toBe(
            diagramAutosavePayload(diagram('Second'))
        );
        expect(readDiagramAutosaveContentHash()).toBe(hashC);
    });

    it('rejects flush when the save fails', async () => {
        updateDiagram.mockRejectedValueOnce(new Error('offline'));
        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('Edited'), { schedule: true });

        await expect(flushDiagramAutosave()).rejects.toThrow('offline');
        expect(readDiagramAutosaveBaseline()).toBe(
            diagramAutosavePayload(diagram('Saved'))
        );
    });

    it('marks an authoritative replacement clean and does not save it again', async () => {
        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('Edited'), { schedule: true });
        const merged = diagram('Merged', 'backend-id');

        acceptAuthoritativeDiagram(merged, hashB);
        observeDiagramForAutosave(merged, { schedule: true });
        await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
        await flushDiagramAutosave();

        expect(updateDiagram).not.toHaveBeenCalled();
        expect(readDiagramAutosaveBaseline()).toBe(
            diagramAutosavePayload(merged)
        );
        expect(readDiagramAutosaveContentHash()).toBe(hashB);
    });

    it('does not let a stale pending save fire after an authoritative replacement', async () => {
        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('Edited'), { schedule: true });
        cancelPendingDiagramAutosave();
        acceptAuthoritativeDiagram(diagram('Merged', 'backend-id'), hashB);

        await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
        await flushDiagramAutosave();

        expect(updateDiagram).not.toHaveBeenCalled();
    });

    it('does not retry the same payload after a stale 409', async () => {
        const refetchDiagram = vi.fn().mockResolvedValue(diagram('Server'));
        const replaceAuthoritative = vi.fn().mockResolvedValue(undefined);

        configureDiagramAutosaveStaleHandlers({
            refetchDiagram,
            replaceAuthoritative,
        });

        updateDiagram.mockRejectedValueOnce(
            new ApiError('stale', 409, { code: 'stale_content' })
        );

        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('Edited'), { schedule: true });

        await expect(flushDiagramAutosave()).rejects.toBeInstanceOf(ApiError);
        await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);

        expect(updateDiagram).toHaveBeenCalledTimes(1);
        expect(refetchDiagram).toHaveBeenCalledTimes(1);
        expect(replaceAuthoritative).toHaveBeenCalledTimes(1);
    });

    it('updates only the hash when local edits diverged from the stale payload', async () => {
        const refetchDiagram = vi
            .fn()
            .mockImplementation(async () => diagram('Server'));
        const replaceAuthoritative = vi.fn().mockResolvedValue(undefined);

        configureDiagramAutosaveStaleHandlers({
            refetchDiagram,
            replaceAuthoritative,
        });

        let release: () => void = () => undefined;
        updateDiagram.mockImplementationOnce(
            () =>
                new Promise((_, reject) => {
                    release = () =>
                        reject(
                            new ApiError('stale', 409, {
                                code: 'stale_content',
                            })
                        );
                })
        );

        observeDiagramForAutosave(diagram('Saved'), { schedule: false });
        observeDiagramForAutosave(diagram('Stale'), { schedule: true });
        const pending = flushDiagramAutosave();
        await flushMicrotasks();
        observeDiagramForAutosave(diagram('Newer local'), { schedule: true });
        setDiagramAutosaveContentHash('42', hashC);
        release();

        await expect(pending).rejects.toBeInstanceOf(ApiError);
        expect(replaceAuthoritative).not.toHaveBeenCalled();
        expect(readDiagramAutosaveContentHash()).toBe(hashC);
    });

    it('skips save without a server hash', async () => {
        resetDiagramAutosaveForTests();
        setDiagramAutosaveEnabled(true);
        observeDiagramForAutosave(diagram('Edited'), { schedule: true });

        await flushDiagramAutosave();

        expect(updateDiagram).not.toHaveBeenCalled();
    });
});
