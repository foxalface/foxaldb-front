import React, { useCallback } from 'react';
import { GripVertical, Check, Trash2, CircleDotDashed } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Area } from '@/lib/domain/area';
import { Input } from '@/components/input/input';
import { useChartDB } from '@/hooks/use-chartdb';
import { useClickAway, useKeyPressEvent } from 'react-use';
import { useTranslation } from 'react-i18next';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { ColorPicker } from '@/components/color-picker/color-picker';
import { ListItemHeaderButton } from '@/pages/editor-page/side-panel/list-item-header-button/list-item-header-button';
import { mergeRefs } from '@/lib/utils';
import { useFocusOn } from '@/hooks/use-focus-on';

export interface AreaListItemProps {
    area: Area;
}

export const AreaListItem = React.forwardRef<HTMLDivElement, AreaListItemProps>(
    ({ area }, forwardedRef) => {
        const { updateArea, removeArea, readonly } = useChartDB();
        const { t } = useTranslation();
        const { focusOnArea } = useFocusOn();
        const [editMode, setEditMode] = React.useState(false);
        const [areaName, setAreaName] = React.useState(area.name);
        const inputRef = React.useRef<HTMLInputElement>(null);

        const { attributes, listeners, setNodeRef, transform, transition } =
            useSortable({
                id: area.id,
            });

        const combinedRef = mergeRefs<HTMLDivElement>(forwardedRef, setNodeRef);

        const style = {
            transform: CSS.Translate.toString(transform),
            transition,
        };

        const saveAreaName = useCallback(() => {
            if (!editMode) return;
            if (areaName.trim()) {
                updateArea(area.id, { name: areaName.trim() });
            }
            setEditMode(false);
        }, [areaName, area.id, updateArea, editMode]);

        const abortEdit = useCallback(() => {
            setEditMode(false);
            setAreaName(area.name);
        }, [area.name]);

        const enterEditMode = useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            setEditMode(true);
        }, []);

        const handleDelete = useCallback(
            (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                event.stopPropagation();
                removeArea(area.id);
            },
            [area.id, removeArea]
        );

        const handleColorChange = useCallback(
            (color: string) => {
                updateArea(area.id, { color });
            },
            [area.id, updateArea]
        );

        const handleFocusOnArea = useCallback(
            (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                event.stopPropagation();
                focusOnArea(area.id);
            },
            [focusOnArea, area.id]
        );

        useClickAway(inputRef, saveAreaName);
        useKeyPressEvent('Enter', saveAreaName);
        useKeyPressEvent('Escape', abortEdit);

        return (
            <div
                className="w-full rounded-md border border-border hover:bg-accent"
                ref={combinedRef}
                style={{
                    ...style,
                    borderLeftWidth: '6px',
                    borderLeftColor: area.color,
                }}
                {...attributes}
            >
                <div className="group flex h-11 items-center justify-between gap-1 overflow-hidden p-2">
                    {!readonly ? (
                        <div
                            className="flex cursor-move items-center justify-center"
                            {...listeners}
                        >
                            <GripVertical className="size-4 text-muted-foreground" />
                        </div>
                    ) : null}

                    <div className="flex min-w-0 flex-1">
                        {editMode ? (
                            <Input
                                ref={inputRef}
                                autoFocus
                                type="text"
                                placeholder={area.name}
                                value={areaName}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setAreaName(e.target.value)}
                                className="h-7 w-full focus-visible:ring-0"
                            />
                        ) : !readonly ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        onDoubleClick={enterEditMode}
                                        className="text-editable truncate px-2 py-0.5 text-sm font-medium"
                                    >
                                        {area.name}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {t('tool_tips.double_click_to_edit')}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <div className="truncate px-2 py-0.5 text-sm font-medium">
                                {area.name}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row-reverse items-center">
                        {!editMode ? (
                            <>
                                {!readonly ? (
                                    <ListItemHeaderButton
                                        onClick={handleDelete}
                                        aria-label={t(
                                            'side_panel.areas_section.area.area_actions.delete_area'
                                        )}
                                        role="button"
                                        className="!text-red-700 hover:!text-red-700 dark:!text-red-700 dark:hover:!text-red-700"
                                    >
                                        <Trash2 />
                                    </ListItemHeaderButton>
                                ) : null}
                                {!readonly ? (
                                    <ColorPicker
                                        appearance="list-item-header"
                                        color={area.color}
                                        onChange={handleColorChange}
                                    />
                                ) : null}
                                <div className="flex items-center md:hidden md:group-focus-within:flex md:group-hover:flex">
                                    <ListItemHeaderButton
                                        onClick={handleFocusOnArea}
                                    >
                                        <CircleDotDashed />
                                    </ListItemHeaderButton>
                                </div>
                            </>
                        ) : (
                            <ListItemHeaderButton onClick={saveAreaName}>
                                <Check />
                            </ListItemHeaderButton>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

AreaListItem.displayName = 'AreaListItem';
