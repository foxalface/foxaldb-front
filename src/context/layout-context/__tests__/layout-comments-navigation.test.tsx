import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DIAGRAM_DISCUSSION_TARGET } from '@/lib/comments/resolve-discussion-target';
import { useLayout } from '@/hooks/use-layout';
import { LayoutProvider } from '../layout-provider';

const diagramIdState = vi.hoisted(() => ({
    current: '42',
}));

vi.mock('@/hooks/use-breakpoint', () => ({
    useBreakpoint: () => ({ isMd: true }),
}));

vi.mock('@/hooks/use-chartdb', () => ({
    useChartDB: () => ({
        diagramId: diagramIdState.current,
    }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LayoutProvider>{children}</LayoutProvider>
);

describe('Layout comments navigation', () => {
    beforeEach(() => {
        diagramIdState.current = '42';
    });

    it('starts in the all view with the diagram target', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        expect(result.current.discussionView).toBe('all');
        expect(result.current.commentsTarget).toEqual(
            DIAGRAM_DISCUSSION_TARGET
        );
    });

    it('openAllDiscussions sets all + diagram target and shows comments', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        act(() => {
            result.current.openTargetDiscussion({
                targetType: 'table',
                targetId: 'table-1',
            });
        });
        act(() => {
            result.current.openAllDiscussions();
        });

        expect(result.current.discussionView).toBe('all');
        expect(result.current.commentsTarget).toEqual(
            DIAGRAM_DISCUSSION_TARGET
        );
        expect(result.current.selectedSidebarSection).toBe('comments');
        expect(result.current.isSidePanelShowed).toBe(true);
    });

    it('openDiagramDiscussion sets diagram + diagram target', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        act(() => {
            result.current.openDiagramDiscussion();
        });

        expect(result.current.discussionView).toBe('diagram');
        expect(result.current.commentsTarget).toEqual(
            DIAGRAM_DISCUSSION_TARGET
        );
        expect(result.current.selectedSidebarSection).toBe('comments');
        expect(result.current.isSidePanelShowed).toBe(true);
    });

    it.each([
        {
            label: 'table',
            target: { targetType: 'table' as const, targetId: 'table-1' },
        },
        {
            label: 'field',
            target: { targetType: 'field' as const, targetId: 'field-1' },
        },
        {
            label: 'relationship',
            target: {
                targetType: 'relationship' as const,
                targetId: 'rel-1',
            },
        },
    ])('openTargetDiscussion supports $label targets', ({ target }) => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        act(() => {
            result.current.openTargetDiscussion(target);
        });

        expect(result.current.discussionView).toBe('target');
        expect(result.current.commentsTarget).toEqual(target);
        expect(result.current.selectedSidebarSection).toBe('comments');
        expect(result.current.isSidePanelShowed).toBe(true);
        expect(JSON.stringify(result.current.commentsTarget)).not.toMatch(
            /Clients|email|Orders/
        );
    });

    it('normalizes a diagram target passed to openTargetDiscussion', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        act(() => {
            result.current.openTargetDiscussion(DIAGRAM_DISCUSSION_TARGET);
        });

        expect(result.current.discussionView).toBe('diagram');
        expect(result.current.commentsTarget).toEqual(
            DIAGRAM_DISCUSSION_TARGET
        );
    });

    it('opening All after a target clears the target context', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        act(() => {
            result.current.openTargetDiscussion({
                targetType: 'table',
                targetId: 'table-1',
            });
        });
        act(() => {
            result.current.openAllDiscussions();
        });

        expect(result.current.discussionView).toBe('all');
        expect(result.current.commentsTarget).toEqual(
            DIAGRAM_DISCUSSION_TARGET
        );
    });

    it('resets discussion navigation when the active diagram changes', () => {
        const { result, rerender } = renderHook(() => useLayout(), {
            wrapper,
        });

        act(() => {
            result.current.openTargetDiscussion({
                targetType: 'field',
                targetId: 'field-1',
            });
        });

        expect(result.current.discussionView).toBe('target');

        diagramIdState.current = '84';
        rerender();

        expect(result.current.discussionView).toBe('all');
        expect(result.current.commentsTarget).toEqual(
            DIAGRAM_DISCUSSION_TARGET
        );
    });

    it('does not reset on same-diagram rerenders', () => {
        const { result, rerender } = renderHook(() => useLayout(), {
            wrapper,
        });

        act(() => {
            result.current.openTargetDiscussion({
                targetType: 'table',
                targetId: 'table-1',
            });
        });

        rerender();
        rerender();

        expect(result.current.discussionView).toBe('target');
        expect(result.current.commentsTarget).toEqual({
            targetType: 'table',
            targetId: 'table-1',
        });
    });

    it('keeps discussion opening callbacks stable', () => {
        const { result, rerender } = renderHook(() => useLayout(), {
            wrapper,
        });

        const first = {
            openAllDiscussions: result.current.openAllDiscussions,
            openDiagramDiscussion: result.current.openDiagramDiscussion,
            openTargetDiscussion: result.current.openTargetDiscussion,
        };

        rerender();

        expect(result.current.openAllDiscussions).toBe(
            first.openAllDiscussions
        );
        expect(result.current.openDiagramDiscussion).toBe(
            first.openDiagramDiscussion
        );
        expect(result.current.openTargetDiscussion).toBe(
            first.openTargetDiscussion
        );
    });

    it('keeps the context value identity stable across unrelated rerenders', () => {
        const { result, rerender } = renderHook(() => useLayout(), {
            wrapper,
        });

        const firstValue = result.current;
        rerender();
        rerender();

        expect(result.current).toBe(firstValue);
    });

    it('replaces the context value when discussion view changes', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        const before = result.current;
        act(() => {
            result.current.openDiagramDiscussion();
        });

        expect(result.current).not.toBe(before);
        expect(result.current.discussionView).toBe('diagram');
        expect(result.current.openAllDiscussions).toBe(
            before.openAllDiscussions
        );
    });

    it('replaces the context value when commentsTarget changes', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        const before = result.current;
        act(() => {
            result.current.openTargetDiscussion({
                targetType: 'table',
                targetId: 'table-1',
            });
        });

        expect(result.current).not.toBe(before);
        expect(result.current.commentsTarget).toEqual({
            targetType: 'table',
            targetId: 'table-1',
        });
        expect(result.current.openTargetDiscussion).toBe(
            before.openTargetDiscussion
        );
    });

    it('replaces the context value when non-discussion layout state changes', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        const before = result.current;
        act(() => {
            result.current.selectSidebarSection('refs');
        });

        expect(result.current).not.toBe(before);
        expect(result.current.selectedSidebarSection).toBe('refs');
        expect(result.current.discussionView).toBe('all');
    });
});
