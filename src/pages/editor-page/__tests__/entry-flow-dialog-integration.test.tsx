import React, { useMemo } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntryFlowDialogSyncMount } from '@/pages/editor-page/entry-flow-dialog-sync-mount';
import { useEntryFlow } from '@/hooks/use-entry-flow';

const openAuthDialog = vi.fn();
const closeAuthDialog = vi.fn();
let useEntryFlowCallDepth = 0;
let useEntryFlowMaxCallDepth = 0;

const authState = {
    user: null as {
        id: number;
        first_name: string;
        last_name: string;
        full_name: string;
        email: string;
    } | null,
    isAuthenticated: false,
    isLoading: true,
};

const routeState = {
    diagramId: undefined as string | undefined,
};

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => authState,
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        useParams: () => routeState,
    };
});

vi.mock('@/hooks/use-dialog', () => ({
    useDialog: () => ({
        openAuthDialog,
        closeAuthDialog,
        openStarUsDialog: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-entry-flow', async (importOriginal) => {
    const actual = await importOriginal();
    const actualUseEntryFlow = (actual as { useEntryFlow: typeof useEntryFlow })
        .useEntryFlow;

    return {
        ...(actual as object),
        useEntryFlow: () => {
            useEntryFlowCallDepth += 1;
            useEntryFlowMaxCallDepth = Math.max(
                useEntryFlowMaxCallDepth,
                useEntryFlowCallDepth
            );
            const result = actualUseEntryFlow();
            useEntryFlowCallDepth -= 1;
            return result;
        },
    };
});

function EditorBootstrapProbe(): React.ReactElement {
    const entryFlow = useEntryFlow();

    const entryAuthActions = useMemo(
        () =>
            entryFlow.dialog === 'auth'
                ? {
                      onContinueAsGuest: entryFlow.continueAsGuest,
                      onLoginSuccess: () =>
                          entryFlow.notifyAuthenticationSucceeded('login'),
                      onRegistrationSuccess: () =>
                          entryFlow.notifyAuthenticationSucceeded(
                              'registration'
                          ),
                  }
                : undefined,
        [entryFlow]
    );

    return (
        <>
            <EntryFlowDialogSyncMount entryFlowDialog={entryFlow.dialog} />
            <div data-testid="entry-state">{entryFlow.state.kind}</div>
            <div data-testid="entry-dialog">{entryFlow.dialog ?? 'none'}</div>
            <div data-testid="entry-mode">
                {entryAuthActions ? 'entry' : 'manual'}
            </div>
            <button type="button" onClick={() => entryFlow.continueAsGuest()}>
                continue-guest
            </button>
            <button type="button" onClick={() => openAuthDialog()}>
                manual-open
            </button>
        </>
    );
}

const resetAuth = () => {
    authState.user = null;
    authState.isAuthenticated = false;
    authState.isLoading = true;
};

const completeAuthAsGuest = () => {
    authState.user = null;
    authState.isAuthenticated = false;
    authState.isLoading = false;
};

const completeAuthAsUser = () => {
    authState.user = {
        id: 1,
        first_name: 'Alexis',
        last_name: 'Renart',
        full_name: 'Alexis Renart',
        email: 'alexis@example.com',
    };
    authState.isAuthenticated = true;
    authState.isLoading = false;
};

describe('entry-flow auth dialog synchronization', () => {
    beforeEach(() => {
        resetAuth();
        routeState.diagramId = undefined;
        openAuthDialog.mockClear();
        closeAuthDialog.mockClear();
        useEntryFlowCallDepth = 0;
        useEntryFlowMaxCallDepth = 0;
    });

    it('uses a single nested useEntryFlow owner in the bootstrap fixture', async () => {
        const { rerender } = render(<EditorBootstrapProbe />);

        completeAuthAsGuest();
        rerender(<EditorBootstrapProbe />);

        await waitFor(() => {
            expect(useEntryFlowMaxCallDepth).toBe(1);
        });
    });

    it('opens auth dialog automatically for guest startup', async () => {
        const { getByTestId, rerender } = render(<EditorBootstrapProbe />);

        completeAuthAsGuest();
        rerender(<EditorBootstrapProbe />);

        await waitFor(() => {
            expect(getByTestId('entry-state').textContent).toBe(
                'awaitingGuestChoice'
            );
            expect(getByTestId('entry-mode').textContent).toBe('entry');
        });

        expect(openAuthDialog).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('does not open auth dialog for authenticated startup', async () => {
        const { getByTestId, rerender } = render(<EditorBootstrapProbe />);

        completeAuthAsUser();
        rerender(<EditorBootstrapProbe />);

        await waitFor(() => {
            expect(getByTestId('entry-state').textContent).toBe(
                'loadingRemoteDiagrams'
            );
        });

        expect(openAuthDialog).not.toHaveBeenCalled();
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });

    it('closes auth dialog when leaving awaitingGuestChoice', async () => {
        const { getByTestId, getByRole, rerender } = render(
            <EditorBootstrapProbe />
        );

        completeAuthAsGuest();
        rerender(<EditorBootstrapProbe />);

        await waitFor(() => {
            expect(getByTestId('entry-dialog').textContent).toBe('auth');
        });

        openAuthDialog.mockClear();

        await act(async () => {
            getByRole('button', { name: 'continue-guest' }).click();
        });

        await waitFor(() => {
            expect(getByTestId('entry-dialog').textContent).toBe('none');
            expect(getByTestId('entry-mode').textContent).toBe('manual');
        });

        expect(closeAuthDialog).toHaveBeenCalledTimes(1);
    });

    it('allows manual navbar auth opening when entry flow does not own the dialog', async () => {
        const { getByTestId, getByRole, rerender } = render(
            <EditorBootstrapProbe />
        );

        completeAuthAsGuest();
        rerender(<EditorBootstrapProbe />);

        await waitFor(() => {
            expect(getByTestId('entry-state').textContent).toBe(
                'awaitingGuestChoice'
            );
        });

        openAuthDialog.mockClear();
        closeAuthDialog.mockClear();

        await act(async () => {
            getByRole('button', { name: 'continue-guest' }).click();
        });

        await waitFor(() => {
            expect(getByTestId('entry-dialog').textContent).toBe('none');
        });

        closeAuthDialog.mockClear();

        await act(async () => {
            getByRole('button', { name: 'manual-open' }).click();
        });

        expect(openAuthDialog).toHaveBeenCalledTimes(1);
        expect(closeAuthDialog).not.toHaveBeenCalled();
    });
});
