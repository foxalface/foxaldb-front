import React, { useContext, useEffect, useRef } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
    chartDBContext,
    type ChartDBContext,
} from '@/context/chartdb-context/chartdb-context';
import { DIAGRAM_DISCUSSION_TARGET } from '@/lib/comments/resolve-discussion-target';
import { useLayout } from '@/hooks/use-layout';
import { LayoutProvider } from '../layout-provider';

vi.mock('@/hooks/use-breakpoint', () => ({
    useBreakpoint: () => ({ isMd: true }),
}));

const captureDefaultChartDB = (): ChartDBContext => {
    let captured: ChartDBContext | null = null;
    const Capture: React.FC = () => {
        captured = useContext(chartDBContext);
        return null;
    };
    render(<Capture />);
    if (captured === null) {
        throw new Error('Failed to capture ChartDB default context');
    }
    return captured;
};

describe('LayoutProvider ChartDB dependency', () => {
    let chartDBDefault: ChartDBContext;

    beforeEach(() => {
        chartDBDefault = captureDefaultChartDB();
    });

    it('keeps ChartDBEditorProvider above LayoutProvider in editor-page', () => {
        const editorPagePath = resolve(
            dirname(fileURLToPath(import.meta.url)),
            '../../../pages/editor-page/editor-page.tsx'
        );
        const source = readFileSync(editorPagePath, 'utf8');
        const chartOpen = source.indexOf('<ChartDBEditorProvider>');
        const layoutOpen = source.indexOf('<LayoutProvider>');
        const chartClose = source.indexOf('</ChartDBEditorProvider>');

        expect(chartOpen).toBeGreaterThan(-1);
        expect(layoutOpen).toBeGreaterThan(chartOpen);
        expect(layoutOpen).toBeLessThan(chartClose);
    });

    it('reads LayoutContext when mounted under a ChartDB context', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <chartDBContext.Provider
                value={{ ...chartDBDefault, diagramId: '42' }}
            >
                <LayoutProvider>{children}</LayoutProvider>
            </chartDBContext.Provider>
        );

        const { result } = renderHook(() => useLayout(), { wrapper });

        expect(result.current.discussionView).toBe('all');
        expect(screen.queryByText(/missing|error/i)).not.toBeInTheDocument();
    });

    it('resets discussion navigation when ChartDB diagramId changes without remounting', () => {
        let diagramId = '42';
        let layoutProviderMounts = 0;

        const ChartDBHarness: React.FC<{ children: React.ReactNode }> = ({
            children,
        }) => (
            <chartDBContext.Provider value={{ ...chartDBDefault, diagramId }}>
                {children}
            </chartDBContext.Provider>
        );

        const MountTracker: React.FC = () => {
            const mounted = useRef(false);
            useEffect(() => {
                if (!mounted.current) {
                    mounted.current = true;
                    layoutProviderMounts += 1;
                }
            }, []);
            return null;
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <ChartDBHarness>
                <LayoutProvider>
                    <MountTracker />
                    {children}
                </LayoutProvider>
            </ChartDBHarness>
        );

        const { result, rerender } = renderHook(() => useLayout(), {
            wrapper,
        });

        act(() => {
            result.current.openTargetDiscussion({
                targetType: 'table',
                targetId: 'table-1',
            });
        });
        expect(result.current.discussionView).toBe('target');

        diagramId = '84';
        rerender();

        expect(result.current.discussionView).toBe('all');
        expect(result.current.commentsTarget).toEqual(
            DIAGRAM_DISCUSSION_TARGET
        );
        expect(layoutProviderMounts).toBe(1);
    });
});
