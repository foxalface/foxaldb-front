import { describe, expect, it } from 'vitest';
import {
    KeyboardShortcutAction,
    keyboardShortcuts,
} from '../keyboard-shortcuts';

describe('keyboardShortcuts diagram menu actions', () => {
    it('assigns mnemonic shift-modified bindings for actions with browser conflicts', () => {
        expect(
            keyboardShortcuts[KeyboardShortcutAction.NEW_DIAGRAM]
                .keyCombinationMac
        ).toBe('meta+shift+n');
        expect(
            keyboardShortcuts[KeyboardShortcutAction.EXPORT_DIAGRAM]
                .keyCombinationMac
        ).toBe('meta+shift+e');
        expect(
            keyboardShortcuts[KeyboardShortcutAction.MERGE_DIAGRAM]
                .keyCombinationMac
        ).toBe('meta+shift+m');
        expect(
            keyboardShortcuts[KeyboardShortcutAction.DELETE_DIAGRAM]
                .keyCombinationMac
        ).toBe('meta+shift+d');
    });

    it('keeps Open and Save on standard combinations', () => {
        expect(
            keyboardShortcuts[KeyboardShortcutAction.OPEN_DIAGRAM]
                .keyCombinationMac
        ).toBe('meta+o');
        expect(
            keyboardShortcuts[KeyboardShortcutAction.SAVE_DIAGRAM]
                .keyCombinationMac
        ).toBe('meta+s');
    });

    it('does not register import-related editor shortcuts', () => {
        const actions = Object.values(KeyboardShortcutAction);
        expect(actions).not.toContain('import_diagram');
        expect(actions).not.toContain('import_laravel_migrations');
    });
});
