import React from 'react';
import { keyboardShortcutsContext } from './keyboard-shortcuts-context';
import { useHotkeys } from 'react-hotkeys-hook';
import {
    KeyboardShortcutAction,
    keyboardShortcutsForOS,
} from './keyboard-shortcuts';
import { useHistory } from '@/hooks/use-history';
import { useLayout } from '@/hooks/use-layout';
import { useReactFlow } from '@xyflow/react';
import { useDiagramMenuActions } from '@/pages/editor-page/use-diagram-menu-actions';

export const KeyboardShortcutsProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { redo, undo } = useHistory();
    const { toggleSidePanel } = useLayout();
    const { fitView } = useReactFlow();
    const {
        canMergeDiagram,
        createNewDiagram,
        openDiagram,
        handleSaveDiagram,
        openExportWizard,
        openMergeWizard,
        confirmDeleteDiagram,
    } = useDiagramMenuActions();

    const hotkeyOptions = {
        preventDefault: true,
        enableOnFormTags: false,
    } as const;

    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.REDO].keyCombination,
        redo,
        hotkeyOptions,
        [redo]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.UNDO].keyCombination,
        undo,
        hotkeyOptions,
        [undo]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.NEW_DIAGRAM]
            .keyCombination,
        createNewDiagram,
        hotkeyOptions,
        [createNewDiagram]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.OPEN_DIAGRAM]
            .keyCombination,
        openDiagram,
        hotkeyOptions,
        [openDiagram]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.SAVE_DIAGRAM]
            .keyCombination,
        () => {
            void handleSaveDiagram();
        },
        hotkeyOptions,
        [handleSaveDiagram]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.EXPORT_DIAGRAM]
            .keyCombination,
        openExportWizard,
        hotkeyOptions,
        [openExportWizard]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.MERGE_DIAGRAM]
            .keyCombination,
        openMergeWizard,
        {
            ...hotkeyOptions,
            enabled: canMergeDiagram,
        },
        [openMergeWizard, canMergeDiagram]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.DELETE_DIAGRAM]
            .keyCombination,
        confirmDeleteDiagram,
        hotkeyOptions,
        [confirmDeleteDiagram]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.TOGGLE_SIDE_PANEL]
            .keyCombination,
        toggleSidePanel,
        hotkeyOptions,
        [toggleSidePanel]
    );
    useHotkeys(
        keyboardShortcutsForOS[KeyboardShortcutAction.SHOW_ALL].keyCombination,
        () => {
            fitView({
                duration: 500,
                padding: 0.1,
                maxZoom: 0.8,
            });
        },
        hotkeyOptions,
        [fitView]
    );

    return (
        <keyboardShortcutsContext.Provider value={{}}>
            {children}
        </keyboardShortcutsContext.Provider>
    );
};
