import type { RemoteEditingViewModel } from './editing-utils';

export type EditingConflictSeverity = 'high' | 'none';

export type EditingConflictTranslateKey =
    | 'editing_conflict.one'
    | 'editing_conflict.two'
    | 'editing_conflict.many'
    | 'editing_conflict.fallback_name';

export type EditingConflictTranslateOptions = {
    name?: string;
    name1?: string;
    name2?: string;
    count?: number;
};

export type EditingConflictTranslate = (
    key: EditingConflictTranslateKey,
    options?: EditingConflictTranslateOptions
) => string;

export const computeEditingConflictSeverity = (input: {
    isLocallyEditing: boolean;
    remoteEditors: readonly RemoteEditingViewModel[];
}): EditingConflictSeverity => {
    if (input.isLocallyEditing && input.remoteEditors.length > 0) {
        return 'high';
    }

    return 'none';
};

const resolveEditorDisplayName = (
    editor: RemoteEditingViewModel,
    translate: EditingConflictTranslate
): string => {
    const trimmed = editor.name.trim();

    return trimmed.length > 0
        ? trimmed
        : translate('editing_conflict.fallback_name');
};

export const buildEditingConflictMessage = (
    editors: readonly RemoteEditingViewModel[],
    translate: EditingConflictTranslate
): string => {
    if (editors.length === 0) {
        return '';
    }

    const names = editors.map((editor) =>
        resolveEditorDisplayName(editor, translate)
    );

    if (names.length === 1) {
        return translate('editing_conflict.one', { name: names[0] });
    }

    if (names.length === 2) {
        return translate('editing_conflict.two', {
            name1: names[0],
            name2: names[1],
        });
    }

    return translate('editing_conflict.many', {
        name: names[0],
        count: names.length - 1,
    });
};
