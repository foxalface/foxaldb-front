import React from 'react';
import { Ellipsis, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';

export interface CommentActionsMenuProps {
    canEdit: boolean;
    disabled?: boolean;
    onEdit: () => void;
}

export const CommentActionsMenu = React.forwardRef<
    HTMLButtonElement,
    CommentActionsMenuProps
>(({ canEdit, disabled = false, onEdit }, ref) => {
    const { t } = useTranslation();

    if (!canEdit) {
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
                        'side_panel.comments_section.item_actions.title'
                    )}
                    className="size-7 shrink-0 text-muted-foreground opacity-100 focus-visible:opacity-100 md:opacity-70 md:hover:opacity-100"
                >
                    <Ellipsis className="size-3.5" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem
                    disabled={disabled}
                    className="flex justify-between gap-4"
                    onSelect={() => {
                        onEdit();
                    }}
                >
                    {t('side_panel.comments_section.item_actions.edit')}
                    <Pencil className="size-3.5" aria-hidden="true" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

CommentActionsMenu.displayName = 'CommentActionsMenu';
