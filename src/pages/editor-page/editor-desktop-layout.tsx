import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { SidePanel } from './side-panel/side-panel';
import { Canvas } from './canvas/canvas';
import { useLayout } from '@/hooks/use-layout';
import type { Diagram } from '@/lib/domain/diagram';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/sidebar/sidebar';
import { EditorSidebar } from './editor-sidebar/editor-sidebar';
import { TopNavbar } from './top-navbar/top-navbar';

import type { EntryFlowActiveDiagramDeletionActions } from '@/pages/editor-page/entry-flow-active-diagram-deletion-actions';

const MIN_SIDE_PANEL_WIDTH_PX = 350;
const DEFAULT_SIDE_PANEL_WIDTH_RATIO = 0.25;

const sidePanelResizeHandleClassName =
    'relative flex w-px shrink-0 cursor-ew-resize items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1';

export interface EditorDesktopLayoutProps extends EntryFlowActiveDiagramDeletionActions {
    initialDiagram?: Diagram;
}
export const EditorDesktopLayout: React.FC<EditorDesktopLayoutProps> = ({
    initialDiagram,
    onActiveDiagramDeleted,
}) => {
    const { isSidePanelShowed } = useLayout();
    const layoutContainerRef = useRef<HTMLDivElement>(null);
    const [sidePanelWidthPx, setSidePanelWidthPx] = useState<number | null>(
        null
    );
    const [isResizingSidePanel, setIsResizingSidePanel] = useState(false);

    const resolveDefaultSidePanelWidth = useCallback((): number => {
        const containerWidth = layoutContainerRef.current?.clientWidth ?? 0;
        return Math.max(
            MIN_SIDE_PANEL_WIDTH_PX,
            Math.round(containerWidth * DEFAULT_SIDE_PANEL_WIDTH_RATIO)
        );
    }, []);

    const resolvedSidePanelWidth =
        sidePanelWidthPx ?? resolveDefaultSidePanelWidth();

    useLayoutEffect(() => {
        if (!isSidePanelShowed || sidePanelWidthPx !== null) {
            return;
        }

        setSidePanelWidthPx(resolveDefaultSidePanelWidth());
    }, [isSidePanelShowed, resolveDefaultSidePanelWidth, sidePanelWidthPx]);

    const handleSidePanelResizeStart = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.preventDefault();

            const containerWidth =
                layoutContainerRef.current?.clientWidth ?? window.innerWidth;
            const maxWidth = Math.max(
                MIN_SIDE_PANEL_WIDTH_PX,
                containerWidth - MIN_SIDE_PANEL_WIDTH_PX
            );
            const startX = event.clientX;
            const startWidth = resolvedSidePanelWidth;

            setIsResizingSidePanel(true);

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const nextWidth = Math.min(
                    maxWidth,
                    Math.max(
                        MIN_SIDE_PANEL_WIDTH_PX,
                        startWidth + moveEvent.clientX - startX
                    )
                );
                setSidePanelWidthPx(nextWidth);
            };

            const handleMouseUp = () => {
                setIsResizingSidePanel(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [resolvedSidePanelWidth]
    );

    return (
        <>
            <TopNavbar onActiveDiagramDeleted={onActiveDiagramDeleted} />
            <SidebarProvider
                defaultOpen={false}
                open={false}
                className="h-full min-h-0"
            >
                <EditorSidebar />
                <div
                    ref={layoutContainerRef}
                    className="flex min-h-0 min-w-0 flex-1"
                >
                    <div
                        className={cn(
                            'shrink-0 overflow-hidden',
                            !isResizingSidePanel && 'transition-[width]',
                            isSidePanelShowed
                                ? 'duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                                : 'pointer-events-none w-0 duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
                        )}
                        style={{
                            width: isSidePanelShowed
                                ? resolvedSidePanelWidth
                                : 0,
                        }}
                    >
                        <div
                            className="flex h-full min-w-[350px]"
                            style={{ width: resolvedSidePanelWidth }}
                        >
                            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                                <SidePanel />
                            </div>
                            <div
                                role="separator"
                                aria-orientation="vertical"
                                aria-hidden={!isSidePanelShowed}
                                onMouseDown={handleSidePanelResizeStart}
                                className={cn(
                                    sidePanelResizeHandleClassName,
                                    !isSidePanelShowed && 'pointer-events-none'
                                )}
                            />
                        </div>
                    </div>
                    <div className="min-h-0 min-w-0 flex-1">
                        <Canvas initialTables={initialDiagram?.tables ?? []} />
                    </div>
                </div>
            </SidebarProvider>
        </>
    );
};

export default EditorDesktopLayout;
