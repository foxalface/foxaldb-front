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
import { OpenDiagramTableEmptyState } from './open-diagram-empty-state';
import {
    OPEN_DIAGRAM_COL_ACTIONS_CLASS,
    OPEN_DIAGRAM_COL_DATABASE_CLASS,
    OPEN_DIAGRAM_COL_DATE_CLASS,
    OPEN_DIAGRAM_COL_ROLE_CLASS,
    OPEN_DIAGRAM_COL_TABLES_CLASS,
    OPEN_DIAGRAM_TABLE_CELL_CLASS,
    OPEN_DIAGRAM_TABLE_CLASS,
    OPEN_DIAGRAM_TABLE_HEAD_CLASS,
    OPEN_DIAGRAM_TABLE_HEADER_ROW_CLASS,
    OPEN_DIAGRAM_TABLE_HEADER_WRAPPER_CLASS,
    OPEN_DIAGRAM_TABLE_PANEL_CLASS,
    OPEN_DIAGRAM_TABLE_SCROLL_CLASS,
    openDiagramTableColumnCount,
} from './open-diagram-dialog-layout';
import { OpenDiagramTableColGroup } from './open-diagram-table-col-group';
import { OpenDiagramDateCell } from './open-diagram-date-cell';
import { OpenDiagramRoleFilterHeader } from './open-diagram-role-filter-header';
import type { DiagramAccessRole } from '@/lib/api/diagrams';
import type { OpenDiagramRoleFilterState } from './open-diagram-role-filter';

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
    emptyTitle: string;
    emptyFilterActive?: boolean;
    onClearRoleFilter?: () => void;
    roleFilter?: OpenDiagramRoleFilterState;
    onRoleFilterChange?: (role: DiagramAccessRole, checked: boolean) => void;
}

const SortableHeader: React.FC<{
    column: OpenDiagramSortColumn;
    label: string;
    sort: OpenDiagramSortState;
    onSortChange: (sort: OpenDiagramSortState) => void;
    align?: 'start' | 'center';
    className?: string;
}> = ({ column, label, sort, onSortChange, align = 'start', className }) => {
    const direction = sortDirectionForColumn(sort, column);

    const handleClick = () => {
        onSortChange(toggleOpenDiagramSort(sort, column));
    };

    return (
        <TableHead
            className={cn(
                'align-middle',
                align === 'center' && 'text-center',
                className
            )}
        >
            <div
                className={cn(
                    'flex',
                    align === 'center' ? 'justify-center' : 'justify-start'
                )}
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-auto shrink-0 gap-1 whitespace-nowrap px-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={handleClick}
                >
                    <span className="whitespace-nowrap">{label}</span>
                    {direction === 'asc' ? (
                        <ArrowUp className="size-3.5" aria-hidden />
                    ) : direction === 'desc' ? (
                        <ArrowDown className="size-3.5" aria-hidden />
                    ) : (
                        <ArrowUpDown
                            className="size-3.5 opacity-50"
                            aria-hidden
                        />
                    )}
                </Button>
            </div>
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
    emptyTitle,
    emptyFilterActive = false,
    onClearRoleFilter,
    roleFilter,
    onRoleFilterChange,
}) => {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n?.resolvedLanguage ?? i18n?.language ?? 'en';
    const showRoleColumn = tab === 'online';
    const isEmpty = rows.length === 0;
    const columnCount = openDiagramTableColumnCount(showRoleColumn);

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

    const tableHeaderRow = (
        <tr className={OPEN_DIAGRAM_TABLE_HEADER_ROW_CLASS}>
            <SortableHeader
                column="database"
                label={t('open_diagram_dialog.table_columns.database')}
                sort={sort}
                onSortChange={onSortChange}
                align="center"
                className={OPEN_DIAGRAM_COL_DATABASE_CLASS}
            />
            <SortableHeader
                column="name"
                label={t('open_diagram_dialog.table_columns.name')}
                sort={sort}
                onSortChange={onSortChange}
            />
            {showRoleColumn && roleFilter && onRoleFilterChange ? (
                <OpenDiagramRoleFilterHeader
                    roleFilter={roleFilter}
                    onRoleCheckedChange={onRoleFilterChange}
                />
            ) : showRoleColumn ? (
                <TableHead
                    className={cn(
                        OPEN_DIAGRAM_COL_ROLE_CLASS,
                        'text-center text-xs font-medium text-muted-foreground'
                    )}
                >
                    {t('open_diagram_dialog.table_columns.role')}
                </TableHead>
            ) : null}
            <SortableHeader
                column="createdAt"
                label={t('open_diagram_dialog.table_columns.created_at')}
                sort={sort}
                onSortChange={onSortChange}
                className={cn(
                    OPEN_DIAGRAM_COL_DATE_CLASS,
                    'hidden sm:table-cell'
                )}
            />
            <SortableHeader
                column="updatedAt"
                label={t('open_diagram_dialog.table_columns.last_modified')}
                sort={sort}
                onSortChange={onSortChange}
                className={OPEN_DIAGRAM_COL_DATE_CLASS}
            />
            <SortableHeader
                column="tablesCount"
                label={t('open_diagram_dialog.table_columns.tables_count')}
                sort={sort}
                onSortChange={onSortChange}
                align="center"
                className={cn(OPEN_DIAGRAM_COL_TABLES_CLASS, 'px-1')}
            />
            <TableHead
                className={cn(OPEN_DIAGRAM_COL_ACTIONS_CLASS, 'p-0')}
                aria-hidden="true"
            />
        </tr>
    );

    return (
        <div
            className={cn(
                OPEN_DIAGRAM_TABLE_PANEL_CLASS,
                'flex min-h-0 flex-1 flex-col'
            )}
        >
            <div className={OPEN_DIAGRAM_TABLE_HEADER_WRAPPER_CLASS}>
                <Table className={OPEN_DIAGRAM_TABLE_CLASS}>
                    <OpenDiagramTableColGroup showRoleColumn={showRoleColumn} />
                    <TableHeader className={OPEN_DIAGRAM_TABLE_HEAD_CLASS}>
                        {tableHeaderRow}
                    </TableHeader>
                </Table>
            </div>
            <div className={OPEN_DIAGRAM_TABLE_SCROLL_CLASS}>
                <Table className={OPEN_DIAGRAM_TABLE_CLASS}>
                    <OpenDiagramTableColGroup showRoleColumn={showRoleColumn} />
                    <TableBody>
                        {isEmpty ? (
                            <tr
                                className={cn(
                                    OPEN_DIAGRAM_TABLE_HEADER_ROW_CLASS,
                                    'hover:!bg-transparent'
                                )}
                            >
                                <TableCell
                                    colSpan={columnCount}
                                    className="h-full border-0 p-0"
                                >
                                    <OpenDiagramTableEmptyState
                                        title={emptyTitle}
                                        filterActive={emptyFilterActive}
                                        clearFilterLabel={t(
                                            'open_diagram_dialog.role_filter.clear'
                                        )}
                                        onClearFilter={onClearRoleFilter}
                                    />
                                </TableCell>
                            </tr>
                        ) : (
                            rows.map((row, index) => {
                                const storage =
                                    row.storage === 'device'
                                        ? 'device'
                                        : 'online';

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
                                        className="focus:bg-accent focus:outline-none [&>td]:align-middle"
                                        onFocus={() =>
                                            onSelectDiagramId(row.id)
                                        }
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
                                            handleRowKeyDown(
                                                e,
                                                row.id,
                                                storage,
                                                index
                                            )
                                        }
                                    >
                                        <TableCell
                                            className={cn(
                                                OPEN_DIAGRAM_TABLE_CELL_CLASS,
                                                OPEN_DIAGRAM_COL_DATABASE_CLASS
                                            )}
                                        >
                                            <div className="flex items-center justify-center">
                                                <DiagramIcon
                                                    databaseType={
                                                        row.databaseType
                                                    }
                                                    databaseEdition={
                                                        row.databaseEdition ??
                                                        undefined
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                OPEN_DIAGRAM_TABLE_CELL_CLASS,
                                                'max-w-[9rem] min-w-[4.5rem] font-medium'
                                            )}
                                            title={row.name}
                                        >
                                            <span className="line-clamp-2 break-words text-sm leading-snug">
                                                {row.name}
                                            </span>
                                        </TableCell>
                                        {showRoleColumn &&
                                        row.storage === 'online' ? (
                                            <TableCell
                                                className={cn(
                                                    OPEN_DIAGRAM_TABLE_CELL_CLASS,
                                                    OPEN_DIAGRAM_COL_ROLE_CLASS,
                                                    'text-center'
                                                )}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <DiagramRoleIcon
                                                        role={row.role}
                                                    />
                                                </div>
                                            </TableCell>
                                        ) : null}
                                        <TableCell
                                            className={cn(
                                                OPEN_DIAGRAM_TABLE_CELL_CLASS,
                                                OPEN_DIAGRAM_COL_DATE_CLASS,
                                                'hidden sm:table-cell'
                                            )}
                                        >
                                            <OpenDiagramDateCell
                                                value={row.createdAt}
                                                locale={dateLocale}
                                            />
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                OPEN_DIAGRAM_TABLE_CELL_CLASS,
                                                OPEN_DIAGRAM_COL_DATE_CLASS
                                            )}
                                        >
                                            <OpenDiagramDateCell
                                                value={row.updatedAt}
                                                locale={dateLocale}
                                            />
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                OPEN_DIAGRAM_TABLE_CELL_CLASS,
                                                OPEN_DIAGRAM_COL_TABLES_CLASS,
                                                'text-center tabular-nums'
                                            )}
                                        >
                                            {row.tablesCount}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                OPEN_DIAGRAM_TABLE_CELL_CLASS,
                                                OPEN_DIAGRAM_COL_ACTIONS_CLASS,
                                                'p-0'
                                            )}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-center">
                                                {row.storage === 'device' ? (
                                                    <LocalDiagramRowActionsMenu
                                                        diagramId={row.id}
                                                        isAuthenticated={
                                                            isAuthenticated
                                                        }
                                                        numberOfLocalDiagrams={
                                                            localDiagramCount
                                                        }
                                                        onOpen={() =>
                                                            onOpenDiagram(
                                                                row.id,
                                                                'device'
                                                            )
                                                        }
                                                        onListChanged={
                                                            onLocalListChanged
                                                        }
                                                    />
                                                ) : (
                                                    <OnlineDiagramRowActionsMenu
                                                        diagramId={row.id}
                                                        role={row.role}
                                                        numberOfOnlineDiagrams={
                                                            onlineDiagramCount
                                                        }
                                                        onOpen={() =>
                                                            onOpenDiagram(
                                                                row.id,
                                                                'online'
                                                            )
                                                        }
                                                        onOpenLocal={(
                                                            localDiagramId
                                                        ) =>
                                                            onOpenDiagram(
                                                                localDiagramId,
                                                                'device'
                                                            )
                                                        }
                                                        onLocalListChanged={
                                                            onLocalListChanged
                                                        }
                                                        onListChanged={
                                                            onOnlineListChanged
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
