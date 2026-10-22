import { Button } from '@/components/button/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import {
    SidePanelSectionTabsList,
    SidePanelSectionTabsTrigger,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import { Tabs, TabsContent } from '@/components/tabs/tabs';
import { OPEN_DIAGRAM_DIALOG_CONTENT_CLASS } from './open-diagram-dialog-layout';
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
import { Cloud, Laptop, Lock } from 'lucide-react';
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
import type { DiagramAccessRole } from '@/lib/api/diagrams';
import {
    DEFAULT_OPEN_DIAGRAM_ROLE_FILTER,
    filterOnlineRowsByRole,
    isOpenDiagramRoleFilterActive,
    setOpenDiagramRoleFilterRole,
    type OpenDiagramRoleFilterState,
} from './open-diagram-role-filter';
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
    const [onlineRoleFilter, setOnlineRoleFilter] =
        useState<OpenDiagramRoleFilterState>(DEFAULT_OPEN_DIAGRAM_ROLE_FILTER);

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
        setOnlineRoleFilter(DEFAULT_OPEN_DIAGRAM_ROLE_FILTER);

        void refreshLists();
    }, [dialog.open, isAuthenticated, refreshLists]);

    const sortedDeviceRows = useMemo(
        () => sortOpenDiagramRows(deviceRows, deviceSort),
        [deviceRows, deviceSort]
    );

    const filteredOnlineRows = useMemo(
        () => filterOnlineRowsByRole(onlineRows, onlineRoleFilter),
        [onlineRows, onlineRoleFilter]
    );

    const sortedOnlineRows = useMemo(
        () => sortOpenDiagramRows(filteredOnlineRows, onlineSort),
        [filteredOnlineRows, onlineSort]
    );

    const handleOnlineRoleFilterChange = useCallback(
        (role: DiagramAccessRole, checked: boolean) => {
            setOnlineRoleFilter((current) => {
                const next = setOpenDiagramRoleFilterRole(
                    current,
                    role,
                    checked
                );
                const nextRows = filterOnlineRowsByRole(onlineRows, next);
                if (
                    selectedDiagramId !== undefined &&
                    !nextRows.some((row) => row.id === selectedDiagramId)
                ) {
                    setSelectedDiagramId(undefined);
                }
                return next;
            });
        },
        [onlineRows, selectedDiagramId]
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
            !sortedOnlineRows.some((row) => row.id === selectedDiagramId)) ||
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
                className={OPEN_DIAGRAM_DIALOG_CONTENT_CLASS}
                showClose={effectiveCanClose}
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle>{t('open_diagram_dialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('open_diagram_dialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-1">
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            setActiveTab(value as OpenDiagramTab)
                        }
                        className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    >
                        <SidePanelSectionTabsList className="shrink-0">
                            <SidePanelSectionTabsTrigger value="device">
                                <Laptop
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                {t('open_diagram_dialog.tabs.device')}
                            </SidePanelSectionTabsTrigger>
                            <SidePanelSectionTabsTrigger
                                value="online"
                                disabled={!isAuthenticated}
                            >
                                <Cloud
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                {!isAuthenticated ? (
                                    <Lock
                                        className="size-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                ) : null}
                                {t('open_diagram_dialog.tabs.online')}
                            </SidePanelSectionTabsTrigger>
                        </SidePanelSectionTabsList>

                        <TabsContent
                            value="device"
                            className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=inactive]:hidden"
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
                                emptyTitle={t(
                                    'open_diagram_dialog.empty.device'
                                )}
                            />
                        </TabsContent>

                        <TabsContent
                            value="online"
                            className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=inactive]:hidden"
                        >
                            {!isAuthenticated ? (
                                <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-md border border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
                                    {t(
                                        'open_diagram_dialog.guest_online_disabled'
                                    )}
                                </div>
                            ) : (
                                <OpenDiagramTable
                                    tab="online"
                                    rows={sortedOnlineRows}
                                    sort={onlineSort}
                                    onSortChange={setOnlineSort}
                                    roleFilter={onlineRoleFilter}
                                    onRoleFilterChange={
                                        handleOnlineRoleFilterChange
                                    }
                                    selectedDiagramId={selectedDiagramId}
                                    onSelectDiagramId={setSelectedDiagramId}
                                    onOpenDiagram={handleOpenConfirmed}
                                    onLocalListChanged={fetchDeviceDiagrams}
                                    onOnlineListChanged={fetchOnlineDiagrams}
                                    localDiagramCount={deviceRows.length}
                                    onlineDiagramCount={onlineRows.length}
                                    isAuthenticated={isAuthenticated}
                                    emptyTitle={
                                        onlineRows.length > 0 &&
                                        isOpenDiagramRoleFilterActive(
                                            onlineRoleFilter
                                        ) &&
                                        sortedOnlineRows.length === 0
                                            ? t(
                                                  'open_diagram_dialog.empty.online_role_filter'
                                              )
                                            : t(
                                                  'open_diagram_dialog.empty.online'
                                              )
                                    }
                                    emptyFilterActive={
                                        onlineRows.length > 0 &&
                                        isOpenDiagramRoleFilterActive(
                                            onlineRoleFilter
                                        ) &&
                                        sortedOnlineRows.length === 0
                                    }
                                    onClearRoleFilter={() =>
                                        setOnlineRoleFilter(
                                            DEFAULT_OPEN_DIAGRAM_ROLE_FILTER
                                        )
                                    }
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="flex shrink-0 !justify-between gap-2">
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
