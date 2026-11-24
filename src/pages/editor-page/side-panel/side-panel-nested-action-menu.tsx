import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import { SIDE_PANEL_ACTION_MENU_ITEM_CLASS } from '@/pages/editor-page/side-panel/side-panel-action-menu';
import { cn } from '@/lib/utils';

const SUBMENU_CLOSE_DELAY_MS = 120;

const PORTALED_FORM_LAYER_SELECTOR = [
    '[data-radix-select-content]',
    '[role="listbox"]',
    '[role="dialog"]',
].join(', ');

export const SIDE_PANEL_NESTED_SUB_PANEL_CLASS = cn(
    'w-72 overflow-y-auto overflow-x-hidden p-0',
    'max-h-[var(--radix-popper-available-height)]',
    'data-[state=open]:animate-none data-[state=closed]:animate-none'
);

const isPortaledFormLayer = (target: EventTarget | null): boolean =>
    target instanceof Element &&
    Boolean(target.closest(PORTALED_FORM_LAYER_SELECTOR));

const keepPortaledFormLayerOpen = (event: {
    target: EventTarget | null;
    preventDefault: () => void;
}) => {
    if (isPortaledFormLayer(event.target)) {
        event.preventDefault();
    }
};

export type SidePanelNestedActionMenuProps = {
    menuOpen?: boolean;
    onMenuOpenChange?: (open: boolean) => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
    contentClassName?: string;
};

export const SidePanelNestedActionMenu: React.FC<
    SidePanelNestedActionMenuProps
> = ({ menuOpen, onMenuOpenChange, trigger, children, contentClassName }) => {
    return (
        <DropdownMenu
            open={menuOpen}
            onOpenChange={onMenuOpenChange}
            modal={false}
        >
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent
                sideOffset={4}
                className={contentClassName ?? 'w-fit min-w-40'}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                }}
            >
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export type SidePanelNestedActionSubProps = {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    panelClassName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export const SidePanelNestedActionSub: React.FC<
    SidePanelNestedActionSubProps
> = ({
    label,
    icon,
    children,
    panelClassName,
    open: controlledOpen,
    onOpenChange,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const subTriggerRef = useRef<HTMLDivElement>(null);
    const subContentRef = useRef<HTMLDivElement>(null);
    const closeTimerRef = useRef<number | null>(null);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;

    const setOpen = useCallback((next: boolean) => {
        setUncontrolledOpen(next);
        onOpenChangeRef.current?.(next);
    }, []);

    const cancelScheduledClose = useCallback(() => {
        if (closeTimerRef.current === null) {
            return;
        }
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
    }, []);

    useEffect(() => cancelScheduledClose, [cancelScheduledClose]);

    useEffect(() => {
        if (!open) {
            cancelScheduledClose();
            return;
        }

        const pointerIsInsideSubmenu = (target: EventTarget | null) => {
            if (!(target instanceof Node)) {
                return false;
            }
            if (subContentRef.current?.contains(target)) {
                return true;
            }
            if (subTriggerRef.current?.contains(target)) {
                return true;
            }
            return isPortaledFormLayer(target);
        };

        const closeWhenPointerLeavesSubmenu = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') {
                return;
            }
            if (pointerIsInsideSubmenu(event.target)) {
                cancelScheduledClose();
                return;
            }
            if (closeTimerRef.current !== null) {
                return;
            }
            closeTimerRef.current = window.setTimeout(() => {
                closeTimerRef.current = null;
                setOpen(false);
            }, SUBMENU_CLOSE_DELAY_MS);
        };

        document.addEventListener('pointermove', closeWhenPointerLeavesSubmenu);
        return () => {
            document.removeEventListener(
                'pointermove',
                closeWhenPointerLeavesSubmenu
            );
        };
    }, [cancelScheduledClose, open, setOpen]);

    return (
        <DropdownMenuSub open={open} onOpenChange={setOpen}>
            <DropdownMenuSubTrigger
                ref={subTriggerRef}
                className={SIDE_PANEL_ACTION_MENU_ITEM_CLASS}
                onPointerLeave={(event) => {
                    if (open && event.pointerType === 'mouse') {
                        event.preventDefault();
                    }
                }}
            >
                {icon}
                {label}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
                ref={subContentRef}
                sideOffset={8}
                alignOffset={-5}
                collisionPadding={12}
                className={cn(
                    SIDE_PANEL_NESTED_SUB_PANEL_CLASS,
                    panelClassName
                )}
                onFocusOutside={keepPortaledFormLayerOpen}
                onInteractOutside={keepPortaledFormLayerOpen}
            >
                {children}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
};
