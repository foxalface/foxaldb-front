import React, { useCallback, useMemo } from 'react';
import { EllipsisVertical, CircleDotDashed, Trash2 } from 'lucide-react';
import { ListItemHeaderButton } from '../../../../list-item-header-button/list-item-header-button';
import { useReactFlow } from '@xyflow/react';
import { useChartDB } from '@/hooks/use-chartdb';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useTranslation } from 'react-i18next';
import type { DBDependency } from '@/lib/domain/db-dependency';
import { useLayout } from '@/hooks/use-layout';

export interface DependencyListItemHeaderProps {
    dependency: DBDependency;
}

export const DependencyListItemHeader: React.FC<
    DependencyListItemHeaderProps
> = ({ dependency }) => {
    const { removeDependency, getTable } = useChartDB();
    const { fitView, deleteElements, setEdges } = useReactFlow();
    const { t } = useTranslation();
    const { hideSidePanel } = useLayout();
    const { isMd: isDesktop } = useBreakpoint('md');

    const dependencyName = useMemo(() => {
        const table = getTable(dependency.tableId);
        const dependentTable = getTable(dependency.dependentTableId);

        // should not happen
        if (!table || !dependentTable) {
            return '';
        }

        return `${dependentTable.name} -> ${table.name}`;
    }, [dependency.tableId, dependency.dependentTableId, getTable]);

    const focusOnDependency = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.stopPropagation();
            setEdges((edges) =>
                edges.map((edge) =>
                    edge.id == dependency.id
                        ? {
                              ...edge,
                              selected: true,
                          }
                        : {
                              ...edge,
                              selected: false,
                          }
                )
            );
            fitView({
                duration: 500,
                maxZoom: 1,
                minZoom: 1,
                nodes: [
                    {
                        id: dependency.tableId,
                    },
                    {
                        id: dependency.dependentTableId,
                    },
                ],
            });

            if (!isDesktop) {
                hideSidePanel();
            }
        },
        [
            fitView,
            dependency.tableId,
            dependency.dependentTableId,
            setEdges,
            dependency.id,
            isDesktop,
            hideSidePanel,
        ]
    );

    const deleteDependencyHandler = useCallback(() => {
        removeDependency(dependency.id);
        deleteElements({
            edges: [{ id: dependency.id }],
        });
    }, [dependency.id, removeDependency, deleteElements]);

    const renderDropDownMenu = useCallback(
        () => (
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <ListItemHeaderButton>
                        <EllipsisVertical />
                    </ListItemHeaderButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={deleteDependencyHandler}
                            className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                        >
                            <Trash2
                                className={
                                    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                                }
                            />
                            {t(
                                'side_panel.refs_section.dependency.dependency_actions.delete_dependency'
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        [deleteDependencyHandler, t]
    );

    return (
        <div className="group flex h-11 w-full flex-1 items-center justify-between gap-1 overflow-hidden">
            <div className="flex min-w-0 flex-1 px-1">
                <div className="truncate px-2 py-0.5">{dependencyName}</div>
            </div>
            <div className="flex flex-row-reverse items-center">
                <div>{renderDropDownMenu()}</div>
                <div className="flex flex-row-reverse md:hidden md:group-hover:flex">
                    <ListItemHeaderButton onClick={focusOnDependency}>
                        <CircleDotDashed />
                    </ListItemHeaderButton>
                </div>
            </div>
        </div>
    );
};
