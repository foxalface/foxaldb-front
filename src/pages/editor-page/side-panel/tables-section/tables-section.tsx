import React, { useCallback, useMemo } from 'react';
import { TableList } from './table-list/table-list';
import { Button } from '@/components/button/button';
import { View, EyeOff, ListCollapse } from 'lucide-react';
import { Input } from '@/components/input/input';
import type { DBTable } from '@/lib/domain/db-table';
import { useChartDB } from '@/hooks/use-chartdb';
import { useLayout } from '@/hooks/use-layout';
import {
    SidePanelEmptyState,
    sidePanelEmptyStateIcon,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import { SidePanelFilterEmptyState } from '@/components/side-panel-empty-state/side-panel-filter-empty-state';
import { ScrollArea } from '@/components/scroll-area/scroll-area';
import { useTranslation } from 'react-i18next';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useViewport } from '@xyflow/react';
import { useDialog } from '@/hooks/use-dialog';
import type { DBSchema } from '@/lib/domain';
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter';
import { filterTable } from '@/lib/domain/diagram-filter/filter';
import { defaultSchemas } from '@/lib/data/default-schemas';
import { SidePanelAddButtonWithAlternatives } from '@/components/side-panel/side-panel-add-button';
import { useLocalConfig } from '@/hooks/use-local-config';

export interface TablesSectionProps {}

export const TablesSection: React.FC<TablesSectionProps> = () => {
    const { createTable, tables, databaseType, readonly } = useChartDB();
    const { filter, schemasDisplayed, hasActiveFilter, resetFilter } =
        useDiagramFilter();
    const { openTableSchemaDialog } = useDialog();
    const viewport = useViewport();
    const { t } = useTranslation();
    const { openTableFromSidebar, closeAllTablesInSidebar } = useLayout();
    const [filterText, setFilterText] = React.useState('');
    const { showDBViews } = useLocalConfig();
    const filterInputRef = React.useRef<HTMLInputElement>(null);

    // First, filter tables by the diagram filter (schemas/tables visibility)
    // This is computed once and reused for both filteredTables and allTablesHiddenByDiagramFilter
    const tablesFilteredByDiagram = useMemo(
        () =>
            tables.filter((table) =>
                filterTable({
                    table: { id: table.id, schema: table.schema },
                    filter,
                    options: { defaultSchema: defaultSchemas[databaseType] },
                })
            ),
        [tables, filter, databaseType]
    );

    // Check if all tables are hidden by the diagram filter (not the text search)
    const allTablesHiddenByDiagramFilter = useMemo(() => {
        if (!hasActiveFilter || tables.length === 0) {
            return false;
        }
        return tablesFilteredByDiagram.length === 0;
    }, [hasActiveFilter, tables.length, tablesFilteredByDiagram.length]);

    // Apply additional filters (text search and views) on top of diagram-filtered tables
    const filteredTables = useMemo(() => {
        const filterTableName: (table: DBTable) => boolean = (table) =>
            !filterText?.trim?.() ||
            table.name.toLowerCase().includes(filterText.toLowerCase());

        const filterViews: (table: DBTable) => boolean = (table) =>
            showDBViews ? true : !table.isView;

        return tablesFilteredByDiagram
            .filter(filterTableName)
            .filter(filterViews);
    }, [tablesFilteredByDiagram, filterText, showDBViews]);

    const getCenterLocation = useCallback(() => {
        const padding = 80;
        const centerX = -viewport.x / viewport.zoom + padding / viewport.zoom;
        const centerY = -viewport.y / viewport.zoom + padding / viewport.zoom;

        return { centerX, centerY };
    }, [viewport.x, viewport.y, viewport.zoom]);

    const createTableWithLocation = useCallback(
        async ({ schema }: { schema?: DBSchema }) => {
            const { centerX, centerY } = getCenterLocation();
            const table = await createTable({
                x: centerX,
                y: centerY,
                schema: schema?.name,
            });
            openTableFromSidebar(table.id);
        },
        [createTable, openTableFromSidebar, getCenterLocation]
    );

    const createViewWithLocation = useCallback(
        async ({ schema }: { schema?: DBSchema }) => {
            const { centerX, centerY } = getCenterLocation();
            const table = await createTable({
                x: centerX,
                y: centerY,
                schema: schema?.name,
                isView: true,
            });
            openTableFromSidebar(table.id);
        },
        [createTable, openTableFromSidebar, getCenterLocation]
    );

    const handleCreateTable = useCallback(
        async ({ view }: { view?: boolean }) => {
            setFilterText('');

            if (schemasDisplayed.length > 1) {
                openTableSchemaDialog({
                    onConfirm: view
                        ? createViewWithLocation
                        : createTableWithLocation,
                    schemas: schemasDisplayed,
                });
            } else {
                const schema =
                    schemasDisplayed.length === 1
                        ? schemasDisplayed[0]
                        : undefined;

                if (view) {
                    createViewWithLocation({ schema });
                } else {
                    createTableWithLocation({ schema });
                }
            }
        },
        [
            createViewWithLocation,
            createTableWithLocation,
            schemasDisplayed,
            openTableSchemaDialog,
            setFilterText,
        ]
    );

    const handleClearFilter = useCallback(() => {
        setFilterText('');
    }, []);

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden px-2"
            data-vaul-no-drag
        >
            <div className="flex items-center gap-2 py-1">
                <div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    variant="ghost"
                                    className="size-8 p-0"
                                    onClick={closeAllTablesInSidebar}
                                >
                                    <ListCollapse className="size-4" />
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {t('side_panel.tables_section.collapse')}
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex-1">
                    <Input
                        ref={filterInputRef}
                        type="text"
                        placeholder={t('side_panel.tables_section.filter')}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                {!readonly ? (
                    <SidePanelAddButtonWithAlternatives
                        label={t('side_panel.tables_section.add_table')}
                        onClick={() => handleCreateTable({ view: false })}
                        alternatives={
                            showDBViews
                                ? [
                                      {
                                          label: t(
                                              'side_panel.tables_section.add_view'
                                          ),
                                          onClick: () =>
                                              handleCreateTable({ view: true }),
                                          icon: <View className="size-4" />,
                                          className: 'text-xs',
                                      },
                                  ]
                                : []
                        }
                    />
                ) : null}
            </div>
            {/* Indicator when all tables are hidden by diagram filter */}
            {allTablesHiddenByDiagramFilter && (
                <div className="mb-2 flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                    <EyeOff className="size-4 text-muted-foreground" />
                    <span className="flex-1 text-xs text-muted-foreground">
                        {t('side_panel.tables_section.all_hidden')}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => resetFilter()}
                    >
                        {t('side_panel.tables_section.show_all')}
                    </Button>
                </div>
            )}
            <div className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="h-full">
                    {tables.length === 0 ? (
                        <SidePanelEmptyState
                            icon={sidePanelEmptyStateIcon}
                            title={t(
                                'side_panel.tables_section.empty_state.title'
                            )}
                            description={t(
                                'side_panel.tables_section.empty_state.description'
                            )}
                            secondaryAction={
                                !readonly
                                    ? {
                                          label: t(
                                              'side_panel.tables_section.add_table'
                                          ),
                                          onClick: () =>
                                              handleCreateTable({
                                                  view: false,
                                              }),
                                      }
                                    : undefined
                            }
                        />
                    ) : filterText && filteredTables.length === 0 ? (
                        <SidePanelFilterEmptyState
                            title={t('side_panel.tables_section.no_results')}
                            clearLabel={t('side_panel.tables_section.clear')}
                            onClearFilter={handleClearFilter}
                        />
                    ) : (
                        <TableList tables={filteredTables} />
                    )}
                </ScrollArea>
            </div>
        </section>
    );
};
