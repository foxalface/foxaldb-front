import { DiagramIcon } from '@/components/diagram-icon/diagram-icon';
import { DiagramRoleIcon } from '@/components/diagram-role-icon/diagram-role-icon';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/table/table';
import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type {
    OpenDiagramRow,
    OpenDiagramSortColumn,
    OpenDiagramSortState,
    OpenDiagramTab,
} from './open-diagram-list-types';
import {
    sortDirectionForColumn,
    toggleOpenDiagramSort,
} from './open-diagram-sort';
import { LocalDiagramRowActionsMenu } from './diagram-row-actions-menu/local-diagram-row-actions-menu';
import { OnlineDiagramRowActionsMenu } from './diagram-row-actions-menu/online-diagram-row-actions-menu';

export interface OpenDiagramTableProps {
    tab: OpenDiagramTab;
    rows: OpenDiagramRow[];
    sort: OpenDiagramSortState;
    onSortChange: (sort: OpenDiagramSortState) => void;
    selectedDiagramId?: string;
    onSelectDiagramId: (diagramId: string) => void;
    onOpenDiagram: (diagramId: string, storage: OpenDiagramTab) => void;
    onLocalListChanged: () => void;
    onOnlineListChanged: () => void;
    localDiagramCount: number;
    onlineDiagramCount: number;
    isAuthenticated: boolean;
    emptyMessage: string;
}

const SortableHeader: React.FC<{
    column: OpenDiagramSortColumn;
    label: string;
    sort: OpenDiagramSortState;
    onSortChange: (sort: OpenDiagramSortState) => void;
    className?: string;
}> = ({ column, label, sort, onSortChange, className }) => {
    const direction = sortDirectionForColumn(sort, column);

    const handleClick = () => {
        onSortChange(toggleOpenDiagramSort(sort, column));
    };

    return (
        <TableHead className={className}>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 gap-1 px-2 font-medium"
                onClick={handleClick}
            >
                {label}
                {direction === 'asc' ? (
                    <ArrowUp className="size-3.5" aria-hidden />
                ) : direction === 'desc' ? (
                    <ArrowDown className="size-3.5" aria-hidden />
                ) : (
                    <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />
                )}
            </Button>
        </TableHead>
    );
};

export const OpenDiagramTable: React.FC<OpenDiagramTableProps> = ({
    tab,
    rows,
    sort,
    onSortChange,
    selectedDiagramId,
    onSelectDiagramId,
    onOpenDiagram,
    onLocalListChanged,
    onOnlineListChanged,
    localDiagramCount,
    onlineDiagramCount,
    isAuthenticated,
    emptyMessage,
}) => {
    const { t } = useTranslation();
    const showRoleColumn = tab === 'online';

    const handleRowKeyDown = useCallback(
        (
            e: React.KeyboardEvent<HTMLTableRowElement>,
            diagramId: string,
            storage: OpenDiagramTab,
            selectionIndex: number
        ) => {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    onOpenDiagram(diagramId, storage);
                    break;
                case 'ArrowDown': {
                    e.preventDefault();
                    (
                        document.querySelector(
                            `[data-open-diagram-index="${selectionIndex + 1}"]`
                        ) as HTMLElement
                    )?.focus();
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    (
                        document.querySelector(
                            `[data-open-diagram-index="${selectionIndex - 1}"]`
                        ) as HTMLElement
                    )?.focus();
                    break;
                }
                default:
                    break;
            }
        },
        [onOpenDiagram]
    );

    if (rows.length === 0) {
        return (
            <p className="text-center text-sm text-muted-foreground">
                {emptyMessage}
            </p>
        );
    }

    return (
        <Table>
            <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                    <SortableHeader
                        column="database"
                        label={t('open_diagram_dialog.table_columns.database')}
                        sort={sort}
                        onSortChange={onSortChange}
                        className="w-[4.5rem]"
                    />
                    <SortableHeader
                        column="name"
                        label={t('open_diagram_dialog.table_columns.name')}
                        sort={sort}
                        onSortChange={onSortChange}
                    />
                    {showRoleColumn ? (
                        <TableHead>
                            {t('open_diagram_dialog.table_columns.role')}
                        </TableHead>
                    ) : null}
                    <SortableHeader
                        column="createdAt"
                        label={t(
                            'open_diagram_dialog.table_columns.created_at'
                        )}
                        sort={sort}
                        onSortChange={onSortChange}
                        className="hidden sm:table-cell"
                    />
                    <SortableHeader
                        column="updatedAt"
                        label={t(
                            'open_diagram_dialog.table_columns.last_modified'
                        )}
                        sort={sort}
                        onSortChange={onSortChange}
                    />
                    <SortableHeader
                        column="tablesCount"
                        label={t(
                            'open_diagram_dialog.table_columns.tables_count'
                        )}
                        sort={sort}
                        onSortChange={onSortChange}
                        className="text-center"
                    />
                    <TableHead className="w-12 text-right">
                        {t('open_diagram_dialog.table_columns.actions')}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row, index) => {
                    const storage =
                        row.storage === 'device' ? 'device' : 'online';

                    return (
                        <TableRow
                            key={`${row.storage}-${row.id}`}
                            data-state={
                                selectedDiagramId === row.id
                                    ? 'selected'
                                    : undefined
                            }
                            data-open-diagram-id={row.id}
                            data-open-diagram-index={index}
                            tabIndex={0}
                            className="focus:bg-accent focus:outline-none"
                            onFocus={() => onSelectDiagramId(row.id)}
                            onClick={(e) => {
                                if (e.detail === 2) {
                                    onOpenDiagram(row.id, storage);
                                    return;
                                }

                                if (e.detail === 1) {
                                    onSelectDiagramId(row.id);
                                }
                            }}
                            onKeyDown={(e) =>
                                handleRowKeyDown(e, row.id, storage, index)
                            }
                        >
                            <TableCell>
                                <div className="flex justify-center">
                                    <DiagramIcon
                                        databaseType={row.databaseType}
                                        databaseEdition={
                                            row.databaseEdition ?? undefined
                                        }
                                    />
                                </div>
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            {showRoleColumn && row.storage === 'online' ? (
                                <TableCell>
                                    <DiagramRoleIcon role={row.role} />
                                </TableCell>
                            ) : null}
                            <TableCell className="hidden sm:table-cell">
                                {row.createdAt.toLocaleString()}
                            </TableCell>
                            <TableCell>
                                {row.updatedAt.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                                {row.tablesCount}
                            </TableCell>
                            <TableCell
                                className={cn('p-0 pr-1 text-right')}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {row.storage === 'device' ? (
                                    <LocalDiagramRowActionsMenu
                                        diagramId={row.id}
                                        isAuthenticated={isAuthenticated}
                                        numberOfLocalDiagrams={
                                            localDiagramCount
                                        }
                                        onOpen={() =>
                                            onOpenDiagram(row.id, 'device')
                                        }
                                        onListChanged={onLocalListChanged}
                                    />
                                ) : (
                                    <OnlineDiagramRowActionsMenu
                                        diagramId={row.id}
                                        role={row.role}
                                        numberOfOnlineDiagrams={
                                            onlineDiagramCount
                                        }
                                        onOpen={() =>
                                            onOpenDiagram(row.id, 'online')
                                        }
                                        onListChanged={onOnlineListChanged}
                                    />
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
