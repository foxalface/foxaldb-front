import { emptyFn } from '@/lib/utils';
import { createContext } from 'react';
import type { DiagramCommentTarget } from '@/lib/comments/comment-types';
import { DIAGRAM_DISCUSSION_TARGET } from '@/lib/comments/resolve-discussion-target';

export type SidebarSection =
    | 'dbml'
    | 'tables'
    | 'refs'
    | 'customTypes'
    | 'visuals'
    | 'comments';

export type VisualsTab = 'areas' | 'notes';

export type DiscussionView = 'all' | 'diagram' | 'target';

export interface LayoutContext {
    openedTableInSidebar: string | undefined;
    openTableFromSidebar: (tableId: string) => void;
    closeAllTablesInSidebar: () => void;

    openRelationshipFromSidebar: (relationshipId: string) => void;
    closeAllRelationshipsInSidebar: () => void;

    openDependencyFromSidebar: (dependencyId: string) => void;
    closeAllDependenciesInSidebar: () => void;

    openedRefInSidebar: string | undefined;
    openRefFromSidebar: (refId: string) => void;
    closeAllRefsInSidebar: () => void;

    openedAreaInSidebar: string | undefined;
    openAreaFromSidebar: (areaId: string) => void;
    closeAllAreasInSidebar: () => void;

    openedNoteInSidebar: string | undefined;
    openNoteFromSidebar: (noteId: string) => void;
    closeAllNotesInSidebar: () => void;

    openedCustomTypeInSidebar: string | undefined;
    openCustomTypeFromSidebar: (customTypeId: string) => void;
    closeAllCustomTypesInSidebar: () => void;

    selectedSidebarSection: SidebarSection;
    selectSidebarSection: (section: SidebarSection) => void;

    selectedVisualsTab: VisualsTab;
    selectVisualsTab: (tab: VisualsTab) => void;

    isSidePanelShowed: boolean;
    hideSidePanel: () => void;
    showSidePanel: () => void;
    toggleSidePanel: () => void;

    commentsTarget: DiagramCommentTarget;
    discussionView: DiscussionView;
    openAllDiscussions: () => void;
    openDiagramDiscussion: () => void;
    openTargetDiscussion: (target: DiagramCommentTarget) => void;
}

export const layoutContext = createContext<LayoutContext>({
    openedTableInSidebar: undefined,
    selectedSidebarSection: 'tables',

    openRelationshipFromSidebar: emptyFn,
    closeAllRelationshipsInSidebar: emptyFn,

    openDependencyFromSidebar: emptyFn,
    closeAllDependenciesInSidebar: emptyFn,

    openedRefInSidebar: undefined,
    openRefFromSidebar: emptyFn,
    closeAllRefsInSidebar: emptyFn,

    openedAreaInSidebar: undefined,
    openAreaFromSidebar: emptyFn,
    closeAllAreasInSidebar: emptyFn,

    openedNoteInSidebar: undefined,
    openNoteFromSidebar: emptyFn,
    closeAllNotesInSidebar: emptyFn,

    openedCustomTypeInSidebar: undefined,
    openCustomTypeFromSidebar: emptyFn,
    closeAllCustomTypesInSidebar: emptyFn,

    selectSidebarSection: emptyFn,
    openTableFromSidebar: emptyFn,
    closeAllTablesInSidebar: emptyFn,

    selectedVisualsTab: 'areas',
    selectVisualsTab: emptyFn,

    isSidePanelShowed: false,
    hideSidePanel: emptyFn,
    showSidePanel: emptyFn,
    toggleSidePanel: emptyFn,

    commentsTarget: DIAGRAM_DISCUSSION_TARGET,
    discussionView: 'all',
    openAllDiscussions: emptyFn,
    openDiagramDiscussion: emptyFn,
    openTargetDiscussion: emptyFn,
});
