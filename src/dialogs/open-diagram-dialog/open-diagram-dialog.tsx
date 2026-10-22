import { Button } from '@/components/button/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogInternalContent,
    DialogTitle,
} from '@/components/dialog/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/tabs/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConfig } from '@/hooks/use-config';
import { useDialog } from '@/hooks/use-dialog';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useStorage } from '@/hooks/use-storage';
import { getDiagrams } from '@/lib/api/diagrams';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { BaseDialogProps } from '../common/base-dialog-props';
import type { EntryFlowOpenDiagramActions } from '@/pages/editor-page/entry-flow-open-diagram-actions';
import {
    DEFAULT_OPEN_DIAGRAM_SORT,
    type OpenDiagramDeviceRow,
    type OpenDiagramOnlineRow,
    type OpenDiagramSortState,
    type OpenDiagramTab,
} from './open-diagram-list-types';
import {
    apiDiagramToOnlineRow,
    diagramToDeviceRow,
    remoteSummaryToOnlineRow,
} from './open-diagram-mappers';
import { sortOpenDiagramRows } from './open-diagram-sort';
import { OpenDiagramTable } from './open-diagram-table';

export interface OpenDiagramDialogProps extends BaseDialogProps {
    canClose?: boolean;
    entryOpenDiagramActions?: EntryFlowOpenDiagramActions;
}

export const OpenDiagramDialog: React.FC<OpenDiagramDialogProps> = ({
    dialog,
    canClose = true,
    entryOpenDiagramActions,
}) => {
    const { closeOpenDiagramDialog, openCreateDiagramDialog } = useDialog();
    const { t } = useTranslation();
    const { updateConfig } = useConfig();
    const { isAuthenticated } = useAuth();
    const { listDiagrams, listTables } = useStorage();
    const { loadDiagram } = useChartDB();
    const { clearDiagramAccess } = useDiagramAccess();
    const navigate = useNavigate();

    const [deviceRows, setDeviceRows] = useState<OpenDiagramDeviceRow[]>([]);
    const [onlineRows, setOnlineRows] = useState<OpenDiagramOnlineRow[]>([]);
    const [selectedDiagramId, setSelectedDiagramId] = useState<
        string | undefined
    >();
    const [activeTab, setActiveTab] = useState<OpenDiagramTab>(
        isAuthenticated ? 'online' : 'device'
    );
    const [deviceSort, setDeviceSort] = useState<OpenDiagramSortState>(
        DEFAULT_OPEN_DIAGRAM_SORT
    );
    const [onlineSort, setOnlineSort] = useState<OpenDiagramSortState>(
        DEFAULT_OPEN_DIAGRAM_SORT
    );

    const isEntryFlowOwned = entryOpenDiagramActions !== undefined;
    const effectiveCanClose = isEntryFlowOwned
        ? entryOpenDiagramActions.canClose
        : canClose;

    const fetchDeviceDiagrams = useCallback(async () => {
        const diagrams = await listDiagrams();
        const rows = await Promise.all(
            diagrams.map(async (diagram) => {
                const tables = await listTables(diagram.id);
                return diagramToDeviceRow(diagram, tables.length);
            })
        );
        setDeviceRows(rows);
    }, [listDiagrams, listTables]);

    const fetchOnlineDiagrams = useCallback(async () => {
        if (entryOpenDiagramActions) {
            setOnlineRows(
                entryOpenDiagramActions.diagrams.map(remoteSummaryToOnlineRow)
            );
            return;
        }

        if (!isAuthenticated) {
            setOnlineRows([]);
            return;
        }

        const diagramsFromApi = await getDiagrams();
        setOnlineRows(diagramsFromApi.map(apiDiagramToOnlineRow));
    }, [entryOpenDiagramActions, isAuthenticated]);

    const refreshLists = useCallback(async () => {
        await Promise.all([fetchDeviceDiagrams(), fetchOnlineDiagrams()]);
    }, [fetchDeviceDiagrams, fetchOnlineDiagrams]);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        setSelectedDiagramId(undefined);
        setActiveTab(isAuthenticated ? 'online' : 'device');
        setDeviceSort(DEFAULT_OPEN_DIAGRAM_SORT);
        setOnlineSort(DEFAULT_OPEN_DIAGRAM_SORT);

        void refreshLists();
    }, [dialog.open, isAuthenticated, refreshLists]);

    const sortedDeviceRows = useMemo(
        () => sortOpenDiagramRows(deviceRows, deviceSort),
        [deviceRows, deviceSort]
    );

    const sortedOnlineRows = useMemo(
        () => sortOpenDiagramRows(onlineRows, onlineSort),
        [onlineRows, onlineSort]
    );

    const openOnlineDiagram = useCallback(
        (diagramId: string) => {
            if (!diagramId) {
                return;
            }

            if (entryOpenDiagramActions) {
                entryOpenDiagramActions.onRemoteDiagramSelected(diagramId);
                return;
            }

            updateConfig({ config: { defaultDiagramId: diagramId } });
            navigate(`/diagrams/${diagramId}`);
        },
        [entryOpenDiagramActions, updateConfig, navigate]
    );

    const openLocalDiagram = useCallback(
        async (diagramId: string) => {
            if (!diagramId) {
                return;
            }

            clearDiagramAccess();
            const diagram = await loadDiagram(diagramId);

            if (!diagram) {
                return;
            }

            await updateConfig({ config: { defaultDiagramId: diagramId } });
            navigate(`/diagrams/${diagramId}`);
        },
        [clearDiagramAccess, loadDiagram, updateConfig, navigate]
    );

    const handleOpenConfirmed = useCallback(
        (diagramId: string, storage: OpenDiagramTab) => {
            if (storage === 'online') {
                openOnlineDiagram(diagramId);
            } else {
                void openLocalDiagram(diagramId);
            }

            if (!entryOpenDiagramActions) {
                closeOpenDiagramDialog();
            }
        },
        [
            openOnlineDiagram,
            openLocalDiagram,
            entryOpenDiagramActions,
            closeOpenDiagramDialog,
        ]
    );

    const handleRequestCreateDiagram = useCallback(() => {
        if (entryOpenDiagramActions) {
            entryOpenDiagramActions.onRequestRemoteDiagramCreate();
            return;
        }

        closeOpenDiagramDialog();
        openCreateDiagramDialog();
    }, [
        entryOpenDiagramActions,
        closeOpenDiagramDialog,
        openCreateDiagramDialog,
    ]);

    const footerOpenDisabled =
        !selectedDiagramId ||
        (activeTab === 'online' && !isAuthenticated) ||
        (activeTab === 'online' &&
            !onlineRows.some((row) => row.id === selectedDiagramId)) ||
        (activeTab === 'device' &&
            !deviceRows.some((row) => row.id === selectedDiagramId));

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open && effectiveCanClose) {
                    if (entryOpenDiagramActions) {
                        entryOpenDiagramActions.onRemoteDiagramSelectionCancelled();
                        return;
                    }

                    closeOpenDiagramDialog();
                }
            }}
        >
            <DialogContent
                className="flex h-[30rem] max-h-screen flex-col overflow-y-auto md:min-w-[80vw] xl:min-w-[55vw]"
                showClose={effectiveCanClose}
            >
                <DialogHeader>
                    <DialogTitle>{t('open_diagram_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('open_diagram_dialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <DialogInternalContent className="flex min-h-0 flex-1 flex-col">
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            setActiveTab(value as OpenDiagramTab)
                        }
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="device">
                                {t('open_diagram_dialog.tabs.device')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="online"
                                disabled={!isAuthenticated}
                                className="gap-1.5"
                            >
                                {!isAuthenticated ? (
                                    <Lock
                                        className="size-3.5 shrink-0"
                                        aria-hidden
                                    />
                                ) : null}
                                {t('open_diagram_dialog.tabs.online')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="device"
                            className="mt-3 min-h-0 flex-1 overflow-y-auto"
                        >
                            <OpenDiagramTable
                                tab="device"
                                rows={sortedDeviceRows}
                                sort={deviceSort}
                                onSortChange={setDeviceSort}
                                selectedDiagramId={selectedDiagramId}
                                onSelectDiagramId={setSelectedDiagramId}
                                onOpenDiagram={handleOpenConfirmed}
                                onLocalListChanged={fetchDeviceDiagrams}
                                onOnlineListChanged={fetchOnlineDiagrams}
                                localDiagramCount={deviceRows.length}
                                onlineDiagramCount={onlineRows.length}
                                isAuthenticated={isAuthenticated}
                                emptyMessage={t(
                                    'open_diagram_dialog.empty.device'
                                )}
                            />
                        </TabsContent>

                        <TabsContent
                            value="online"
                            className="mt-3 min-h-0 flex-1 overflow-y-auto"
                        >
                            {!isAuthenticated ? (
                                <p className="text-center text-sm text-muted-foreground">
                                    {t(
                                        'open_diagram_dialog.guest_online_disabled'
                                    )}
                                </p>
                            ) : (
                                <OpenDiagramTable
                                    tab="online"
                                    rows={sortedOnlineRows}
                                    sort={onlineSort}
                                    onSortChange={setOnlineSort}
                                    selectedDiagramId={selectedDiagramId}
                                    onSelectDiagramId={setSelectedDiagramId}
                                    onOpenDiagram={handleOpenConfirmed}
                                    onLocalListChanged={fetchDeviceDiagrams}
                                    onOnlineListChanged={fetchOnlineDiagrams}
                                    localDiagramCount={deviceRows.length}
                                    onlineDiagramCount={onlineRows.length}
                                    isAuthenticated={isAuthenticated}
                                    emptyMessage={t(
                                        'open_diagram_dialog.empty.online'
                                    )}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogInternalContent>

                <DialogFooter className="flex !justify-between gap-2">
                    {effectiveCanClose ? (
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                {t('open_diagram_dialog.cancel')}
                            </Button>
                        </DialogClose>
                    ) : (
                        <div />
                    )}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleRequestCreateDiagram}
                        >
                            {t('open_diagram_dialog.new_diagram')}
                        </Button>
                        <DialogClose asChild>
                            <Button
                                type="submit"
                                disabled={footerOpenDisabled}
                                onClick={() => {
                                    if (!selectedDiagramId) {
                                        return;
                                    }

                                    const storage =
                                        activeTab === 'device'
                                            ? 'device'
                                            : 'online';
                                    handleOpenConfirmed(
                                        selectedDiagramId,
                                        storage
                                    );
                                }}
                            >
                                {t('open_diagram_dialog.open')}
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
