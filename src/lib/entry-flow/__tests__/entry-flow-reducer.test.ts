import { describe, expect, it } from 'vitest';
import { entryFlowReducer, initialEntryFlowState } from '../entry-flow-reducer';
import { selectEntryFlowDialog } from '../entry-flow-selectors';
import type {
    EntryFlowEvent,
    EntryFlowState,
    RemoteDiagramSummary,
} from '../entry-flow-types';

const reduce = (state: EntryFlowState, event: EntryFlowEvent): EntryFlowState =>
    entryFlowReducer(state, event);

const reduceChain = (
    events: EntryFlowEvent[],
    initial = initialEntryFlowState()
): EntryFlowState => {
    let state = initial;

    for (const event of events) {
        state = reduce(state, event);
    }

    return state;
};

const remoteSummaries = (ids: string[]): RemoteDiagramSummary[] =>
    ids.map((id) => ({
        id,
        name: `Diagram ${id}`,
        tablesCount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
    }));

describe('entryFlowReducer — initial session', () => {
    it('initial state is restoringSession', () => {
        expect(initialEntryFlowState()).toEqual({ kind: 'restoringSession' });
    });

    it('unauthenticated session → awaitingGuestChoice', () => {
        const state = reduce(initialEntryFlowState(), {
            type: 'SESSION_UNAUTHENTICATED',
        });

        expect(state).toEqual({ kind: 'awaitingGuestChoice' });
    });

    it('unauthenticated session with route id → awaitingGuestChoice', () => {
        const state = reduce(initialEntryFlowState(), {
            type: 'SESSION_UNAUTHENTICATED',
            routeDiagramId: '42',
        });

        expect(state).toEqual({ kind: 'awaitingGuestChoice' });
    });

    it('authenticated session without route id → loadingRemoteDiagrams', () => {
        const state = reduce(initialEntryFlowState(), {
            type: 'SESSION_AUTHENTICATED',
        });

        expect(state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'startup',
        });
    });

    it('authenticated session with route id → openingDiagram directRoute', () => {
        const state = reduce(initialEntryFlowState(), {
            type: 'SESSION_AUTHENTICATED',
            routeDiagramId: '42',
        });

        expect(state).toEqual({
            kind: 'openingDiagram',
            diagramId: '42',
            diagramSource: 'directRoute',
            entrySource: 'startup',
        });
    });
});

describe('entryFlowReducer — guest', () => {
    const awaitingGuest: EntryFlowState = { kind: 'awaitingGuestChoice' };

    it('continue as guest → checkingLocalDiagram', () => {
        const state = reduce(awaitingGuest, { type: 'CONTINUE_AS_GUEST' });

        expect(state).toEqual({ kind: 'checkingLocalDiagram' });
    });

    it('local diagram found → openingDiagram with local source and guestContinuation', () => {
        const state = reduceChain(
            [
                { type: 'CONTINUE_AS_GUEST' },
                { type: 'LOCAL_DIAGRAM_FOUND', diagramId: 'guest-abc' },
            ],
            awaitingGuest
        );

        expect(state).toEqual({
            kind: 'openingDiagram',
            diagramId: 'guest-abc',
            diagramSource: 'local',
            entrySource: 'guestContinuation',
        });
    });

    it('no local diagram → creatingDiagram with guestContinuation', () => {
        const state = reduceChain([{ type: 'LOCAL_DIAGRAM_NOT_FOUND' }], {
            kind: 'checkingLocalDiagram',
        });

        expect(state).toEqual({
            kind: 'creatingDiagram',
            entrySource: 'guestContinuation',
        });
    });

    it('local lookup failure → recoverableError with guestContinuation', () => {
        const state = reduce(
            { kind: 'checkingLocalDiagram' },
            {
                type: 'LOCAL_DIAGRAM_CHECK_FAILED',
                messageKey: 'entry_flow.errors.load_local_failed',
            }
        );

        expect(state).toEqual({
            kind: 'recoverableError',
            error: {
                kind: 'localDiagramCheck',
                messageKey: 'entry_flow.errors.load_local_failed',
            },
            entrySource: 'guestContinuation',
        });
    });

    it('retry after local failure → checkingLocalDiagram', () => {
        const state = reduceChain(
            [
                {
                    type: 'LOCAL_DIAGRAM_CHECK_FAILED',
                    messageKey: 'entry_flow.errors.load_local_failed',
                },
                { type: 'RETRY' },
            ],
            { kind: 'checkingLocalDiagram' }
        );

        expect(state).toEqual({ kind: 'checkingLocalDiagram' });
    });

    it('guest active diagram deleted from ready → creatingDiagram with guestContinuation', () => {
        const state = reduce(
            { kind: 'ready' },
            { type: 'GUEST_ACTIVE_DIAGRAM_DELETED' }
        );

        expect(state).toEqual({
            kind: 'creatingDiagram',
            entrySource: 'guestContinuation',
        });
    });

    it('guest active diagram deleted is ignored outside ready', () => {
        const states: EntryFlowState[] = [
            { kind: 'awaitingGuestChoice' },
            { kind: 'checkingLocalDiagram' },
            { kind: 'creatingDiagram', entrySource: 'guestContinuation' },
            {
                kind: 'openingDiagram',
                diagramId: 'guest-1',
                diagramSource: 'local',
                entrySource: 'guestContinuation',
            },
            {
                kind: 'recoverableError',
                error: { kind: 'diagramOpen' },
                entrySource: 'guestContinuation',
            },
        ];

        for (const state of states) {
            expect(
                reduce(state, { type: 'GUEST_ACTIVE_DIAGRAM_DELETED' })
            ).toEqual(state);
        }
    });

    it('replacement diagram after guest deletion follows DIAGRAM_CREATED → openingDiagram → ready', () => {
        const state = reduceChain(
            [
                { type: 'GUEST_ACTIVE_DIAGRAM_DELETED' },
                { type: 'DIAGRAM_CREATED', diagramId: 'guest-new' },
                { type: 'DIAGRAM_OPENED' },
            ],
            { kind: 'ready' }
        );

        expect(state).toEqual({ kind: 'ready' });
    });
});

describe('entryFlowReducer — authenticated', () => {
    const awaitingGuest: EntryFlowState = { kind: 'awaitingGuestChoice' };

    it('login success leaves the guest gate without migrating', () => {
        const state = reduce(awaitingGuest, {
            type: 'AUTHENTICATION_SUCCEEDED',
            entrySource: 'login',
        });

        expect(state).toEqual({
            kind: 'resolvingAuthContinuation',
            entrySource: 'login',
        });
    });

    it('registration success uses the same non-migrating gate', () => {
        const state = reduce(awaitingGuest, {
            type: 'AUTHENTICATION_SUCCEEDED',
            entrySource: 'registration',
        });

        expect(state).toEqual({
            kind: 'resolvingAuthContinuation',
            entrySource: 'registration',
        });
    });

    it('ready login does not change entry state by itself', () => {
        const state = reduce(
            { kind: 'ready' },
            {
                type: 'AUTHENTICATION_SUCCEEDED',
                entrySource: 'login',
            }
        );

        expect(state).toEqual({ kind: 'ready' });
    });

    it('open-online-diagram continuation opens that id from ready', () => {
        const state = reduce(
            { kind: 'ready' },
            {
                type: 'AUTH_CONTINUATION_OPEN_ONLINE_DIAGRAM',
                diagramId: '123',
            }
        );

        expect(state).toEqual({
            kind: 'openingDiagram',
            diagramId: '123',
            diagramSource: 'directRoute',
            entrySource: 'login',
        });
    });

    it('startup continuation without a device route loads the online list', () => {
        const resolving = reduce(awaitingGuest, {
            type: 'AUTHENTICATION_SUCCEEDED',
            entrySource: 'registration',
        });

        expect(
            reduce(resolving, { type: 'AUTH_CONTINUATION_SHOW_ONLINE_LIST' })
        ).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'registration',
        });
    });

    it('device route login keeps the local id until continuation opens it', () => {
        const awaiting = reduce(initialEntryFlowState(), {
            type: 'SESSION_UNAUTHENTICATED',
            requestedDeviceDiagramId: 'local-abc',
        });

        const resolving = reduce(awaiting, {
            type: 'AUTHENTICATION_SUCCEEDED',
            entrySource: 'login',
        });

        expect(resolving).toEqual({
            kind: 'resolvingAuthContinuation',
            entrySource: 'login',
            requestedDeviceDiagramId: 'local-abc',
        });

        expect(
            reduce(resolving, {
                type: 'AUTH_CONTINUATION_OPEN_DEVICE_DIAGRAM',
                diagramId: 'local-abc',
            })
        ).toEqual({
            kind: 'openingDiagram',
            diagramId: 'local-abc',
            diagramSource: 'directRoute',
            entrySource: 'login',
        });
    });

    it('continue as guest opens the requested device route, not the first diagram', () => {
        const awaiting = reduce(initialEntryFlowState(), {
            type: 'SESSION_UNAUTHENTICATED',
            requestedDeviceDiagramId: 'local-keep',
        });

        expect(reduce(awaiting, { type: 'CONTINUE_AS_GUEST' })).toEqual({
            kind: 'openingDiagram',
            diagramId: 'local-keep',
            diagramSource: 'local',
            entrySource: 'guestContinuation',
        });
    });

    it('REMOTE_DIAGRAMS_FOUND stores provided summaries as domain objects', () => {
        const summaries = remoteSummaries(['1', '2']);

        const state = reduce(
            { kind: 'loadingRemoteDiagrams', entrySource: 'startup' },
            { type: 'REMOTE_DIAGRAMS_FOUND', diagrams: summaries }
        );

        expect(state).toEqual({
            kind: 'selectingRemoteDiagram',
            entrySource: 'startup',
            diagrams: summaries,
        });
        expect(
            state.kind === 'selectingRemoteDiagram' && state.diagrams[0]
        ).toEqual(summaries[0]);
        expect(
            state.kind === 'selectingRemoteDiagram' &&
                typeof state.diagrams[0] === 'object' &&
                !Array.isArray(state.diagrams[0])
        ).toBe(true);
    });

    it('no remote diagrams → creatingDiagram preserving entrySource', () => {
        const state = reduce(
            { kind: 'loadingRemoteDiagrams', entrySource: 'registration' },
            { type: 'NO_REMOTE_DIAGRAMS' }
        );

        expect(state).toEqual({
            kind: 'creatingDiagram',
            entrySource: 'registration',
        });
    });

    it('remote load failure → recoverableError preserving login entrySource', () => {
        const state = reduce(
            { kind: 'loadingRemoteDiagrams', entrySource: 'login' },
            {
                type: 'REMOTE_DIAGRAMS_LOAD_FAILED',
                messageKey: 'entry_flow.errors.load_remote_failed',
            }
        );

        expect(state).toEqual({
            kind: 'recoverableError',
            error: {
                kind: 'remoteDiagramLoad',
                messageKey: 'entry_flow.errors.load_remote_failed',
            },
            entrySource: 'login',
        });
    });

    it('remote load failure preserves registration entrySource', () => {
        const state = reduce(
            { kind: 'loadingRemoteDiagrams', entrySource: 'registration' },
            { type: 'REMOTE_DIAGRAMS_LOAD_FAILED' }
        );

        expect(state.kind === 'recoverableError' && state.entrySource).toBe(
            'registration'
        );
    });

    it('retry after remote failure preserves entrySource', () => {
        const state = reduceChain(
            [
                {
                    type: 'REMOTE_DIAGRAMS_LOAD_FAILED',
                    messageKey: 'entry_flow.errors.load_remote_failed',
                },
                { type: 'RETRY' },
            ],
            { kind: 'loadingRemoteDiagrams', entrySource: 'login' }
        );

        expect(state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'login',
        });
    });
});

describe('entryFlowReducer — selection and creation', () => {
    it('selected remote diagram → openingDiagram preserving entrySource', () => {
        const state = reduce(
            {
                kind: 'selectingRemoteDiagram',
                entrySource: 'startup',
                diagrams: remoteSummaries(['10', '20']),
            },
            { type: 'REMOTE_DIAGRAM_SELECTED', diagramId: '10' }
        );

        expect(state).toEqual({
            kind: 'openingDiagram',
            diagramId: '10',
            diagramSource: 'remote',
            entrySource: 'startup',
        });
    });

    it('created diagram → openingDiagram preserving entrySource', () => {
        const state = reduce(
            { kind: 'creatingDiagram', entrySource: 'registration' },
            { type: 'DIAGRAM_CREATED', diagramId: '99' }
        );

        expect(state).toEqual({
            kind: 'openingDiagram',
            diagramId: '99',
            diagramSource: 'created',
            entrySource: 'registration',
        });
    });

    it('opening success → ready', () => {
        const state = reduce(
            {
                kind: 'openingDiagram',
                diagramId: '1',
                diagramSource: 'remote',
                entrySource: 'login',
            },
            { type: 'DIAGRAM_OPENED' }
        );

        expect(state).toEqual({ kind: 'ready' });
    });

    it('opening failure → recoverableError with openingContext and entrySource', () => {
        const opening: EntryFlowState = {
            kind: 'openingDiagram',
            diagramId: '7',
            diagramSource: 'directRoute',
            entrySource: 'startup',
        };

        const state = reduce(opening, {
            type: 'DIAGRAM_OPEN_FAILED',
            messageKey: 'entry_flow.errors.open_diagram_failed',
        });

        expect(state).toEqual({
            kind: 'recoverableError',
            error: {
                kind: 'diagramOpen',
                messageKey: 'entry_flow.errors.open_diagram_failed',
            },
            entrySource: 'startup',
            openingContext: {
                diagramId: '7',
                diagramSource: 'directRoute',
            },
        });
    });

    it('opening failure preserves guestContinuation entrySource', () => {
        const state = reduce(
            {
                kind: 'openingDiagram',
                diagramId: 'local-1',
                diagramSource: 'local',
                entrySource: 'guestContinuation',
            },
            { type: 'DIAGRAM_OPEN_FAILED' }
        );

        expect(state.kind === 'recoverableError' && state.entrySource).toBe(
            'guestContinuation'
        );
    });

    it('retry opening retains diagram context and entrySource', () => {
        const state = reduceChain(
            [
                {
                    type: 'DIAGRAM_OPEN_FAILED',
                    messageKey: 'entry_flow.errors.open_diagram_failed',
                },
                { type: 'RETRY' },
            ],
            {
                kind: 'openingDiagram',
                diagramId: '7',
                diagramSource: 'local',
                entrySource: 'guestContinuation',
            }
        );

        expect(state).toEqual({
            kind: 'openingDiagram',
            diagramId: '7',
            diagramSource: 'local',
            entrySource: 'guestContinuation',
        });
    });
});

describe('entryFlowReducer — recoverableError entrySource', () => {
    it('every recoverableError transition includes mandatory entrySource', () => {
        const errors: EntryFlowState[] = [
            reduce(initialEntryFlowState(), {
                type: 'SESSION_RESTORE_FAILED',
            }),
            reduce(
                { kind: 'checkingLocalDiagram' },
                {
                    type: 'LOCAL_DIAGRAM_CHECK_FAILED',
                }
            ),
            reduce(
                { kind: 'loadingRemoteDiagrams', entrySource: 'startup' },
                { type: 'REMOTE_DIAGRAMS_LOAD_FAILED' }
            ),
            reduce(
                {
                    kind: 'openingDiagram',
                    diagramId: '1',
                    diagramSource: 'remote',
                    entrySource: 'login',
                },
                { type: 'DIAGRAM_OPEN_FAILED' }
            ),
        ];

        for (const state of errors) {
            expect(state.kind).toBe('recoverableError');
            if (state.kind === 'recoverableError') {
                expect(state.entrySource).toBeDefined();
            }
        }
    });
});

describe('entryFlowReducer — session end', () => {
    const onlineLeaveStates: EntryFlowState[] = [
        { kind: 'loadingRemoteDiagrams', entrySource: 'startup' },
        {
            kind: 'selectingRemoteDiagram',
            entrySource: 'startup',
            diagrams: remoteSummaries(['1']),
        },
        { kind: 'creatingDiagram', entrySource: 'login' },
        {
            kind: 'openingDiagram',
            diagramId: '5',
            diagramSource: 'remote',
            entrySource: 'startup',
        },
        { kind: 'ready' },
        {
            kind: 'recoverableError',
            error: { kind: 'remoteDiagramLoad' },
            entrySource: 'startup',
        },
    ];

    it.each(onlineLeaveStates)(
        'online session end from %o → checkingLocalDiagram',
        (fromState) => {
            const state = reduce(fromState, { type: 'ONLINE_SESSION_ENDED' });

            expect(state).toEqual({ kind: 'checkingLocalDiagram' });
            expect(selectEntryFlowDialog(state)).toBeNull();
        }
    );

    it('device session end from ready stays ready without an auth dialog', () => {
        const ready: EntryFlowState = { kind: 'ready' };
        const state = reduce(ready, { type: 'DEVICE_SESSION_ENDED' });

        expect(state).toBe(ready);
        expect(selectEntryFlowDialog(state)).toBeNull();
    });

    it('device session end from an in-progress open becomes ready', () => {
        const state = reduce(
            {
                kind: 'openingDiagram',
                diagramId: 'local-1',
                diagramSource: 'local',
                entrySource: 'guestContinuation',
            },
            { type: 'DEVICE_SESSION_ENDED' }
        );

        expect(state).toEqual({ kind: 'ready' });
    });

    it('stale remote result after online session end is ignored', () => {
        const afterEnd = reduce(
            { kind: 'loadingRemoteDiagrams', entrySource: 'startup' },
            { type: 'ONLINE_SESSION_ENDED' }
        );

        const state = reduce(afterEnd, {
            type: 'REMOTE_DIAGRAMS_FOUND',
            diagrams: remoteSummaries(['1']),
        });

        expect(state).toEqual({ kind: 'checkingLocalDiagram' });
    });

    it('stale local result after device session end is ignored', () => {
        const afterEnd = reduce(
            { kind: 'checkingLocalDiagram' },
            { type: 'DEVICE_SESSION_ENDED' }
        );

        const state = reduce(afterEnd, {
            type: 'LOCAL_DIAGRAM_FOUND',
            diagramId: 'local-1',
        });

        expect(state).toEqual({ kind: 'ready' });
    });

    it('stale open-complete event after online session end is ignored', () => {
        const afterEnd = reduce(
            {
                kind: 'openingDiagram',
                diagramId: '3',
                diagramSource: 'remote',
                entrySource: 'startup',
            },
            { type: 'ONLINE_SESSION_ENDED' }
        );

        const state = reduce(afterEnd, { type: 'DIAGRAM_OPENED' });

        expect(state).toEqual({ kind: 'checkingLocalDiagram' });
    });

    it('online session end then a missing device diagram reaches guest create', () => {
        const state = reduce(
            reduce({ kind: 'ready' }, { type: 'ONLINE_SESSION_ENDED' }),
            { type: 'LOCAL_DIAGRAM_NOT_FOUND' }
        );

        expect(state).toEqual({
            kind: 'creatingDiagram',
            entrySource: 'guestContinuation',
        });
    });
});

describe('entryFlowReducer — invalid events', () => {
    it('LOCAL_DIAGRAM_FOUND outside checkingLocalDiagram does nothing', () => {
        const states: EntryFlowState[] = [
            initialEntryFlowState(),
            { kind: 'awaitingGuestChoice' },
            { kind: 'loadingRemoteDiagrams', entrySource: 'startup' },
            { kind: 'ready' },
        ];

        for (const state of states) {
            const next = reduce(state, {
                type: 'LOCAL_DIAGRAM_FOUND',
                diagramId: 'x',
            });

            expect(next).toBe(state);
        }
    });

    it('REMOTE_DIAGRAMS_FOUND outside loadingRemoteDiagrams does nothing', () => {
        const states: EntryFlowState[] = [
            { kind: 'awaitingGuestChoice' },
            {
                kind: 'selectingRemoteDiagram',
                entrySource: 'startup',
                diagrams: remoteSummaries(['1']),
            },
            { kind: 'ready' },
        ];

        for (const state of states) {
            const next = reduce(state, {
                type: 'REMOTE_DIAGRAMS_FOUND',
                diagrams: remoteSummaries(['1']),
            });

            expect(next).toBe(state);
        }
    });

    it('DIAGRAM_OPENED outside openingDiagram does nothing', () => {
        const states: EntryFlowState[] = [
            { kind: 'creatingDiagram', entrySource: 'startup' },
            { kind: 'ready' },
            { kind: 'checkingLocalDiagram' },
        ];

        for (const state of states) {
            const next = reduce(state, { type: 'DIAGRAM_OPENED' });

            expect(next).toBe(state);
        }
    });

    it('RETRY outside recoverableError does nothing', () => {
        const states: EntryFlowState[] = [
            initialEntryFlowState(),
            { kind: 'awaitingGuestChoice' },
            { kind: 'ready' },
        ];

        for (const state of states) {
            const next = reduce(state, { type: 'RETRY' });

            expect(next).toBe(state);
        }
    });

    it('RESET always returns fresh restoringSession', () => {
        const states: EntryFlowState[] = [
            { kind: 'awaitingGuestChoice' },
            { kind: 'ready' },
            {
                kind: 'recoverableError',
                error: { kind: 'diagramOpen' },
                entrySource: 'login',
                openingContext: {
                    diagramId: '1',
                    diagramSource: 'remote',
                },
            },
        ];

        for (const state of states) {
            const next = reduce(state, { type: 'RESET' });

            expect(next).toEqual({ kind: 'restoringSession' });
        }
    });

    it('error recovery uses RETRY not RESET', () => {
        const afterFailure = reduce(
            { kind: 'loadingRemoteDiagrams', entrySource: 'registration' },
            { type: 'REMOTE_DIAGRAMS_LOAD_FAILED' }
        );

        const afterRetry = reduce(afterFailure, { type: 'RETRY' });

        expect(afterRetry).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'registration',
        });
        expect(afterRetry).not.toEqual({ kind: 'restoringSession' });
    });
});

describe('entryFlowReducer — session restore failure', () => {
    it('SESSION_RESTORE_FAILED → recoverableError with startup entrySource', () => {
        const state = reduce(initialEntryFlowState(), {
            type: 'SESSION_RESTORE_FAILED',
            messageKey: 'entry_flow.errors.session_restore_failed',
        });

        expect(state).toEqual({
            kind: 'recoverableError',
            error: {
                kind: 'sessionRestore',
                messageKey: 'entry_flow.errors.session_restore_failed',
            },
            entrySource: 'startup',
        });
    });

    it('retry after session restore failure → restoringSession via RETRY', () => {
        const state = reduceChain([
            {
                type: 'SESSION_RESTORE_FAILED',
                messageKey: 'entry_flow.errors.session_restore_failed',
            },
            { type: 'RETRY' },
        ]);

        expect(state).toEqual({ kind: 'restoringSession' });
    });
});

describe('entryFlowReducer — authenticated remote selection', () => {
    const selecting: EntryFlowState = {
        kind: 'selectingRemoteDiagram',
        entrySource: 'startup',
        diagrams: remoteSummaries(['1', '2']),
    };

    it('REMOTE_DIAGRAM_SELECTION_CANCELLED → loadingRemoteDiagrams', () => {
        const state = reduce(selecting, {
            type: 'REMOTE_DIAGRAM_SELECTION_CANCELLED',
        });

        expect(state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'startup',
        });
    });

    it('REMOTE_DIAGRAM_CREATE_REQUESTED → creatingDiagram', () => {
        const state = reduce(selecting, {
            type: 'REMOTE_DIAGRAM_CREATE_REQUESTED',
        });

        expect(state).toEqual({
            kind: 'creatingDiagram',
            entrySource: 'startup',
        });
    });

    it('ROUTE_DIAGRAM_REQUESTED from ready → openingDiagram directRoute', () => {
        const state = reduce(
            { kind: 'ready' },
            {
                type: 'ROUTE_DIAGRAM_REQUESTED',
                diagramId: '42',
            }
        );

        expect(state).toEqual({
            kind: 'openingDiagram',
            diagramId: '42',
            diagramSource: 'directRoute',
            entrySource: 'startup',
        });
    });

    it('ACCESS_DENIED_RECOVERY from openingDiagram → loadingRemoteDiagrams', () => {
        const state = reduce(
            {
                kind: 'openingDiagram',
                diagramId: '1',
                diagramSource: 'directRoute',
                entrySource: 'login',
            },
            { type: 'ACCESS_DENIED_RECOVERY' }
        );

        expect(state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'login',
        });
    });
});
