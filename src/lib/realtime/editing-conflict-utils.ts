import type { RemoteEditingViewModel } from './editing-utils';

export type EditingConflictSeverity = 'high' | 'none';

export const LAST_WRITER_WINS_MESSAGE =
    "Changes aren't locked. The last saved edit wins.";

export const computeEditingConflictSeverity = (input: {
    isLocallyEditing: boolean;
    remoteEditors: readonly RemoteEditingViewModel[];
}): EditingConflictSeverity => {
    if (input.isLocallyEditing && input.remoteEditors.length > 0) {
        return 'high';
    }

    return 'none';
};

const resolveEditorDisplayName = (editor: RemoteEditingViewModel): string => {
    const trimmed = editor.name.trim();

    return trimmed.length > 0 ? trimmed : 'Collaborator';
};

export const buildEditingConflictMessage = (
    editors: readonly RemoteEditingViewModel[]
): string => {
    if (editors.length === 0) {
        return '';
    }

    const names = editors.map(resolveEditorDisplayName);

    if (names.length === 1) {
        return `${names[0]} is also editing this.`;
    }

    if (names.length === 2) {
        return `${names[0]} and ${names[1]} are also editing this.`;
    }

    return `${names[0]} and ${names.length - 1} others are also editing this.`;
};
