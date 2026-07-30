import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LayoutProvider } from '../layout-provider';
import { useLayout } from '@/hooks/use-layout';

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

describe('Layout conversations navigation', () => {
    beforeEach(() => {
        diagramIdState.current = '42';
    });

    it('openConversationDetail sets navigation intent and opens conversations', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        act(() => {
            result.current.openConversationDetail(15);
        });

        expect(result.current.conversationNavigationIntent).toEqual({
            conversationId: 15,
        });
        expect(result.current.selectedSidebarSection).toBe('conversations');
        expect(result.current.isSidePanelShowed).toBe(true);
    });

    it('clearConversationNavigationIntent clears the intent', () => {
        const { result } = renderHook(() => useLayout(), { wrapper });

        act(() => {
            result.current.openConversationDetail(15);
        });
        act(() => {
            result.current.clearConversationNavigationIntent();
        });

        expect(result.current.conversationNavigationIntent).toBeNull();
    });

    it('resets conversation navigation when the active diagram changes', () => {
        const { result, rerender } = renderHook(() => useLayout(), {
            wrapper,
        });

        act(() => {
            result.current.openConversationDetail(20);
        });

        diagramIdState.current = '84';
        rerender();

        expect(result.current.conversationNavigationIntent).toBeNull();
    });
});
