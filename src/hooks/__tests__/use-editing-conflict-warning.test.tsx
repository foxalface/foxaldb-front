import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RemoteEditingViewModel } from '@/lib/realtime/editing-utils';

const { remoteEditorsState, EMPTY_REMOTE_EDITORS } = vi.hoisted(() => {
    const emptyEditors: RemoteEditingViewModel[] = [];

    return {
        remoteEditorsState: {
            current: emptyEditors,
        },
        EMPTY_REMOTE_EDITORS: emptyEditors,
    };
});

vi.mock('@/hooks/use-remote-editing', () => ({
    EMPTY_REMOTE_EDITORS,
    useEntityRemoteEditing: () => remoteEditorsState.current,
}));

import { useEditingConflictWarning } from '../use-editing-conflict-warning';

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

describe('useEditingConflictWarning', () => {
    beforeEach(() => {
        remoteEditorsState.current = EMPTY_REMOTE_EDITORS;
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns no conflict while isLocallyEditing is false', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result } = renderHook(() =>
            useEditingConflictWarning('field', 'field-1', {
                isLocallyEditing: false,
            })
        );

        expect(result.current.hasConflict).toBe(false);
        expect(result.current.severity).toBe('none');
        expect(result.current.editors).toBe(EMPTY_REMOTE_EDITORS);
        expect(result.current.message).toBe('');
    });

    it('returns no conflict before the default debounce completes', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result } = renderHook(() =>
            useEditingConflictWarning('field', 'field-1', {
                isLocallyEditing: true,
            })
        );

        expect(result.current.hasConflict).toBe(false);
        expect(result.current.editors).toBe(EMPTY_REMOTE_EDITORS);
        expect(result.current.message).toBe('');

        act(() => {
            vi.advanceTimersByTime(299);
        });

        expect(result.current.hasConflict).toBe(false);
        expect(result.current.editors).toBe(EMPTY_REMOTE_EDITORS);
    });

    it('reveals the conflict after 300 ms', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result } = renderHook(() =>
            useEditingConflictWarning('field', 'field-1', {
                isLocallyEditing: true,
            })
        );

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.hasConflict).toBe(true);
        expect(result.current.severity).toBe('high');
        expect(result.current.editors).toEqual(remoteEditorsState.current);
        expect(result.current.message).toBe('Alice is also editing this.');
    });

    it('respects a custom debounce duration', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result } = renderHook(() =>
            useEditingConflictWarning('field', 'field-1', {
                isLocallyEditing: true,
                debounceMs: 500,
            })
        );

        act(() => {
            vi.advanceTimersByTime(499);
        });

        expect(result.current.hasConflict).toBe(false);

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(result.current.hasConflict).toBe(true);
    });

    it('clears immediately when local editing becomes false', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result, rerender } = renderHook(
            ({ isLocallyEditing }) =>
                useEditingConflictWarning('field', 'field-1', {
                    isLocallyEditing,
                }),
            { initialProps: { isLocallyEditing: true } }
        );

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.hasConflict).toBe(true);

        rerender({ isLocallyEditing: false });

        expect(result.current.hasConflict).toBe(false);
        expect(result.current.severity).toBe('none');
        expect(result.current.editors).toBe(EMPTY_REMOTE_EDITORS);
        expect(result.current.message).toBe('');
    });

    it('clears immediately when remote editors become empty', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result, rerender } = renderHook(() =>
            useEditingConflictWarning('field', 'field-1', {
                isLocallyEditing: true,
            })
        );

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.hasConflict).toBe(true);

        remoteEditorsState.current = EMPTY_REMOTE_EDITORS;
        rerender();

        expect(result.current.hasConflict).toBe(false);
        expect(result.current.editors).toBe(EMPTY_REMOTE_EDITORS);
        expect(result.current.message).toBe('');
    });

    it('cancels a pending timer when the remote editor disappears', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result, rerender } = renderHook(() =>
            useEditingConflictWarning('field', 'field-1', {
                isLocallyEditing: true,
            })
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        remoteEditorsState.current = EMPTY_REMOTE_EDITORS;
        rerender();

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.hasConflict).toBe(false);
        expect(result.current.editors).toBe(EMPTY_REMOTE_EDITORS);
    });

    it('cancels a pending timer on unmount', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result, unmount } = renderHook(() =>
            useEditingConflictWarning('field', 'field-1', {
                isLocallyEditing: true,
            })
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        unmount();

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.hasConflict).toBe(false);
    });

    it('exposes the latest remote editor list after the debounce', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
        ];

        const { result, rerender } = renderHook(() =>
            useEditingConflictWarning('field', 'field-1', {
                isLocallyEditing: true,
            })
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
            createEditor({ userId: 3, name: 'Bob' }),
        ];
        rerender();

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.hasConflict).toBe(true);
        expect(result.current.editors).toEqual(remoteEditorsState.current);
        expect(result.current.message).toBe(
            'Alice and Bob are also editing this.'
        );
    });

    it('keeps the derived message aligned with the visible editor list', () => {
        remoteEditorsState.current = [
            createEditor({ userId: 2, name: 'Alice' }),
            createEditor({ userId: 3, name: 'Bob' }),
            createEditor({ userId: 4, name: 'Carol' }),
        ];

        const { result } = renderHook(() =>
            useEditingConflictWarning('table', 'table-1', {
                isLocallyEditing: true,
            })
        );

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.editors).toHaveLength(3);
        expect(result.current.message).toBe(
            'Alice and 2 others are also editing this.'
        );
    });
});
