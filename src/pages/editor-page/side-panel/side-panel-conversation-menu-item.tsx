import React from 'react';
import { SlBubbles } from 'react-icons/sl';
import { DropdownMenuItem } from '@/components/dropdown-menu/dropdown-menu';
import {
    SIDE_PANEL_ACTION_MENU_ICON_CLASS,
    SIDE_PANEL_ACTION_MENU_ITEM_CLASS,
} from '@/pages/editor-page/side-panel/side-panel-action-menu';

export type SidePanelConversationMenuItemProps = {
    label: string;
    disabled?: boolean;
    isPending?: boolean;
    onSelect: () => void;
};

export const SidePanelConversationMenuItem: React.FC<
    SidePanelConversationMenuItemProps
> = ({ label, disabled = false, isPending = false, onSelect }) => {
    return (
        <DropdownMenuItem
            className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
            disabled={disabled || isPending}
            aria-busy={isPending || undefined}
            onSelect={(event) => {
                event.preventDefault();
                onSelect();
            }}
        >
            <SlBubbles
                className={SIDE_PANEL_ACTION_MENU_ICON_CLASS}
                aria-hidden="true"
            />
            {label}
        </DropdownMenuItem>
    );
};
