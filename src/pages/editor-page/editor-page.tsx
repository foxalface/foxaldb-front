import React, { Suspense, useCallback, useEffect, useMemo } from 'react';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import { Toaster } from '@/components/toast/toaster';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useLocalConfig } from '@/hooks/use-local-config';
import { FullScreenLoaderProvider } from '@/context/full-screen-spinner-context/full-screen-spinner-provider';
import { LayoutProvider } from '@/context/layout-context/layout-provider';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { StorageProvider } from '@/context/storage-context/storage-provider';
import { ConfigProvider } from '@/context/config-context/config-provider';
import { RedoUndoStackProvider } from '@/context/history-context/redo-undo-stack-provider';
import { ChartDBEditorProvider } from './chartdb-editor-provider';
import { HistoryProvider } from '@/context/history-context/history-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { ReactFlowProvider } from '@xyflow/react';
import { ExportImageProvider } from '@/context/export-image-context/export-image-provider';
import { DialogProvider } from '@/context/dialog-context/dialog-provider';
import { KeyboardShortcutsProvider } from '@/context/keyboard-shortcuts-context/keyboard-shortcuts-provider';
import { Spinner } from '@/components/spinner/spinner';
import { Helmet } from 'react-helmet-async';
import { AlertProvider } from '@/context/alert-context/alert-provider';
import { CanvasProvider } from '@/context/canvas-context/canvas-provider';
import { HIDE_CHARTDB_CLOUD } from '@/lib/env';
import { useDiagramAccessListener } from './use-diagram-access-listener';
import { useDiagramAutosave } from './use-diagram-autosave';
import { useDiagramOperationSync } from './use-diagram-operation-sync';
import { useDiagramChannelLifecycle } from './use-diagram-channel-lifecycle';
import { useDiagramPresenceActivity } from './use-diagram-presence-activity';
import { useDiagramRealtime } from './use-diagram-realtime';
import { useDiagramReconnectRefresh } from './use-diagram-reconnect-refresh';
import { useEntryFlow, type UseEntryFlowResult } from '@/hooks/use-entry-flow';
import { EntryFlowDialogSyncMount } from './entry-flow-dialog-sync-mount';
import type { EntryFlowActiveDiagramDeletionActions } from './entry-flow-active-diagram-deletion-actions';
import type { EntryFlowCreateDiagramActions } from './entry-flow-create-diagram-actions';
import type { EntryFlowGuestMigrationActions } from './entry-flow-guest-migration-actions';
import type { EntryFlowOpenDiagramActions } from './entry-flow-open-diagram-actions';
import { DiffProvider } from '@/context/diff-context/diff-provider';
import { TopNavbarMock } from './top-navbar/top-navbar-mock';
import { DiagramFilterProvider } from '@/context/diagram-filter-context/diagram-filter-provider';
import { DiagramAccessProvider } from '@/context/diagram-access-context/diagram-access-provider';
import { EditingBroadcastProvider } from '@/context/editing-broadcast-context/editing-broadcast-provider';
import { RemoteEditingProvider } from '@/context/remote-editing-context/remote-editing-provider';
import { ConversationsProvider } from '@/context/conversations-context/conversations-provider';

const OPEN_STAR_US_AFTER_SECONDS = 30;
const SHOW_STAR_US_AGAIN_AFTER_DAYS = 1;

export const EditorDesktopLayoutLazy = React.lazy(
    () => import('./editor-desktop-layout')
);

export const EditorMobileLayoutLazy = React.lazy(
    () => import('./editor-mobile-layout')
);

const EditorPageContent: React.FC<
    {
        entryFlow: UseEntryFlowResult;
    } & EntryFlowActiveDiagramDeletionActions
> = ({ entryFlow, onActiveDiagramDeleted }) => {
    const { diagramName, currentDiagram } = useChartDB();
    const { openStarUsDialog } = useDialog();
    const { isMd: isDesktop } = useBreakpoint('md');
    const { starUsDialogLastOpen, setStarUsDialogLastOpen, githubRepoOpened } =
        useLocalConfig();
    const initialDiagram = entryFlow.initialDiagram;
    useDiagramAutosave();
    useDiagramAccessListener();
    useDiagramChannelLifecycle();
    useDiagramPresenceActivity();
    useDiagramRealtime();
    useDiagramReconnectRefresh();
    useDiagramOperationSync();

    useEffect(() => {
        if (HIDE_CHARTDB_CLOUD) {
            return;
        }

        if (!currentDiagram?.id || githubRepoOpened) {
            return;
        }

        if (
            new Date().getTime() - starUsDialogLastOpen >
            1000 * 60 * 60 * 24 * SHOW_STAR_US_AGAIN_AFTER_DAYS
        ) {
            const lastOpen = new Date().getTime();
            setStarUsDialogLastOpen(lastOpen);
            setTimeout(openStarUsDialog, OPEN_STAR_US_AFTER_SECONDS * 1000);
        }
    }, [
        currentDiagram?.id,
        githubRepoOpened,
        openStarUsDialog,
        setStarUsDialogLastOpen,
        starUsDialogLastOpen,
    ]);

    // Only restoringSession blocks the editor shell until auth session is resolved.
    const isEntrySessionRestoring = entryFlow.state.kind === 'restoringSession';

    return (
        <>
            <Helmet>
                <title>
                    {diagramName
                        ? `FoxalDB - ${diagramName} Diagram`
                        : 'FoxalDB - Visual Database Builder'}
                </title>
            </Helmet>
            {isEntrySessionRestoring ? (
                <section
                    className={`bg-background ${isDesktop ? 'h-screen w-screen' : 'h-dvh w-dvw'} flex select-none flex-col overflow-x-hidden`}
                >
                    <TopNavbarMock />
                    <div className="flex flex-1 items-center justify-center">
                        <Spinner size={isDesktop ? 'large' : 'medium'} />
                    </div>
                </section>
            ) : (
                <section
                    className={`bg-background ${isDesktop ? 'h-screen w-screen' : 'h-dvh w-dvw'} flex select-none flex-col overflow-x-hidden`}
                >
                    <Suspense
                        fallback={
                            <>
                                <TopNavbarMock />
                                <div className="flex flex-1 items-center justify-center">
                                    <Spinner
                                        size={isDesktop ? 'large' : 'medium'}
                                    />
                                </div>
                            </>
                        }
                    >
                        {isDesktop ? (
                            <EditorDesktopLayoutLazy
                                initialDiagram={initialDiagram}
                                onActiveDiagramDeleted={onActiveDiagramDeleted}
                            />
                        ) : (
                            <EditorMobileLayoutLazy
                                initialDiagram={initialDiagram}
                                onActiveDiagramDeleted={onActiveDiagramDeleted}
                            />
                        )}
                    </Suspense>
                </section>
            )}
            <Toaster />
        </>
    );
};

const EditorPageComponent: React.FC = () => {
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

    const entryCreateDiagramActions = useMemo(
        (): EntryFlowCreateDiagramActions | undefined =>
            entryFlow.dialog === 'createDiagram'
                ? {
                      target:
                          entryFlow.state.kind === 'creatingDiagram' &&
                          entryFlow.state.entrySource === 'guestContinuation'
                              ? 'guest'
                              : 'remote',
                      onDiagramCreated: (diagramId) =>
                          entryFlow.notifyDiagramCreated(diagramId),
                  }
                : undefined,
        [entryFlow]
    );

    const entryOpenDiagramActions = useMemo(
        (): EntryFlowOpenDiagramActions | undefined =>
            entryFlow.dialog === 'openDiagram' &&
            entryFlow.remoteDiagramSummaries !== undefined
                ? {
                      diagrams: entryFlow.remoteDiagramSummaries,
                      canClose: false,
                      onRemoteDiagramSelected: (diagramId) =>
                          entryFlow.notifyRemoteDiagramSelected(diagramId),
                      onRemoteDiagramSelectionCancelled: () =>
                          entryFlow.cancelRemoteDiagramSelection(),
                      onRequestRemoteDiagramCreate: () =>
                          entryFlow.requestRemoteDiagramCreate(),
                  }
                : undefined,
        [entryFlow]
    );

    const entryGuestMigrationActions = useMemo(
        (): EntryFlowGuestMigrationActions | undefined =>
            entryFlow.dialog === 'guestMigration'
                ? {
                      onAcceptMigration: entryFlow.acceptGuestMigration,
                      onDeclineMigration: entryFlow.declineGuestMigration,
                  }
                : undefined,
        [entryFlow]
    );

    const isGuestMigrationInProgress =
        entryFlow.state.kind === 'migratingGuestDiagram';

    const onActiveDiagramDeleted = useCallback(() => {
        entryFlow.notifyGuestActiveDiagramDeleted();
    }, [entryFlow]);

    return (
        <DialogProvider
            entryAuthActions={entryAuthActions}
            entryCreateDiagramActions={entryCreateDiagramActions}
            entryOpenDiagramActions={entryOpenDiagramActions}
            entryGuestMigrationActions={entryGuestMigrationActions}
            isGuestMigrationInProgress={isGuestMigrationInProgress}
        >
            <EntryFlowDialogSyncMount entryFlowDialog={entryFlow.dialog} />
            <KeyboardShortcutsProvider>
                <EditingBroadcastProvider>
                    <RemoteEditingProvider>
                        <ConversationsProvider>
                            <EditorPageContent
                                entryFlow={entryFlow}
                                onActiveDiagramDeleted={onActiveDiagramDeleted}
                            />
                        </ConversationsProvider>
                    </RemoteEditingProvider>
                </EditingBroadcastProvider>
            </KeyboardShortcutsProvider>
        </DialogProvider>
    );
};

export const EditorPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <FullScreenLoaderProvider>
                <StorageProvider>
                    <ConfigProvider>
                        <RedoUndoStackProvider>
                            <DiffProvider>
                                <DiagramAccessProvider>
                                    <ChartDBEditorProvider>
                                        {/*
                                          LayoutProvider sits under ChartDB so
                                          discussion navigation can reset on
                                          diagram identity changes without a
                                          provider cycle.
                                        */}
                                        <LayoutProvider>
                                            <DiagramFilterProvider>
                                                <HistoryProvider>
                                                    <ReactFlowProvider>
                                                        <CanvasProvider>
                                                            <ExportImageProvider>
                                                                <AlertProvider>
                                                                    <EditorPageComponent />
                                                                </AlertProvider>
                                                            </ExportImageProvider>
                                                        </CanvasProvider>
                                                    </ReactFlowProvider>
                                                </HistoryProvider>
                                            </DiagramFilterProvider>
                                        </LayoutProvider>
                                    </ChartDBEditorProvider>
                                </DiagramAccessProvider>
                            </DiffProvider>
                        </RedoUndoStackProvider>
                    </ConfigProvider>
                </StorageProvider>
            </FullScreenLoaderProvider>
        </ThemeProvider>
    </LocalConfigProvider>
);
