import { Button } from '@/components/button/button';
import { DiagramIcon } from '@/components/diagram-icon/diagram-icon';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/table/table';
import { useConfig } from '@/hooks/use-config';
import { useDialog } from '@/hooks/use-dialog';
import { getDiagrams, type DiagramApiResource } from '@/lib/api/diagrams';
import type { Diagram } from '@/lib/domain/diagram';
import type { RemoteDiagramSummary } from '@/lib/entry-flow';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { useDebounce } from '@/hooks/use-debounce';
import { DiagramRowActionsMenu } from './diagram-row-actions-menu/diagram-row-actions-menu';
import type { EntryFlowOpenDiagramActions } from '@/pages/editor-page/entry-flow-open-diagram-actions';

const remoteSummaryToDiagram = (summary: RemoteDiagramSummary): Diagram =>
    ({
        id: summary.id,
        name: summary.name,
        createdAt: new Date(summary.createdAt || 0),
        updatedAt: new Date(summary.updatedAt || 0),
        tables: Array.from({ length: summary.tablesCount }),
        databaseType: summary.databaseType,
        databaseEdition: summary.databaseEdition,
    }) as Diagram;

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
    const navigate = useNavigate();
    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [selectedDiagramId, setSelectedDiagramId] = useState<
        string | undefined
    >();

    const isEntryFlowOwned = entryOpenDiagramActions !== undefined;
    const effectiveCanClose = isEntryFlowOwned
        ? entryOpenDiagramActions.canClose
        : canClose;

    const entryDiagrams = useMemo(
        () =>
            entryOpenDiagramActions?.diagrams.map(remoteSummaryToDiagram) ?? [],
        [entryOpenDiagramActions?.diagrams]
    );

    const fetchDiagrams = useCallback(async () => {
        const diagramsFromApi = await getDiagrams();

        const backendDiagrams = diagramsFromApi.map(
            (diagram: DiagramApiResource): Diagram =>
                ({
                    id: String(diagram.id),
                    name: diagram.name,
                    createdAt: new Date(diagram.created_at ?? 0),
                    updatedAt: new Date(diagram.updated_at ?? 0),
                    tables: Array.from({
                        length: diagram.tables_count ?? 0,
                    }),
                    databaseType: diagram.database_type,
                    databaseEdition: diagram.database_edition,
                }) as Diagram
        );

        setDiagrams(backendDiagrams);
    }, []);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        setSelectedDiagramId(undefined);

        if (isEntryFlowOwned) {
            setDiagrams(entryDiagrams);
            return;
        }

        fetchDiagrams();
    }, [dialog.open, fetchDiagrams, isEntryFlowOwned, entryDiagrams]);

    const openDiagram = useCallback(
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

    const handleOpenConfirmed = useCallback(
        (diagramId: string) => {
            openDiagram(diagramId);

            if (!entryOpenDiagramActions) {
                closeOpenDiagramDialog();
            }
        },
        [openDiagram, entryOpenDiagramActions, closeOpenDiagramDialog]
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

    const handleRowKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTableRowElement>) => {
            const element = e.target as HTMLElement;
            const diagramId = element.getAttribute('data-diagram-id');
            const selectionIndexAttr = element.getAttribute(
                'data-selection-index'
            );

            if (!diagramId || !selectionIndexAttr) return;

            const selectionIndex = parseInt(selectionIndexAttr, 10);

            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    handleOpenConfirmed(diagramId);
                    break;
                case 'ArrowDown': {
                    e.preventDefault();

                    (
                        document.querySelector(
                            `[data-selection-index="${selectionIndex + 1}"]`
                        ) as HTMLElement
                    )?.focus();
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();

                    (
                        document.querySelector(
                            `[data-selection-index="${selectionIndex - 1}"]`
                        ) as HTMLElement
                    )?.focus();
                    break;
                }
            }
        },
        [handleOpenConfirmed]
    );

    const onFocusHandler = useDebounce(
        (diagramId: string) => setSelectedDiagramId(diagramId),
        50
    );

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
                <DialogInternalContent>
                    <div className="flex flex-1 items-center justify-center">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead />
                                    <TableHead>
                                        {t(
                                            'open_diagram_dialog.table_columns.name'
                                        )}
                                    </TableHead>
                                    <TableHead className="hidden items-center sm:inline-flex">
                                        {t(
                                            'open_diagram_dialog.table_columns.created_at'
                                        )}
                                    </TableHead>
                                    <TableHead>
                                        {t(
                                            'open_diagram_dialog.table_columns.last_modified'
                                        )}
                                    </TableHead>
                                    <TableHead className="text-center">
                                        {t(
                                            'open_diagram_dialog.table_columns.tables_count'
                                        )}
                                    </TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {diagrams.map((diagram, index) => (
                                    <TableRow
                                        key={diagram.id}
                                        data-state={`${selectedDiagramId === diagram.id ? 'selected' : ''}`}
                                        data-diagram-id={diagram.id}
                                        data-selection-index={index}
                                        tabIndex={0}
                                        onFocus={() =>
                                            onFocusHandler(diagram.id)
                                        }
                                        className="focus:bg-accent focus:outline-none"
                                        onClick={(e) => {
                                            switch (e.detail) {
                                                case 1:
                                                    setSelectedDiagramId(
                                                        diagram.id
                                                    );
                                                    break;
                                                case 2:
                                                    handleOpenConfirmed(
                                                        diagram.id
                                                    );
                                                    break;
                                                default:
                                                    setSelectedDiagramId(
                                                        diagram.id
                                                    );
                                            }
                                        }}
                                        onKeyDown={handleRowKeyDown}
                                    >
                                        <TableCell className="table-cell">
                                            <div className="flex justify-center">
                                                <DiagramIcon
                                                    databaseType={
                                                        diagram.databaseType
                                                    }
                                                    databaseEdition={
                                                        diagram.databaseEdition
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>{diagram.name}</TableCell>
                                        <TableCell className="hidden items-center sm:table-cell">
                                            {diagram.createdAt.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {diagram.updatedAt.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {diagram.tables?.length}
                                        </TableCell>
                                        <TableCell className="items-center p-0 pr-1 text-right">
                                            <DiagramRowActionsMenu
                                                diagram={diagram}
                                                onOpen={() => {
                                                    handleOpenConfirmed(
                                                        diagram.id
                                                    );
                                                }}
                                                onDuplicate={() => {
                                                    closeOpenDiagramDialog();
                                                }}
                                                numberOfDiagrams={
                                                    diagrams.length
                                                }
                                                refetch={fetchDiagrams}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
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
                            {t('open_diagram_dialog.new_database')}
                        </Button>
                        <DialogClose asChild>
                            <Button
                                type="submit"
                                disabled={!selectedDiagramId}
                                onClick={() =>
                                    handleOpenConfirmed(selectedDiagramId ?? '')
                                }
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
