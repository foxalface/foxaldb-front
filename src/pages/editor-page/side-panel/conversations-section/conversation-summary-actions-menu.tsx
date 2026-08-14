import React from 'react';
import {
    Archive,
    ArchiveRestore,
    EllipsisVertical,
    ExternalLink,
    Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';
import { LIST_ITEM_HEADER_BUTTON_CLASS } from '@/pages/editor-page/side-panel/list-item-header-button/list-item-header-button';
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

export interface ConversationSummaryActionsMenuProps {
    isArchived: boolean;
    canDelete: boolean;
    disabled?: boolean;
    onOpen: () => void;
    onArchive?: () => void;
    onReopen?: () => void;
    onDelete: () => void;
    onCloseAutoFocus?: () => void;
}

export const ConversationSummaryActionsMenu = React.forwardRef<
    HTMLButtonElement,
    ConversationSummaryActionsMenuProps
>(
    (
        {
            isArchived,
            canDelete,
            disabled = false,
            onOpen,
            onArchive,
            onReopen,
            onDelete,
            onCloseAutoFocus,
        },
        ref
    ) => {
        const { t } = useTranslation();

        const stopPropagation = (event: React.SyntheticEvent) => {
            event.stopPropagation();
        };

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
                            'side_panel.conversations_section.summary.actions.menu_aria'
                        )}
                        className={cn(
                            LIST_ITEM_HEADER_BUTTON_CLASS,
                            'size-7 shrink-0 p-0'
                        )}
                        onClick={stopPropagation}
                    >
                        <EllipsisVertical
                            className="size-4"
                            aria-hidden="true"
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="min-w-32"
                    onClick={stopPropagation}
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        onCloseAutoFocus?.();
                    }}
                >
                    <DropdownMenuItem
                        disabled={disabled}
                        className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                        onSelect={(event) => {
                            event.preventDefault();
                            onOpen();
                        }}
                    >
                        <ExternalLink
                            className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                            aria-hidden="true"
                        />
                        {t(
                            'side_panel.conversations_section.summary.actions.open'
                        )}
                    </DropdownMenuItem>
                    {isArchived ? (
                        <DropdownMenuItem
                            disabled={disabled}
                            className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                            onSelect={(event) => {
                                event.preventDefault();
                                onReopen?.();
                            }}
                        >
                            <ArchiveRestore
                                className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                                aria-hidden="true"
                            />
                            {t(
                                'side_panel.conversations_section.actions.reopen'
                            )}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            disabled={disabled}
                            className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                            onSelect={(event) => {
                                event.preventDefault();
                                onArchive?.();
                            }}
                        >
                            <Archive
                                className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                                aria-hidden="true"
                            />
                            {t(
                                'side_panel.conversations_section.actions.archive'
                            )}
                        </DropdownMenuItem>
                    )}
                    {canDelete ? (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                disabled={disabled}
                                className={`${SIDE_PANEL_ACTION_MENU_ITEM_CLASS} !text-red-700`}
                                onSelect={(event) => {
                                    event.preventDefault();
                                    onDelete();
                                }}
                            >
                                <Trash2
                                    className={
                                        SIDE_PANEL_ACTION_MENU_DESTRUCTIVE_ICON_CLASS
                                    }
                                    aria-hidden="true"
                                />
                                {t(
                                    'side_panel.conversations_section.summary.actions.delete'
                                )}
                            </DropdownMenuItem>
                        </>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
);

ConversationSummaryActionsMenu.displayName = 'ConversationSummaryActionsMenu';
