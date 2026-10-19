import { getOperatingSystem } from '@/lib/utils';

export enum KeyboardShortcutAction {
    REDO = 'redo',
    UNDO = 'undo',
    NEW_DIAGRAM = 'new_diagram',
    OPEN_DIAGRAM = 'open_diagram',
    SAVE_DIAGRAM = 'save_diagram',
    EXPORT_DIAGRAM = 'export_diagram',
    MERGE_DIAGRAM = 'merge_diagram',
    DELETE_DIAGRAM = 'delete_diagram',
    TOGGLE_SIDE_PANEL = 'toggle_side_panel',
    SHOW_ALL = 'show_all',
    TOGGLE_THEME = 'toggle_theme',
    TOGGLE_FILTER = 'toggle_filter',
}

export interface KeyboardShortcut {
    action: KeyboardShortcutAction;
    keyCombinationLabelMac: string;
    keyCombinationLabelWin: string;
    keyCombinationMac: string;
    keyCombinationWin: string;
}

export const keyboardShortcuts: Record<
    KeyboardShortcutAction,
    KeyboardShortcut
> = {
    [KeyboardShortcutAction.REDO]: {
        action: KeyboardShortcutAction.REDO,
        keyCombinationLabelMac: '⇧⌘Z',
        keyCombinationLabelWin: 'Ctrl+Shift+Z',
        keyCombinationMac: 'meta+shift+z',
        keyCombinationWin: 'ctrl+shift+z',
    },
    [KeyboardShortcutAction.UNDO]: {
        action: KeyboardShortcutAction.UNDO,
        keyCombinationLabelMac: '⌘Z',
        keyCombinationLabelWin: 'Ctrl+Z',
        keyCombinationMac: 'meta+z',
        keyCombinationWin: 'ctrl+z',
    },
    [KeyboardShortcutAction.NEW_DIAGRAM]: {
        action: KeyboardShortcutAction.NEW_DIAGRAM,
        keyCombinationLabelMac: '⇧⌘N',
        keyCombinationLabelWin: 'Ctrl+Shift+N',
        keyCombinationMac: 'meta+shift+n',
        keyCombinationWin: 'ctrl+shift+n',
    },
    [KeyboardShortcutAction.OPEN_DIAGRAM]: {
        action: KeyboardShortcutAction.OPEN_DIAGRAM,
        keyCombinationLabelMac: '⌘O',
        keyCombinationLabelWin: 'Ctrl+O',
        keyCombinationMac: 'meta+o',
        keyCombinationWin: 'ctrl+o',
    },
    [KeyboardShortcutAction.SAVE_DIAGRAM]: {
        action: KeyboardShortcutAction.SAVE_DIAGRAM,
        keyCombinationLabelMac: '⌘S',
        keyCombinationLabelWin: 'Ctrl+S',
        keyCombinationMac: 'meta+s',
        keyCombinationWin: 'ctrl+s',
    },
    [KeyboardShortcutAction.EXPORT_DIAGRAM]: {
        action: KeyboardShortcutAction.EXPORT_DIAGRAM,
        keyCombinationLabelMac: '⇧⌘E',
        keyCombinationLabelWin: 'Ctrl+Shift+E',
        keyCombinationMac: 'meta+shift+e',
        keyCombinationWin: 'ctrl+shift+e',
    },
    [KeyboardShortcutAction.MERGE_DIAGRAM]: {
        action: KeyboardShortcutAction.MERGE_DIAGRAM,
        keyCombinationLabelMac: '⇧⌘M',
        keyCombinationLabelWin: 'Ctrl+Shift+M',
        keyCombinationMac: 'meta+shift+m',
        keyCombinationWin: 'ctrl+shift+m',
    },
    [KeyboardShortcutAction.DELETE_DIAGRAM]: {
        action: KeyboardShortcutAction.DELETE_DIAGRAM,
        keyCombinationLabelMac: '⇧⌘D',
        keyCombinationLabelWin: 'Ctrl+Shift+D',
        keyCombinationMac: 'meta+shift+d',
        keyCombinationWin: 'ctrl+shift+d',
    },
    [KeyboardShortcutAction.TOGGLE_SIDE_PANEL]: {
        action: KeyboardShortcutAction.TOGGLE_SIDE_PANEL,
        keyCombinationLabelMac: '⌘B',
        keyCombinationLabelWin: 'Ctrl+B',
        keyCombinationMac: 'meta+b',
        keyCombinationWin: 'ctrl+b',
    },
    [KeyboardShortcutAction.SHOW_ALL]: {
        action: KeyboardShortcutAction.SHOW_ALL,
        keyCombinationLabelMac: '⌘0',
        keyCombinationLabelWin: 'Ctrl+0',
        keyCombinationMac: 'meta+0',
        keyCombinationWin: 'ctrl+0',
    },
    [KeyboardShortcutAction.TOGGLE_THEME]: {
        action: KeyboardShortcutAction.TOGGLE_THEME,
        keyCombinationLabelMac: '⌘M',
        keyCombinationLabelWin: 'Ctrl+M',
        keyCombinationMac: 'meta+m',
        keyCombinationWin: 'ctrl+m',
    },
    [KeyboardShortcutAction.TOGGLE_FILTER]: {
        action: KeyboardShortcutAction.TOGGLE_FILTER,
        keyCombinationLabelMac: '⌘F',
        keyCombinationLabelWin: 'Ctrl+F',
        keyCombinationMac: 'meta+f',
        keyCombinationWin: 'ctrl+f',
    },
};

export interface KeyboardShortcutForOS {
    action: KeyboardShortcutAction;
    keyCombinationLabel: string;
    keyCombination: string;
}

const operatingSystem = getOperatingSystem();

export const keyboardShortcutsForOS: Record<
    KeyboardShortcutAction,
    KeyboardShortcutForOS
> = Object.keys(keyboardShortcuts).reduce(
    (acc, action) => {
        const keyboardShortcut =
            keyboardShortcuts[action as KeyboardShortcutAction];
        const keyCombinationLabel =
            operatingSystem === 'mac'
                ? keyboardShortcut.keyCombinationLabelMac
                : keyboardShortcut.keyCombinationLabelWin;
        const keyCombination =
            operatingSystem === 'mac'
                ? keyboardShortcut.keyCombinationMac
                : keyboardShortcut.keyCombinationWin;

        return {
            ...acc,
            [action]: {
                action: keyboardShortcut.action,
                keyCombinationLabel,
                keyCombination,
            },
        };
    },
    {} as Record<KeyboardShortcutAction, KeyboardShortcutForOS>
);
