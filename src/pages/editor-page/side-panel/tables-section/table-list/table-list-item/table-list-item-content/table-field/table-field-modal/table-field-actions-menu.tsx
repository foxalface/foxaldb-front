import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ellipsis, List, Tags, Trash2 } from 'lucide-react';
import { TagSelector } from '@/components/tag-selector/tag-selector';
import { Button } from '@/components/button/button';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/dropdown-menu/dropdown-menu';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';
import { useChartDB } from '@/hooks/use-chartdb';
import { SidePanelConversationMenuItem } from '@/pages/editor-page/side-panel/side-panel-conversation-menu-item';
import { useTargetConversationMenuAction } from '@/hooks/use-target-conversation-menu-action';
import {
    SidePanelNestedActionMenu,
    SidePanelNestedActionSub,
} from '@/pages/editor-page/side-panel/side-panel-nested-action-menu';
import { useTranslation } from 'react-i18next';
import type { DBField } from '@/lib/domain/db-field';
import type { DatabaseType, DBTable } from '@/lib/domain';
import { TableFieldAttributesPanel } from './table-field-attributes-panel';

export type TableFieldActionsMenuProps = {
    field: DBField;
    table: DBTable;
    databaseType: DatabaseType;
    updateField: (attrs: Partial<DBField>) => void;
    removeField: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export const TableFieldActionsMenu: React.FC<TableFieldActionsMenuProps> = ({
    field,
    table,
    databaseType,
    updateField,
    removeField,
    open = false,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const { readonly } = useChartDB();
    const [menuOpen, setMenuOpen] = useState(false);
    const [attributesOpen, setAttributesOpen] = useState(false);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;

    const conversationMenu = useTargetConversationMenuAction({
        targetType: 'field',
        targetId: field.id,
    });

    useEffect(() => {
        if (!open) {
            return;
        }
        setMenuOpen(true);
        setAttributesOpen(true);
        onOpenChangeRef.current?.(false);
    }, [open]);

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
        setAttributesOpen(false);
        onOpenChangeRef.current?.(false);
    }, []);

    const openFieldDiscussion = useCallback(() => {
        conversationMenu.openConversationAction();
        closeMenu();
    }, [closeMenu, conversationMenu]);

    const handleRemoveField = useCallback(() => {
        removeField();
        closeMenu();
    }, [closeMenu, removeField]);

    const trigger = (
        <Button
            type="button"
            variant="ghost"
            aria-label={t(
                'side_panel.tables_section.table.field_actions.menu_title'
            )}
            className="h-8 w-[32px] p-2 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
            <Ellipsis className="size-3.5" aria-hidden="true" />
        </Button>
    );

    return (
        <SidePanelNestedActionMenu
            menuOpen={menuOpen}
            onMenuOpenChange={(nextOpen) => {
                if (nextOpen) {
                    setMenuOpen(true);
                    return;
                }
                closeMenu();
            }}
            trigger={trigger}
        >
            {conversationMenu.showConversationAction ? (
                <>
                    <SidePanelConversationMenuItem
                        label={conversationMenu.conversationLabel}
                        isPending={conversationMenu.isConversationPending}
                        onSelect={openFieldDiscussion}
                    />
                    <DropdownMenuSeparator />
                </>
            ) : null}
            <SidePanelNestedActionSub
                label={t(
                    'side_panel.tables_section.table.field_actions.attributes'
                )}
                icon={<List className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />}
                open={attributesOpen}
                onOpenChange={setAttributesOpen}
            >
                <TableFieldAttributesPanel
                    field={field}
                    table={table}
                    databaseType={databaseType}
                    updateField={updateField}
                    active={attributesOpen}
                />
            </SidePanelNestedActionSub>
            <SidePanelNestedActionSub
                label={t('tags.title')}
                icon={<Tags className={SIDE_PANEL_ACTION_MENU_ICON_CLASS} />}
                panelClassName="w-auto overflow-visible p-2 max-h-none"
            >
                <TagSelector
                    targetType="field"
                    targetId={field.id}
                    disabled={readonly}
                />
            </SidePanelNestedActionSub>
            {!readonly ? (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={handleRemoveField}
                            className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                        >
                            <Trash2
                                className={
                                    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                                }
                                aria-hidden="true"
                            />
                            {t('delete')}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </>
            ) : null}
        </SidePanelNestedActionMenu>
    );
};
