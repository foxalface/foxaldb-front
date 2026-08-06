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
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { useOpenTargetConversation } from '@/hooks/use-open-target-conversation';
import { useDialog } from '@/hooks/use-dialog';
import { useReactFlow, useStore } from '@xyflow/react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    Workflow,
    Group,
    View,
    StickyNote,
    Import,
    LayoutGrid,
    Plus,
    SquareArrowOutUpRight,
} from 'lucide-react';
import { SlBubbles } from 'react-icons/sl';
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter';
import { useLocalConfig } from '@/hooks/use-local-config';
import { useCanvas } from '@/hooks/use-canvas';
import { defaultSchemas } from '@/lib/data/default-schemas';
import { useAlert } from '@/context/alert-context/alert-context';
import { arrangeTablesForArea } from '@/lib/utils/area-utils';
import {
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';

export const CanvasContextMenu: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const {
        createTable,
        readonly,
        createArea,
        databaseType,
        createNote,
        areas,
        tables,
        relationships,
        updateArea,
        updateTablesState,
    } = useChartDB();
    const { schemasDisplayed } = useDiagramFilter();
    const { openCreateRelationshipDialog, openImportDatabaseDialog } =
        useDialog();
    const { screenToFlowPosition, getNodes } = useReactFlow();
    const { t } = useTranslation();
    const { showDBViews } = useLocalConfig();
    const { setEditTableModeTable, reorderTables } = useCanvas();
    const { showAlert } = useAlert();

    const { isMd: isDesktop } = useBreakpoint('md');
    const conversationsAvailable = useConversationsAvailability();
    const {
        hasActiveConversation: hasDiagramConversation,
        canCreate: canCreateDiagramConversation,
        isPending: isDiagramConversationPending,
        openConversation: openDiagramConversation,
    } = useOpenTargetConversation({
        targetType: 'diagram',
        targetId: null,
    });
    const showDiagramConversationAction =
        conversationsAvailable &&
        (hasDiagramConversation || canCreateDiagramConversation);

    // Reactively detect selected tables
    const selectedTableIds = useStore((state) =>
        state.nodes
            .filter((n) => n.type === 'table' && n.selected && !n.hidden)
            .map((n) => n.id)
    );
    const hasSelectedTables = selectedTableIds.length > 0;

    const createTableHandler = useCallback(
        async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let schema: string | undefined = undefined;
            if (schemasDisplayed.length > 0) {
                const defaultSchemaName = defaultSchemas[databaseType];
                const defaultSchemaInList = schemasDisplayed.find(
                    (s) => s.name === defaultSchemaName
                );
                schema = defaultSchemaInList
                    ? defaultSchemaInList.name
                    : schemasDisplayed[0]?.name;
            }

            const newTable = await createTable({
                x: position.x,
                y: position.y,
                schema,
            });

            if (newTable) {
                setEditTableModeTable({ tableId: newTable.id });
            }
        },
        [
            createTable,
            screenToFlowPosition,
            schemasDisplayed,
            setEditTableModeTable,
            databaseType,
        ]
    );

    const createViewHandler = useCallback(
        async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let schema: string | undefined = undefined;
            if (schemasDisplayed.length > 0) {
                const defaultSchemaName = defaultSchemas[databaseType];
                const defaultSchemaInList = schemasDisplayed.find(
                    (s) => s.name === defaultSchemaName
                );
                schema = defaultSchemaInList
                    ? defaultSchemaInList.name
                    : schemasDisplayed[0]?.name;
            }

            const newView = await createTable({
                x: position.x,
                y: position.y,
                schema,
                isView: true,
            });

            if (newView) {
                setEditTableModeTable({ tableId: newView.id });
            }
        },
        [
            createTable,
            screenToFlowPosition,
            schemasDisplayed,
            setEditTableModeTable,
            databaseType,
        ]
    );

    const createAreaHandler = useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            createArea({
                x: position.x,
                y: position.y,
            });
        },
        [createArea, screenToFlowPosition]
    );

    const createNoteHandler = useCallback(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            createNote({
                x: position.x,
                y: position.y,
            });
        },
        [createNote, screenToFlowPosition]
    );

    const createRelationshipHandler = useCallback(() => {
        openCreateRelationshipDialog();
    }, [openCreateRelationshipDialog]);

    const autoArrangeHandler = useCallback(() => {
        showAlert({
            title: t('reorder_diagram_alert.title'),
            description: t('reorder_diagram_alert.description'),
            actionLabel: t('reorder_diagram_alert.reorder'),
            closeLabel: t('reorder_diagram_alert.cancel'),
            onAction: reorderTables,
        });
    }, [t, showAlert, reorderTables]);

    const importSqlDbmlHandler = useCallback(() => {
        queueMicrotask(() => {
            openImportDatabaseDialog({
                databaseType,
                importMethods: ['ddl', 'dbml'],
            });
        });
    }, [openImportDatabaseDialog, databaseType]);

    // Arrange selected tables into an area
    const moveSelectedToArea = useCallback(
        (
            areaId: string,
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

            const tableIdSet = new Set(selectedTableIds);
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
        [
            selectedTableIds,
            updateTablesState,
            updateArea,
            tables,
            relationships,
            areas,
            getNodes,
        ]
    );

    const createAreaForSelectedHandler = useCallback(async () => {
        const canvasNodes = getNodes();
        const firstSelected = canvasNodes.find((n) =>
            selectedTableIds.includes(n.id)
        );

        const newArea = await createArea({
            x: (firstSelected?.position.x ?? 0) - 30,
            y: (firstSelected?.position.y ?? 0) - 50,
        });

        moveSelectedToArea(newArea.id, {
            x: newArea.x,
            y: newArea.y,
            width: newArea.width,
            height: newArea.height,
        });
    }, [selectedTableIds, createArea, getNodes, moveSelectedToArea]);

    if (!isDesktop) {
        return <>{children}</>;
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger disabled={readonly}>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem
                    onClick={createTableHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <Table className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('canvas_context_menu.new_table')}
                </ContextMenuItem>
                {showDBViews ? (
                    <ContextMenuItem
                        onClick={createViewHandler}
                        className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                    >
                        <View className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                        {t('canvas_context_menu.new_view')}
                    </ContextMenuItem>
                ) : null}
                <ContextMenuItem
                    onClick={createRelationshipHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <Workflow className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('canvas_context_menu.new_relationship')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                    onClick={createAreaHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <Group className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('canvas_context_menu.new_area')}
                </ContextMenuItem>
                <ContextMenuItem
                    onClick={createNoteHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <StickyNote className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('canvas_context_menu.new_note')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                {showDiagramConversationAction ? (
                    <>
                        <ContextMenuItem
                            onClick={(event) => {
                                event.stopPropagation();
                                void openDiagramConversation();
                            }}
                            disabled={isDiagramConversationPending}
                            className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                        >
                            <SlBubbles
                                className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                            />
                            {hasDiagramConversation
                                ? t(
                                      'side_panel.conversations_section.target_entry.open'
                                  )
                                : isDiagramConversationPending
                                  ? t(
                                        'side_panel.conversations_section.target_entry.pending'
                                    )
                                  : t(
                                        'side_panel.conversations_section.target_entry.start'
                                    )}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                    </>
                ) : null}
                <ContextMenuItem
                    onClick={importSqlDbmlHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <Import className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    Import SQL/DBML
                </ContextMenuItem>
                {hasSelectedTables && (
                    <>
                        <ContextMenuSeparator />
                        <ContextMenuSub>
                            <ContextMenuSubTrigger
                                className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                            >
                                <SquareArrowOutUpRight
                                    className={
                                        SIDE_PANEL_ACTION_MENU_ICON_CLASS
                                    }
                                />
                                {`${t('table_node_context_menu.move_to_area')} (${selectedTableIds.length})`}
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <ContextMenuItem
                                    onClick={createAreaForSelectedHandler}
                                    className={
                                        SIDE_PANEL_ACTION_MENU_ITEM_CLASS
                                    }
                                >
                                    <Plus
                                        className={
                                            SIDE_PANEL_ACTION_MENU_ICON_CLASS
                                        }
                                    />
                                    {t('canvas_context_menu.new_area')}
                                </ContextMenuItem>
                                {areas.length > 0 && <ContextMenuSeparator />}
                                {areas.map((area) => (
                                    <ContextMenuItem
                                        key={area.id}
                                        onClick={() =>
                                            moveSelectedToArea(area.id)
                                        }
                                        className={
                                            SIDE_PANEL_ACTION_MENU_ITEM_CLASS
                                        }
                                    >
                                        <div
                                            className="size-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: area.color,
                                            }}
                                        />
                                        {area.name}
                                    </ContextMenuItem>
                                ))}
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                    </>
                )}
                <ContextMenuSeparator />
                <ContextMenuItem
                    onClick={autoArrangeHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <LayoutGrid className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    {t('toolbar.reorder_diagram')}
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};
