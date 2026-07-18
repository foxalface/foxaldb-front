import React, { StrictMode } from 'react';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetEditingConflictExplanationForTests } from '@/lib/realtime/editing-conflict-explanation';

const translationState = vi.hoisted(() => ({
    lastWriterWins: "Changes aren't locked. The last saved edit wins.",
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) =>
            key === 'editing_conflict.last_writer_wins'
                ? translationState.lastWriterWins
                : key,
    }),
}));

import { useEditingConflictExplanation } from '../use-editing-conflict-explanation';

describe('useEditingConflictExplanation', () => {
    beforeEach(() => {
        resetEditingConflictExplanationForTests();
        translationState.lastWriterWins =
            "Changes aren't locked. The last saved edit wins.";
    });

    afterEach(() => {
        resetEditingConflictExplanationForTests();
    });

    it('returns empty while there is no visible conflict', () => {
        const { result } = renderHook(() =>
            useEditingConflictExplanation(false)
        );

        expect(result.current).toBe('');
    });

    it('shows the explanation on the first visible conflict', () => {
        const { result, rerender } = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );

        expect(result.current).toBe('');

        rerender({ hasVisibleConflict: true });

        expect(result.current).toBe(translationState.lastWriterWins);
    });

    it('keeps the explanation after Strict Mode effect cleanup and replay', () => {
        const { result } = renderHook(
            () => useEditingConflictExplanation(true),
            {
                wrapper: ({ children }) =>
                    React.createElement(StrictMode, null, children),
            }
        );

        expect(result.current).toBe(translationState.lastWriterWins);
    });

    it('does not show the explanation for a second simultaneous hook', () => {
        const owner = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );
        const other = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );

        owner.rerender({ hasVisibleConflict: true });
        other.rerender({ hasVisibleConflict: true });

        expect(owner.result.current).toBe(translationState.lastWriterWins);
        expect(other.result.current).toBe('');
    });

    it('completes the episode when the owner conflict ends', () => {
        const { result, rerender } = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );

        rerender({ hasVisibleConflict: true });
        expect(result.current).toBe(translationState.lastWriterWins);

        rerender({ hasVisibleConflict: false });
        expect(result.current).toBe('');

        rerender({ hasVisibleConflict: true });
        expect(result.current).toBe('');
    });

    it('does not let a non-owner inherit after the owner conflict ends', () => {
        const owner = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );
        const other = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );

        owner.rerender({ hasVisibleConflict: true });
        other.rerender({ hasVisibleConflict: true });

        owner.rerender({ hasVisibleConflict: false });

        expect(owner.result.current).toBe('');
        expect(other.result.current).toBe('');
    });

    it('releases safely on owner unmount without letting a new hook inherit', () => {
        const owner = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );

        owner.rerender({ hasVisibleConflict: true });
        expect(owner.result.current).toBe(translationState.lastWriterWins);

        owner.unmount();

        const later = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );

        later.rerender({ hasVisibleConflict: true });
        expect(later.result.current).toBe('');
    });

    it('does not treat a full unmount/remount as Strict Mode effect replay', () => {
        const first = renderHook(() => useEditingConflictExplanation(true));

        expect(first.result.current).toBe(translationState.lastWriterWins);

        first.unmount();

        const remounted = renderHook(() => useEditingConflictExplanation(true));

        expect(remounted.result.current).toBe('');
    });

    it('updates the visible owner explanation when the language changes', () => {
        const { result, rerender } = renderHook(
            ({ hasVisibleConflict }) =>
                useEditingConflictExplanation(hasVisibleConflict),
            { initialProps: { hasVisibleConflict: false } }
        );

        rerender({ hasVisibleConflict: true });
        expect(result.current).toBe(
            "Changes aren't locked. The last saved edit wins."
        );

        translationState.lastWriterWins =
            'Les modifications ne sont pas verrouillées. La dernière modification enregistrée l’emporte.';
        rerender({ hasVisibleConflict: true });

        expect(result.current).toBe(translationState.lastWriterWins);
    });
});
