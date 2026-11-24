import React, { useCallback, useEffect, useMemo } from 'react';
import {
    CircleDotDashed,
    GripVertical,
    EllipsisVertical,
    Trash2,
    FileType2,
    FileKey2,
    Check,
    Group,
    Copy,
    Tags,
} from 'lucide-react';
import { ListItemHeaderButton } from '@/pages/editor-page/side-panel/list-item-header-button/list-item-header-button';
import type { DBTable } from '@/lib/domain/db-table';
import { Input } from '@/components/input/input';
import { useChartDB } from '@/hooks/use-chartdb';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { useTargetConversationMenuAction } from '@/hooks/use-target-conversation-menu-action';
import { useEditingBroadcast } from '@/hooks/use-editing-broadcast';
import { createTableEditingItem } from '@/lib/realtime/editing-utils';
import { useClickAway, useKeyPressEvent } from 'react-use';
import { useSortable } from '@dnd-kit/sortable';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { TagSelector } from '@/components/tag-selector/tag-selector';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';
import { useFocusOn } from '@/hooks/use-focus-on';
import { useTranslation } from 'react-i18next';
import { useDialog } from '@/hooks/use-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cloneTable } from '@/lib/clone';
import { cloneTableTagAssignments } from '@/lib/domain/diagram-tag';
import type { DBSchema } from '@/lib/domain';
import { defaultSchemas } from '@/lib/data/default-schemas';
import { SidePanelConversationMenuItem } from '@/pages/editor-page/side-panel/side-panel-conversation-menu-item';
import { ColorPicker } from '@/components/color-picker/color-picker';

export interface TableListItemHeaderProps {
    table: DBTable;
}

export const TableListItemHeader: React.FC<TableListItemHeaderProps> = ({
    table,
}) => {
    const {
        updateTable,
        updateTablesState,
        removeTable,
        createIndex,
        createField,
        createTable,
        schemas,
        databaseType,
        readonly,
        tagAssignments,
        addTagAssignments,
    } = useChartDB();
    const { openTableSchemaDialog } = useDialog();
    const { startEditing, stopEditing } = useEditingBroadcast();
    const { t } = useTranslation();
    const { focusOnTable } = useFocusOn();
    const conversationsAvailable = useConversationsAvailability();
    const conversationMenu = useTargetConversationMenuAction({
        targetType: 'table',
        targetId: table.id,
    });
    const [editMode, setEditMode] = React.useState(false);
    const [tableName, setTableName] = React.useState(table.name);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { listeners } = useSortable({ id: table.id });
    const showDropDownMenu =
        !readonly ||
        (conversationsAvailable && conversationMenu.showConversationAction);

    const editTableName = useCallback(() => {
        if (!editMode) return;
        if (tableName.trim()) {
            updateTable(table.id, { name: tableName.trim() });
        }

        setEditMode(false);
    }, [tableName, table.id, updateTable, editMode]);

    const abortEdit = useCallback(() => {
        setEditMode(false);
        setTableName(table.name);
    }, [table.name]);

    useClickAway(inputRef, editTableName);
    useKeyPressEvent('Enter', editTableName);
    useKeyPressEvent('Escape', abortEdit);

    const enterEditMode = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMode(true);
    };

    const handleFocusOnTable = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.stopPropagation();
            focusOnTable(table.id);
        },
        [focusOnTable, table.id]
    );

    const deleteTableHandler = useCallback(() => {
        removeTable(table.id);
    }, [table.id, removeTable]);

    const updateTableSchema = useCallback(
        ({ schema }: { schema: DBSchema }) => {
            updateTablesState((currentTables) =>
                currentTables.map((t) =>
                    t.id === table.id || !t.schema
                        ? { ...t, schema: schema.name }
                        : t
                )
            );
        },
        [table.id, updateTablesState]
    );

    const changeSchema = useCallback(() => {
        openTableSchemaDialog({
            table,
            schemas,
            onConfirm: updateTableSchema,
            allowSchemaCreation: true,
        });
    }, [openTableSchemaDialog, table, schemas, updateTableSchema]);

    const duplicateTableHandler = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.stopPropagation();
            const clonedTable = cloneTable(table);
            const inheritedAssignments = cloneTableTagAssignments({
                sourceTable: table,
                clonedTable,
                tagAssignments,
            });

            clonedTable.name = `${clonedTable.name}_copy`;
            clonedTable.x += 30;
            clonedTable.y += 50;

            void Promise.resolve(createTable(clonedTable)).then(() => {
                if (inheritedAssignments.length === 0) {
                    return;
                }

                return addTagAssignments(inheritedAssignments);
            });
        },
        [addTagAssignments, createTable, table, tagAssignments]
    );

    const openTableDiscussion = useCallback(() => {
        conversationMenu.openConversationAction();
    }, [conversationMenu]);

    const renderDropDownMenu = useCallback(() => {
        const showSchemaAction =
            !readonly &&
            (schemas.length > 0 || Boolean(defaultSchemas?.[databaseType]));

        return (
            <DropdownMenu>
                <DropdownMenuTrigger
                    aria-label={t(
                        'side_panel.tables_section.table.table_actions.title'
                    )}
                >
                    <ListItemHeaderButton>
                        <EllipsisVertical aria-hidden="true" />
                    </ListItemHeaderButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-fit min-w-40"
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                    }}
                >
                    {conversationMenu.showConversationAction ? (
                        <DropdownMenuGroup>
                            <SidePanelConversationMenuItem
                                label={conversationMenu.conversationLabel}
                                isPending={
                                    conversationMenu.isConversationPending
                                }
                                onSelect={openTableDiscussion}
                            />
                        </DropdownMenuGroup>
                    ) : null}
                    {conversationMenu.showConversationAction && !readonly ? (
                        <DropdownMenuSeparator />
                    ) : null}
                    {!readonly ? (
                        <>
                            {showSchemaAction ? (
                                <>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            className={
                                                SIDE_PANEL_ACTION_MENU_ITEM_CLASS
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                changeSchema();
                                            }}
                                        >
                                            <Group
                                                className={
                                                    SIDE_PANEL_ACTION_MENU_ICON_CLASS
                                                }
                                            />
                                            {t(
                                                'side_panel.tables_section.table.table_actions.change_schema'
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                </>
                            ) : null}
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    className={
                                        SIDE_PANEL_ACTION_MENU_ITEM_CLASS
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        createField(table.id);
                                    }}
                                >
                                    <FileType2
                                        className={
                                            SIDE_PANEL_ACTION_MENU_ICON_CLASS
                                        }
                                    />
                                    {t(
                                        'side_panel.tables_section.table.table_actions.add_field'
                                    )}
                                </DropdownMenuItem>
                                {!table.isView ? (
                                    <DropdownMenuItem
                                        className={
                                            SIDE_PANEL_ACTION_MENU_ITEM_CLASS
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            createIndex(table.id);
                                        }}
                                    >
                                        <FileKey2
                                            className={
                                                SIDE_PANEL_ACTION_MENU_ICON_CLASS
                                            }
                                        />
                                        {t(
                                            'side_panel.tables_section.table.table_actions.add_index'
                                        )}
                                    </DropdownMenuItem>
                                ) : null}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger
                                        className={
                                            SIDE_PANEL_ACTION_MENU_ITEM_CLASS
                                        }
                                    >
                                        <Tags
                                            className={
                                                SIDE_PANEL_ACTION_MENU_ICON_CLASS
                                            }
                                        />
                                        {t('tags.title')}
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-auto p-2">
                                        <TagSelector
                                            targetType="table"
                                            targetId={table.id}
                                        />
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={duplicateTableHandler}
                                    className={
                                        SIDE_PANEL_ACTION_MENU_ITEM_CLASS
                                    }
                                >
                                    <Copy
                                        className={
                                            SIDE_PANEL_ACTION_MENU_ICON_CLASS
                                        }
                                    />
                                    {t(
                                        'side_panel.tables_section.table.table_actions.duplicate_table'
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={deleteTableHandler}
                                    className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                                >
                                    <Trash2
                                        className={
                                            SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                                        }
                                    />
                                    {t('delete')}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }, [
        table.id,
        table.isView,
        createField,
        createIndex,
        deleteTableHandler,
        duplicateTableHandler,
        t,
        changeSchema,
        schemas.length,
        databaseType,
        conversationMenu,
        readonly,
        openTableDiscussion,
    ]);

    const schemaToDisplay = useMemo(() => {
        if (schemas.length > 1) {
            return table.schema ?? defaultSchemas[databaseType];
        }
    }, [table.schema, schemas.length, databaseType]);

    useEffect(() => {
        if (table.name.trim()) {
            setTableName(table.name.trim());
        }
    }, [table.name]);

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
                        placeholder={table.name}
                        value={tableName}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setTableName(e.target.value)}
                        onFocus={() =>
                            startEditing(createTableEditingItem(table.id))
                        }
                        onBlur={stopEditing}
                        className="side-panel-group-hover-surface h-7 w-full focus-visible:ring-0"
                    />
                ) : !readonly ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                onDoubleClick={enterEditMode}
                                className="text-editable truncate px-2 py-0.5"
                            >
                                {table.name}
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
                        {table.name}
                        <span className="text-xs text-muted-foreground">
                            {schemaToDisplay ? ` (${schemaToDisplay})` : ''}
                        </span>
                    </div>
                )}
            </div>
            <div className="flex flex-row-reverse items-center">
                {!editMode ? (
                    <>
                        {showDropDownMenu ? (
                            <div>{renderDropDownMenu()}</div>
                        ) : null}
                        {table.isView ? (
                            <span className="rounded bg-muted px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
                                View
                            </span>
                        ) : null}
                        {!readonly && !table.isView ? (
                            <ColorPicker
                                appearance="list-item-header"
                                color={table.color}
                                onChange={(nextColor) =>
                                    updateTable(table.id, {
                                        color: nextColor,
                                    })
                                }
                            />
                        ) : null}
                        <div className="group/actions flex items-center md:hidden md:group-focus-within/actions:flex md:group-hover:flex">
                            <ListItemHeaderButton onClick={handleFocusOnTable}>
                                <CircleDotDashed />
                            </ListItemHeaderButton>
                        </div>
                    </>
                ) : (
                    <ListItemHeaderButton onClick={editTableName}>
                        <Check />
                    </ListItemHeaderButton>
                )}
            </div>
        </div>
    );
};
