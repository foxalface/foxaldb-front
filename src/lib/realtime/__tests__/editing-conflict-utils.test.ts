import { describe, expect, it } from 'vitest';
import {
    LAST_WRITER_WINS_MESSAGE,
    buildEditingConflictMessage,
    computeEditingConflictSeverity,
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

    describe('LAST_WRITER_WINS_MESSAGE', () => {
        it('exposes the last-writer-wins sentence separately', () => {
            expect(LAST_WRITER_WINS_MESSAGE).toBe(
                "Changes aren't locked. The last saved edit wins."
            );
        });
    });

    describe('buildEditingConflictMessage', () => {
        it('returns an empty string for zero editors', () => {
            expect(buildEditingConflictMessage([])).toBe('');
        });

        it('formats a single editor', () => {
            expect(
                buildEditingConflictMessage([
                    createEditor({ userId: 2, name: 'Alice' }),
                ])
            ).toBe('Alice is also editing this.');
        });

        it('formats two editors', () => {
            expect(
                buildEditingConflictMessage([
                    createEditor({ userId: 2, name: 'Alice' }),
                    createEditor({ userId: 3, name: 'Bob' }),
                ])
            ).toBe('Alice and Bob are also editing this.');
        });

        it('formats three or more editors', () => {
            expect(
                buildEditingConflictMessage([
                    createEditor({ userId: 2, name: 'Alice' }),
                    createEditor({ userId: 3, name: 'Bob' }),
                    createEditor({ userId: 4, name: 'Carol' }),
                ])
            ).toBe('Alice and 2 others are also editing this.');
        });

        it('falls back to Collaborator for blank names', () => {
            expect(
                buildEditingConflictMessage([
                    createEditor({ userId: 2, name: '   ' }),
                ])
            ).toBe('Collaborator is also editing this.');
        });

        it('does not mutate the input editors array', () => {
            const editors = [
                createEditor({ userId: 2, name: 'Alice' }),
                createEditor({ userId: 3, name: 'Bob' }),
            ];
            const snapshot = editors.map((editor) => ({ ...editor }));

            buildEditingConflictMessage(editors);

            expect(editors).toEqual(snapshot);
        });

        it('is deterministic for the same input', () => {
            const editors = [
                createEditor({ userId: 2, name: 'Alice' }),
                createEditor({ userId: 3, name: 'Bob' }),
                createEditor({ userId: 4, name: 'Carol' }),
            ];

            expect(buildEditingConflictMessage(editors)).toBe(
                buildEditingConflictMessage(editors)
            );
        });
    });
});
