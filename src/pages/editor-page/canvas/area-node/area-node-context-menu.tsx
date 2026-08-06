import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/context-menu/context-menu';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useChartDB } from '@/hooks/use-chartdb';
import type { Area } from '@/lib/domain/area';
import { arrangeTablesForArea } from '@/lib/utils/area-utils';
import { LayoutGrid, Pencil, Trash2 } from 'lucide-react';
import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';

export interface AreaNodeContextMenuProps {
    area: Area;
    onEditName?: () => void;
}

export const AreaNodeContextMenu: React.FC<
    React.PropsWithChildren<AreaNodeContextMenuProps>
> = ({ children, area, onEditName }) => {
    const {
        removeArea,
        readonly,
        tables,
        relationships,
        updateTablesState,
        updateArea,
    } = useChartDB();
    const { isMd: isDesktop } = useBreakpoint('md');
    const { getNodes } = useReactFlow();

    const removeAreaHandler = useCallback(() => {
        removeArea(area.id);
    }, [removeArea, area.id]);

    const autoArrangeHandler = useCallback(() => {
        const canvasNodes = getNodes();
        const areaNode = canvasNodes.find(
            (n) => n.id === area.id && n.type === 'area'
        );
        const areaRect = {
            x: areaNode?.position.x ?? area.x,
            y: areaNode?.position.y ?? area.y,
            width: areaNode?.measured?.width ?? area.width,
            height: areaNode?.measured?.height ?? area.height,
        };

        const tablesInArea = tables.filter((t) => t.parentAreaId === area.id);
        if (tablesInArea.length === 0) return;

        const { positions, requiredWidth, requiredHeight } =
            arrangeTablesForArea(tablesInArea, relationships, areaRect);

        if (
            requiredWidth > areaRect.width ||
            requiredHeight > areaRect.height
        ) {
            updateArea(area.id, {
                width: Math.max(areaRect.width, requiredWidth),
                height: Math.max(areaRect.height, requiredHeight),
            });
        }

        updateTablesState(
            (currentTables) =>
                currentTables.map((t) => {
                    const pos = positions.find((p) => p.id === t.id);
                    if (!pos) return t;
                    return { ...t, x: pos.x, y: pos.y };
                }),
            { updateHistory: true }
        );
    }, [area, tables, relationships, updateTablesState, updateArea, getNodes]);

    if (!isDesktop || readonly) {
        return <>{children}</>;
    }
    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                {onEditName ? (
                    <ContextMenuItem
                        onClick={onEditName}
                        className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                    >
                        <Pencil className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                        Edit Area Name
                    </ContextMenuItem>
                ) : null}
                <ContextMenuItem
                    onClick={autoArrangeHandler}
                    className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                >
                    <LayoutGrid className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />
                    Auto Arrange
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                    onClick={removeAreaHandler}
                    className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                >
                    <Trash2
                        className={
                            SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                        }
                    />
                    Delete Area
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};
