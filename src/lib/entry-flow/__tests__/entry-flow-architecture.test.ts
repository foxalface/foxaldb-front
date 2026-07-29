import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { entryFlowReducer, initialEntryFlowState } from '../entry-flow-reducer';
import type { EntryFlowEvent, EntryFlowState } from '../entry-flow-types';

const reduce = (state: EntryFlowState, event: EntryFlowEvent): EntryFlowState =>
    entryFlowReducer(state, event);

const frontendSrcRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../..'
);

const readSrcFile = (relativePath: string): string =>
    readFileSync(resolve(frontendSrcRoot, relativePath), 'utf8');

const productionUseEntryFlowMatches = (): string[] =>
    readSrcFile('pages/editor-page/editor-page.tsx').match(/useEntryFlow\(/g) ??
    [];

describe('entry-flow architecture validation', () => {
    it('has exactly one production useEntryFlow() call site', () => {
        expect(productionUseEntryFlowMatches()).toHaveLength(1);
    });

    it('does not reference removed useDiagramLoader', () => {
        const editorPage = readSrcFile('pages/editor-page/editor-page.tsx');

        expect(editorPage).not.toContain('useDiagramLoader');
        expect(editorPage).not.toContain('allowsLegacyAuthenticatedLoader');
    });

    it('routes authenticated remote list through authenticated resolution hook', () => {
        const hookSource = readSrcFile(
            'hooks/use-entry-flow-authenticated-resolution.ts'
        );

        expect(hookSource).toContain('getDiagrams');
        expect(hookSource).toContain('loadingRemoteDiagrams');
    });

    it('routes guest local resolution through guest resolution hook only', () => {
        const hookSource = readSrcFile(
            'hooks/use-entry-flow-guest-resolution.ts'
        );

        expect(hookSource).toContain('checkingLocalDiagram');
        expect(hookSource).toContain('guestContinuation');
    });

    it('routes guest migration through guest migration hook only', () => {
        const hookSource = readSrcFile(
            'hooks/use-entry-flow-guest-migration.ts'
        );

        expect(hookSource).toContain('checkingGuestMigration');
        expect(hookSource).toContain('migratingGuestDiagram');
    });

    it('syncs entry dialogs only through useEntryFlowDialogSync', () => {
        const syncSource = readSrcFile('hooks/use-entry-flow-dialog-sync.ts');

        expect(syncSource).toContain('openDiagram');
        expect(syncSource).toContain('createDiagram');
        expect(syncSource).toContain('guestMigration');
        expect(syncSource).toContain('auth');
    });
});

describe('entry-flow reducer reachability', () => {
    it('covers primary startup paths to ready', () => {
        const guestReady = reduce(
            reduce(
                reduce(
                    reduce(initialEntryFlowState(), {
                        type: 'SESSION_UNAUTHENTICATED',
                    }),
                    { type: 'CONTINUE_AS_GUEST' }
                ),
                { type: 'LOCAL_DIAGRAM_NOT_FOUND' }
            ),
            { type: 'DIAGRAM_CREATED', diagramId: 'guest-1' }
        );

        expect(guestReady.kind).toBe('openingDiagram');

        const afterGuestOpen = reduce(guestReady, { type: 'DIAGRAM_OPENED' });

        expect(afterGuestOpen).toEqual({ kind: 'ready' });
    });

    it('covers authenticated startup path to selectingRemoteDiagram', () => {
        const afterSession = reduce(initialEntryFlowState(), {
            type: 'SESSION_AUTHENTICATED',
        });

        expect(afterSession.kind).toBe('loadingRemoteDiagrams');

        const afterList = reduce(afterSession, {
            type: 'REMOTE_DIAGRAMS_FOUND',
            diagrams: [
                {
                    id: '1',
                    name: 'Diagram 1',
                    tablesCount: 0,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z',
                },
            ],
        });

        expect(afterList.kind).toBe('selectingRemoteDiagram');
    });

    it('covers direct authenticated route without list state', () => {
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

    it('covers access-denied recovery back to remote list loading', () => {
        const state = reduce(
            {
                kind: 'openingDiagram',
                diagramId: '9',
                diagramSource: 'directRoute',
                entrySource: 'startup',
            },
            { type: 'ACCESS_DENIED_RECOVERY' }
        );

        expect(state).toEqual({
            kind: 'loadingRemoteDiagrams',
            entrySource: 'startup',
        });
    });
});
