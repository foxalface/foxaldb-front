import { describe, expect, it } from 'vitest';
import { entryFlowReducer } from '../entry-flow-reducer';
import type { EntryFlowEvent, EntryFlowState } from '../entry-flow-types';

const reduce = (state: EntryFlowState, event: EntryFlowEvent): EntryFlowState =>
    entryFlowReducer(state, event);

describe('entryFlowReducer — guest migration', () => {
    it('authentication succeeded from awaiting guest → checkingGuestMigration', () => {
        const state = reduce(
            { kind: 'awaitingGuestChoice' },
            { type: 'AUTHENTICATION_SUCCEEDED', entrySource: 'login' }
        );

        expect(state).toEqual({
            kind: 'checkingGuestMigration',
            entrySource: 'login',
        });
    });

    it('guest session authenticated from ready → checkingGuestMigration', () => {
        const state = reduce(
            { kind: 'ready' },
            { type: 'GUEST_SESSION_AUTHENTICATED', entrySource: 'login' }
        );

        expect(state).toEqual({
            kind: 'checkingGuestMigration',
            entrySource: 'login',
        });
    });

    it('local guest diagram found → askingGuestMigration', () => {
        const state = reduce(
            { kind: 'checkingGuestMigration', entrySource: 'registration' },
            { type: 'GUEST_MIGRATION_LOCAL_FOUND', diagramId: 'guest-1' }
        );

        expect(state).toEqual({
            kind: 'askingGuestMigration',
            entrySource: 'registration',
            localDiagramId: 'guest-1',
        });
    });

    it('no local guest diagram → loadingRemoteDiagrams', () => {
        const state = reduce(
            { kind: 'checkingGuestMigration', entrySource: 'login' },
            { type: 'GUEST_MIGRATION_LOCAL_NOT_FOUND' }
        );

        expect(state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'login',
        });
    });

    it('migration accepted → migratingGuestDiagram', () => {
        const state = reduce(
            {
                kind: 'askingGuestMigration',
                entrySource: 'login',
                localDiagramId: 'guest-1',
            },
            { type: 'GUEST_MIGRATION_ACCEPTED' }
        );

        expect(state).toEqual({
            kind: 'migratingGuestDiagram',
            entrySource: 'login',
            localDiagramId: 'guest-1',
        });
    });

    it('migration declined → loadingRemoteDiagrams', () => {
        const state = reduce(
            {
                kind: 'askingGuestMigration',
                entrySource: 'login',
                localDiagramId: 'guest-1',
            },
            { type: 'GUEST_MIGRATION_DECLINED' }
        );

        expect(state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'login',
        });
    });

    it('migration succeeded → openingDiagram migrated', () => {
        const state = reduce(
            {
                kind: 'migratingGuestDiagram',
                entrySource: 'login',
                localDiagramId: 'guest-1',
                remoteDiagramId: '42',
            },
            { type: 'GUEST_MIGRATION_SUCCEEDED', remoteDiagramId: '42' }
        );

        expect(state).toEqual({
            kind: 'openingDiagram',
            diagramId: '42',
            diagramSource: 'migrated',
            entrySource: 'login',
        });
    });

    it('migration failed → loadingRemoteDiagrams', () => {
        const state = reduce(
            {
                kind: 'migratingGuestDiagram',
                entrySource: 'login',
                localDiagramId: 'guest-1',
            },
            { type: 'GUEST_MIGRATION_FAILED' }
        );

        expect(state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'login',
        });
    });

    it('migration cleanup failed → ready', () => {
        const state = reduce(
            {
                kind: 'migratingGuestDiagram',
                entrySource: 'login',
                localDiagramId: 'guest-1',
                remoteDiagramId: '42',
            },
            { type: 'GUEST_MIGRATION_CLEANUP_FAILED', remoteDiagramId: '42' }
        );

        expect(state).toEqual({ kind: 'ready' });
    });

    it('guest active diagram deleted from ready remains unchanged in migration states', () => {
        const states: EntryFlowState[] = [
            { kind: 'checkingGuestMigration', entrySource: 'login' },
            {
                kind: 'askingGuestMigration',
                entrySource: 'login',
                localDiagramId: 'guest-1',
            },
            {
                kind: 'migratingGuestDiagram',
                entrySource: 'login',
                localDiagramId: 'guest-1',
            },
        ];

        for (const state of states) {
            expect(
                reduce(state, { type: 'GUEST_ACTIVE_DIAGRAM_DELETED' })
            ).toEqual(state);
        }
    });
});
