import React from 'react';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import {
    SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';

export interface ConversationMessageActionsMenuProps {
    canEdit: boolean;
    canDelete: boolean;
    disabled?: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export const ConversationMessageActionsMenu = React.forwardRef<
    HTMLButtonElement,
    ConversationMessageActionsMenuProps
>(({ canEdit, canDelete, disabled = false, onEdit, onDelete }, ref) => {
    const { t } = useTranslation();

    if (!canEdit && !canDelete) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <Button
                    ref={ref}
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    data-vaul-no-drag
                    aria-label={t(
                        'side_panel.conversations_section.detail.message.actions.title'
                    )}
                    className="size-7 shrink-0 text-muted-foreground opacity-100 focus-visible:opacity-100 md:opacity-70 md:hover:opacity-100"
                >
                    <EllipsisVertical aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-32">
                {canEdit ? (
                    <DropdownMenuItem
                        disabled={disabled}
                        className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                        onSelect={() => {
                            onEdit();
                        }}
                    >
                        <Pencil
                            className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                            aria-hidden="true"
                        />
                        {t(
                            'side_panel.conversations_section.detail.message.actions.edit'
                        )}
                    </DropdownMenuItem>
                ) : null}
                {canEdit && canDelete ? <DropdownMenuSeparator /> : null}
                {canDelete ? (
                    <DropdownMenuItem
                        disabled={disabled}
                        className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                        onSelect={() => {
                            onDelete();
                        }}
                    >
                        <Trash2
                            className={
                                SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                            }
                            aria-hidden="true"
                        />
                        {t('delete')}
                    </DropdownMenuItem>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

ConversationMessageActionsMenu.displayName = 'ConversationMessageActionsMenu';
