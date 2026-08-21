import React, { useCallback, useMemo } from 'react';
import {
    GripVertical,
    Pencil,
    EllipsisVertical,
    Trash2,
    Check,
    Highlighter,
} from 'lucide-react';
import { ListItemHeaderButton } from '@/pages/editor-page/side-panel/list-item-header-button/list-item-header-button';
import { Input } from '@/components/input/input';
import { useChartDB } from '@/hooks/use-chartdb';
import { useClickAway, useKeyPressEvent } from 'react-use';
import { useSortable } from '@dnd-kit/sortable';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';
import { useTranslation } from 'react-i18next';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import {
    customTypeKindToLabel,
    DBCustomTypeKind,
    type DBCustomType,
} from '@/lib/domain/db-custom-type';
import { Badge } from '@/components/badge/badge';
import { checkIfCustomTypeUsed } from '../utils';
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter';
import { defaultSchemas } from '@/lib/data/default-schemas';

export interface CustomTypeListItemHeaderProps {
    customType: DBCustomType;
}

export const CustomTypeListItemHeader: React.FC<
    CustomTypeListItemHeaderProps
> = ({ customType }) => {
    const {
        updateCustomType,
        removeCustomType,
        highlightedCustomType,
        highlightCustomTypeId,
        tables,
        databaseType,
        readonly,
    } = useChartDB();
    const { schemasDisplayed } = useDiagramFilter();
    const { t } = useTranslation();
    const [editMode, setEditMode] = React.useState(false);
    const [customTypeName, setCustomTypeName] = React.useState(customType.name);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { listeners } = useSortable({ id: customType.id });

    const editCustomTypeName = useCallback(() => {
        if (!editMode) return;
        if (customTypeName.trim()) {
            updateCustomType(customType.id, { name: customTypeName.trim() });
        }

        setEditMode(false);
    }, [customTypeName, customType.id, updateCustomType, editMode]);

    const abortEdit = useCallback(() => {
        setEditMode(false);
        setCustomTypeName(customType.name);
    }, [customType.name]);

    useClickAway(inputRef, editCustomTypeName);
    useKeyPressEvent('Enter', editCustomTypeName);
    useKeyPressEvent('Escape', abortEdit);

    const enterEditMode = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMode(true);
    };

    const deleteCustomTypeHandler = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.stopPropagation();

            removeCustomType(customType.id);
        },
        [customType.id, removeCustomType]
    );

    const isHighlighted = useMemo(
        () => highlightedCustomType?.id === customType.id,
        [highlightedCustomType, customType.id]
    );

    const toggleHighlightCustomType = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.stopPropagation();

            if (isHighlighted) {
                highlightCustomTypeId(undefined);
            } else {
                highlightCustomTypeId(customType.id);
            }
        },
        [customType.id, highlightCustomTypeId, isHighlighted]
    );

    const canHighlight = useMemo(
        () => checkIfCustomTypeUsed({ customType, tables }),
        [customType, tables]
    );

    const renderDropDownMenu = useCallback(() => {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <ListItemHeaderButton>
                        <EllipsisVertical />
                    </ListItemHeaderButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit min-w-40">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={toggleHighlightCustomType}
                            disabled={!canHighlight}
                            className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                        >
                            <Highlighter
                                className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                            />
                            {t(
                                isHighlighted
                                    ? 'side_panel.custom_types_section.custom_type.custom_type_actions.clear_field_highlight'
                                    : 'side_panel.custom_types_section.custom_type.custom_type_actions.highlight_fields'
                            )}
                        </DropdownMenuItem>
                        {!readonly ? (
                            <DropdownMenuItem
                                onClick={deleteCustomTypeHandler}
                                className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                            >
                                <Trash2
                                    className={
                                        SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                                    }
                                />
                                {t('delete')}
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }, [
        deleteCustomTypeHandler,
        t,
        toggleHighlightCustomType,
        canHighlight,
        isHighlighted,
        readonly,
    ]);

    const schemaToDisplay = useMemo(() => {
        if (schemasDisplayed.length > 1) {
            return customType.schema ?? defaultSchemas[databaseType];
        }
    }, [customType.schema, schemasDisplayed.length, databaseType]);

    return (
        <div className="group flex h-11 flex-1 items-center justify-between gap-1 overflow-hidden">
            {!readonly ? (
                <div
                    className="flex cursor-move items-center justify-center"
                    {...listeners}
                >
                    <GripVertical className="size-4 text-muted-foreground" />
                </div>
            ) : null}
            <div className="flex min-w-0 flex-1 px-1">
                {editMode ? (
                    <Input
                        ref={inputRef}
                        autoFocus
                        type="text"
                        placeholder={customType.name}
                        value={customTypeName}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setCustomTypeName(e.target.value)}
                        className="h-7 w-full focus-visible:ring-0"
                    />
                ) : !readonly ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                onDoubleClick={enterEditMode}
                                className="text-editable truncate px-2 py-0.5"
                            >
                                {customType.name}
                                <span className="text-xs text-muted-foreground">
                                    {schemaToDisplay
                                        ? ` (${schemaToDisplay})`
                                        : ''}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {t('tool_tips.double_click_to_edit')}
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <div className="truncate px-2 py-0.5">
                        {customType.name}
                        <span className="text-xs text-muted-foreground">
                            {schemaToDisplay ? ` (${schemaToDisplay})` : ''}
                        </span>
                    </div>
                )}
            </div>
            <div className="flex flex-row-reverse items-center">
                {!editMode ? (
                    <>
                        <div>{renderDropDownMenu()}</div>
                        {customType.kind === DBCustomTypeKind.enum ? (
                            <Badge
                                variant="outline"
                                className="h-fit bg-background px-2 text-xs md:group-hover:hidden"
                            >
                                {customTypeKindToLabel[customType.kind]}
                            </Badge>
                        ) : null}
                        {!readonly ? (
                            <div className="flex flex-row-reverse md:hidden md:group-hover:flex">
                                <ListItemHeaderButton onClick={enterEditMode}>
                                    <Pencil />
                                </ListItemHeaderButton>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <ListItemHeaderButton onClick={editCustomTypeName}>
                        <Check />
                    </ListItemHeaderButton>
                )}
            </div>
        </div>
    );
};
