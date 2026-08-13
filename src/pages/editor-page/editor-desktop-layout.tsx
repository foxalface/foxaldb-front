import React from 'react';
import { SidePanel } from './side-panel/side-panel';
import { Canvas } from './canvas/canvas';
import { useLayout } from '@/hooks/use-layout';
import type { Diagram } from '@/lib/domain/diagram';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/sidebar/sidebar';
import { EditorSidebar } from './editor-sidebar/editor-sidebar';
import { TopNavbar } from './top-navbar/top-navbar';

import type { EntryFlowActiveDiagramDeletionActions } from '@/pages/editor-page/entry-flow-active-diagram-deletion-actions';

export interface EditorDesktopLayoutProps extends EntryFlowActiveDiagramDeletionActions {
    initialDiagram?: Diagram;
}
export const EditorDesktopLayout: React.FC<EditorDesktopLayoutProps> = ({
    initialDiagram,
    onActiveDiagramDeleted,
}) => {
    const { isSidePanelShowed } = useLayout();

    return (
        <>
            <TopNavbar onActiveDiagramDeleted={onActiveDiagramDeleted} />
            <SidebarProvider
                defaultOpen={false}
                open={false}
                className="h-full min-h-0"
            >
                <EditorSidebar />
                <div className="flex min-h-0 min-w-0 flex-1">
                    <div
                        className={cn(
                            'shrink-0 overflow-hidden transition-[width]',
                            isSidePanelShowed
                                ? 'w-[max(350px,25%)] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                                : 'pointer-events-none w-0 duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
                        )}
                    >
                        <div className="size-full min-w-[350px]">
                            <SidePanel />
                        </div>
                    </div>
                    <div
                        aria-hidden
                        className={cn(
                            'w-px shrink-0 bg-border transition-opacity duration-[380ms]',
                            !isSidePanelShowed && 'opacity-0'
                        )}
                    />
                    <div className="min-h-0 min-w-0 flex-1">
                        <Canvas initialTables={initialDiagram?.tables ?? []} />
                    </div>
                </div>
            </SidebarProvider>
        </>
    );
};

export default EditorDesktopLayout;
