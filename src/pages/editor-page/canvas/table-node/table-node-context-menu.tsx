import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from '@/components/context-menu/context-menu';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useChartDB } from '@/hooks/use-chartdb';
import { useLayout } from '@/hooks/use-layout';
import { cloneTable } from '@/lib/clone';
import type { DBTable } from '@/lib/domain/db-table';
import { arrangeTablesForArea } from '@/lib/utils/area-utils';
import {
    Check,
    Copy,
    Pencil,
    Plus,
    SquareArrowOutUpRight,
    Trash2,
    Workflow,
} from 'lucide-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCanvas } from '@/hooks/use-canvas';
import { useReactFlow, useStore } from '@xyflow/react';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';

export interface TableNodeContextMenuProps {
    table: DBTable;
}

export const TableNodeContextMenu: React.FC<
    React.PropsWithChildren<TableNodeContextMenuProps>
> = ({ children, table }) => {
    const {
        removeTable,
        readonly,
        createTable,
        createArea,
        areas,
        tables,
        relationships,
        updateArea,
        updateTablesState,
    } = useChartDB();
    const { closeAllTablesInSidebar } = useLayout();
    const { t } = useTranslation();
    const { isMd: isDesktop } = useBreakpoint('md');
    const { setEditTableModeTable, startFloatingEdgeCreation } = useCanvas();
    const { getNodes } = useReactFlow();

    // Reactively detect multi-selection
    const selectedTableIds = useStore((state) =>
        state.nodes
            .filter((n) => n.type === 'table' && n.selected && !n.hidden)
            .map((n) => n.id)
    );
    const isMultiSelect =
        selectedTableIds.length > 1 && selectedTableIds.includes(table.id);

    const duplicateTableHandler: React.MouseEventHandler<HTMLDivElement> =
        useCallback(
            (e) => {
                e.stopPropagation();
                const clonedTable = cloneTable(table);
                clonedTable.name = `${clonedTable.name}_copy`;
                clonedTable.x += 30;
                clonedTable.y += 50;
                createTable(clonedTable);
            },
            [createTable, table]
        );

    const editTableHandler: React.MouseEventHandler<HTMLDivElement> =
        useCallback(
            (e) => {
                e.stopPropagation();
                if (readonly) return;
                closeAllTablesInSidebar();
                setEditTableModeTable({ tableId: table.id });
            },
            [table.id, setEditTableModeTable, closeAllTablesInSidebar, readonly]
        );

    const removeTableHandler: React.MouseEventHandler<HTMLDivElement> =
        useCallback(
            (e) => {
                e.stopPropagation();
                removeTable(table.id);
            },
            [removeTable, table.id]
        );

    const addRelationshipHandler: React.MouseEventHandler<HTMLDivElement> =
        useCallback(
            (e) => {
                e.stopPropagation();
                startFloatingEdgeCreation({ sourceNodeId: table.id });
            },
            [startFloatingEdgeCreation, table.id]
        );

    // Arrange tables into an area and apply positions
    const moveToArea = useCallback(
        (
            areaId: string,
            tableIds: string[],
            overrideRect?: {
                x: number;
                y: number;
                width: number;
                height: number;
            }
        ) => {
            let areaRect = overrideRect;
            if (!areaRect) {
                const canvasNodes = getNodes();
                const areaNode = canvasNodes.find(
                    (n) => n.id === areaId && n.type === 'area'
                );
                const areaData = areas.find((a) => a.id === areaId)!;
                areaRect = {
                    x: areaNode?.position.x ?? areaData.x,
                    y: areaNode?.position.y ?? areaData.y,
                    width: areaNode?.measured?.width ?? areaData.width,
                    height: areaNode?.measured?.height ?? areaData.height,
                };
            }

            const tableIdSet = new Set(tableIds);
            const existingAreaTables = tables.filter(
                (t) => t.parentAreaId === areaId && !tableIdSet.has(t.id)
            );
            const movingTables = tables.filter((t) => tableIdSet.has(t.id));
            const allAreaTables = [...existingAreaTables, ...movingTables];

            const { positions, requiredWidth, requiredHeight } =
                arrangeTablesForArea(allAreaTables, relationships, areaRect);

            if (
                requiredWidth > areaRect.width ||
                requiredHeight > areaRect.height
            ) {
                updateArea(areaId, {
                    width: Math.max(areaRect.width, requiredWidth),
                    height: Math.max(areaRect.height, requiredHeight),
                });
            }

            updateTablesState(
                (currentTables) =>
                    currentTables.map((t) => {
                        const pos = positions.find((p) => p.id === t.id);
                        if (!pos) return t;
                        return {
                            ...t,
                            parentAreaId: areaId,
                            x: pos.x,
                            y: pos.y,
                        };
                    }),
                { updateHistory: true }
            );
        },
        [tables, relationships, areas, getNodes, updateArea, updateTablesState]
    );

    const moveToAreaHandler = useCallback(
        (areaId: string | null) => {
            const tableIds = isMultiSelect ? selectedTableIds : [table.id];

            if (areaId === null) {
                updateTablesState(
                    (currentTables) =>
                        currentTables.map((t) =>
                            tableIds.includes(t.id)
                                ? { ...t, parentAreaId: null }
                                : t
                        ),
                    { updateHistory: true }
                );
                return;
            }

            moveToArea(areaId, tableIds);
        },
        [
            isMultiSelect,
            selectedTableIds,
            table.id,
            moveToArea,
            updateTablesState,
        ]
    );

    const createAreaHandler = useCallback(async () => {
        const canvasNodes = getNodes();
        const node = canvasNodes.find((n) => n.id === table.id);
        const newArea = await createArea({
            x: (node?.position.x ?? table.x) - 30,
            y: (node?.position.y ?? table.y) - 50,
        });

        const tableIds = isMultiSelect ? selectedTableIds : [table.id];
        moveToArea(newArea.id, tableIds, {
            x: newArea.x,
            y: newArea.y,
            width: newArea.width,
            height: newArea.height,
        });
    }, [
        isMultiSelect,
        selectedTableIds,
        table,
        createArea,
        getNodes,
        moveToArea,
    ]);

    if (!isDesktop || readonly) {
        return <>{children}</>;
    }
    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem
                    onClick={editTableHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <Pencil className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('table_node_context_menu.edit_table')}
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={duplicateTableHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <Copy className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('table_node_context_menu.duplicate_table')}
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={addRelationshipHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <Workflow className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('table_node_context_menu.add_relationship')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuSub>
                    <ContextMenuSubTrigger
                        className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                    >
                        <SquareArrowOutUpRight
                            className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                        />
                        {isMultiSelect
                            ? `${t('table_node_context_menu.move_to_area')} (${selectedTableIds.length})`
                            : t('table_node_context_menu.move_to_area')}
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem
                            onClick={createAreaHandler}
                            className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                        >
                            <Plus
                                className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                            />
                            {t('canvas_context_menu.new_area')}
                        </ContextMenuItem>
                        {areas.length > 0 && <ContextMenuSeparator />}
                        {areas.map((area) => (
                            <ContextMenuItem
                                key={area.id}
                                onClick={() => moveToAreaHandler(area.id)}
                                className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                            >
                                <div
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor: area.color,
                                    }}
                                />
                                <span className="min-w-0 flex-1 truncate">
                                    {area.name}
                                </span>
                                {!isMultiSelect &&
                                    table.parentAreaId === area.id && (
                                        <Check
                                            className={`${SIDE_PANEL_ACTION_MENU_ICON_CLASS} ml-auto`}
                                        />
                                    )}
                            </ContextMenuItem>
                        ))}
                        {areas.length > 0 && (
                            <>
                                <ContextMenuSeparator />
                                <ContextMenuItem
                                    onClick={() => moveToAreaHandler(null)}
                                    disabled={
                                        !isMultiSelect && !table.parentAreaId
                                    }
                                    className={
                                        SIDE_PANEL_ACTION_MENU_ITEM_CLASS
                                    }
                                >
                                    <span className="min-w-0 flex-1">
                                        {t('table_node_context_menu.no_area')}
                                    </span>
                                    {!isMultiSelect && !table.parentAreaId && (
                                        <Check
                                            className={`${SIDE_PANEL_ACTION_MENU_ICON_CLASS} ml-auto`}
                                        />
                                    )}
                                </ContextMenuItem>
                            </>
                        )}
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem
                    onClick={removeTableHandler}
                    className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                >
                    <Trash2
                        className={
                            SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                        }
                    />
                    {t('table_node_context_menu.delete_table')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};
