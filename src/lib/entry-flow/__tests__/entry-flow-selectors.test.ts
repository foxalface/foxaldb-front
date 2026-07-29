import { describe, expect, it } from 'vitest';
import {
    selectEntryFlowBlocking,
    selectEntryFlowDialog,
    selectEntryFlowReady,
} from '../entry-flow-selectors';
import type { EntryFlowState } from '../entry-flow-types';

const allStates: EntryFlowState[] = [
    { kind: 'restoringSession' },
    { kind: 'awaitingGuestChoice' },
    { kind: 'checkingLocalDiagram' },
    { kind: 'loadingRemoteDiagrams', entrySource: 'startup' },
    {
        kind: 'selectingRemoteDiagram',
        entrySource: 'startup',
        diagrams: [{ id: '1' }],
    },
    { kind: 'creatingDiagram', entrySource: 'guestContinuation' },
    {
        kind: 'openingDiagram',
        diagramId: '1',
        diagramSource: 'remote',
        entrySource: 'startup',
    },
    { kind: 'ready' },
    {
        kind: 'recoverableError',
        error: { kind: 'localDiagramCheck' },
        entrySource: 'guestContinuation',
    },
];

describe('selectEntryFlowDialog', () => {
    it('only awaitingGuestChoice derives auth dialog', () => {
        for (const state of allStates) {
            const dialog = selectEntryFlowDialog(state);

            if (state.kind === 'awaitingGuestChoice') {
                expect(dialog).toBe('auth');
            } else {
                expect(dialog).not.toBe('auth');
            }
        }
    });

    it('only selectingRemoteDiagram derives openDiagram dialog', () => {
        for (const state of allStates) {
            const dialog = selectEntryFlowDialog(state);

            if (state.kind === 'selectingRemoteDiagram') {
                expect(dialog).toBe('openDiagram');
            } else {
                expect(dialog).not.toBe('openDiagram');
            }
        }
    });

    it('only creatingDiagram derives createDiagram dialog', () => {
        for (const state of allStates) {
            const dialog = selectEntryFlowDialog(state);

            if (state.kind === 'creatingDiagram') {
                expect(dialog).toBe('createDiagram');
            } else {
                expect(dialog).not.toBe('createDiagram');
            }
        }
    });

    it('no state derives more than one dialog', () => {
        for (const state of allStates) {
            const dialog = selectEntryFlowDialog(state);

            if (dialog === null) {
                expect(dialog).toBeNull();
            } else {
                expect(['auth', 'openDiagram', 'createDiagram']).toContain(
                    dialog
                );
            }
        }
    });
});

describe('selectEntryFlowBlocking', () => {
    const blockingStates: EntryFlowState[] = [
        { kind: 'restoringSession' },
        { kind: 'checkingLocalDiagram' },
        { kind: 'loadingRemoteDiagrams', entrySource: 'startup' },
        {
            kind: 'openingDiagram',
            diagramId: '1',
            diagramSource: 'local',
            entrySource: 'guestContinuation',
        },
    ];

    const nonBlockingStates: EntryFlowState[] = [
        { kind: 'awaitingGuestChoice' },
        {
            kind: 'selectingRemoteDiagram',
            entrySource: 'startup',
            diagrams: [{ id: '1' }],
        },
        { kind: 'creatingDiagram', entrySource: 'startup' },
        { kind: 'ready' },
        {
            kind: 'recoverableError',
            error: { kind: 'remoteDiagramLoad' },
            entrySource: 'startup',
        },
    ];

    it('blocking selector matches intended states', () => {
        for (const state of blockingStates) {
            expect(selectEntryFlowBlocking(state)).toBe(true);
        }

        for (const state of nonBlockingStates) {
            expect(selectEntryFlowBlocking(state)).toBe(false);
        }
    });

    it('recoverableError is not blocking', () => {
        expect(
            selectEntryFlowBlocking({
                kind: 'recoverableError',
                error: { kind: 'diagramOpen' },
                entrySource: 'login',
            })
        ).toBe(false);
    });
});

describe('selectEntryFlowReady', () => {
    it('ready selector is true only for ready', () => {
        for (const state of allStates) {
            const ready = selectEntryFlowReady(state);

            if (state.kind === 'ready') {
                expect(ready).toBe(true);
            } else {
                expect(ready).toBe(false);
            }
        }
    });
});
