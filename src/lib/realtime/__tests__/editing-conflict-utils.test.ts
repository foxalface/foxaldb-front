import { describe, expect, it } from 'vitest';
import {
    buildEditingConflictMessage,
    computeEditingConflictSeverity,
    type EditingConflictTranslate,
} from '../editing-conflict-utils';
import type { RemoteEditingViewModel } from '../editing-utils';

const createEditor = (
    overrides: Partial<RemoteEditingViewModel> &
        Pick<RemoteEditingViewModel, 'userId' | 'name'>
): RemoteEditingViewModel => ({
    initials: 'CO',
    colorClass: 'bg-red-500',
    borderColorClass: 'border-red-500',
    strokeColorClass: '!stroke-red-500',
    ringColorClass: 'ring-red-500',
    isSelf: false,
    ...overrides,
});

const translate: EditingConflictTranslate = (key, options) => {
    switch (key) {
        case 'editing_conflict.one':
            return `${options?.name ?? ''} is also editing this.`;
        case 'editing_conflict.two':
            return `${options?.name1 ?? ''} and ${options?.name2 ?? ''} are also editing this.`;
        case 'editing_conflict.many':
            return `${options?.name ?? ''} and ${options?.count ?? 0} others are also editing this.`;
        case 'editing_conflict.fallback_name':
            return 'Collaborator';
    }
};

describe('editing-conflict-utils', () => {
    describe('computeEditingConflictSeverity', () => {
        it('returns none when not locally editing', () => {
            expect(
                computeEditingConflictSeverity({
                    isLocallyEditing: false,
                    remoteEditors: [createEditor({ userId: 2, name: 'Alice' })],
                })
            ).toBe('none');
        });

        it('returns none when locally editing with no remote editors', () => {
            expect(
                computeEditingConflictSeverity({
                    isLocallyEditing: true,
                    remoteEditors: [],
                })
            ).toBe('none');
        });

        it('returns high when locally editing with a remote editor', () => {
            expect(
                computeEditingConflictSeverity({
                    isLocallyEditing: true,
                    remoteEditors: [createEditor({ userId: 2, name: 'Alice' })],
                })
            ).toBe('high');
        });
    });

    describe('buildEditingConflictMessage', () => {
        it('returns an empty string for zero editors', () => {
            expect(buildEditingConflictMessage([], translate)).toBe('');
        });

        it('formats a single editor', () => {
            expect(
                buildEditingConflictMessage(
                    [createEditor({ userId: 2, name: 'Alice' })],
                    translate
                )
            ).toBe('Alice is also editing this.');
        });

        it('formats two editors', () => {
            expect(
                buildEditingConflictMessage(
                    [
                        createEditor({ userId: 2, name: 'Alice' }),
                        createEditor({ userId: 3, name: 'Bob' }),
                    ],
                    translate
                )
            ).toBe('Alice and Bob are also editing this.');
        });

        it('formats three or more editors', () => {
            expect(
                buildEditingConflictMessage(
                    [
                        createEditor({ userId: 2, name: 'Alice' }),
                        createEditor({ userId: 3, name: 'Bob' }),
                        createEditor({ userId: 4, name: 'Carol' }),
                    ],
                    translate
                )
            ).toBe('Alice and 2 others are also editing this.');
        });

        it('falls back to Collaborator for blank names', () => {
            expect(
                buildEditingConflictMessage(
                    [createEditor({ userId: 2, name: '   ' })],
                    translate
                )
            ).toBe('Collaborator is also editing this.');
        });

        it('does not mutate the input editors array', () => {
            const editors = [
                createEditor({ userId: 2, name: 'Alice' }),
                createEditor({ userId: 3, name: 'Bob' }),
            ];
            const snapshot = editors.map((editor) => ({ ...editor }));

            buildEditingConflictMessage(editors, translate);

            expect(editors).toEqual(snapshot);
        });

        it('is deterministic for the same input', () => {
            const editors = [
                createEditor({ userId: 2, name: 'Alice' }),
                createEditor({ userId: 3, name: 'Bob' }),
                createEditor({ userId: 4, name: 'Carol' }),
            ];

            expect(buildEditingConflictMessage(editors, translate)).toBe(
                buildEditingConflictMessage(editors, translate)
            );
        });
    });
});
