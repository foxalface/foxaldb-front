import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type {
    DiscussionView,
    LayoutContext,
    SidebarSection,
    VisualsTab,
} from './layout-context';
import { layoutContext } from './layout-context';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useChartDB } from '@/hooks/use-chartdb';
import type { DiagramCommentTarget } from '@/lib/comments/comment-types';
import { DIAGRAM_DISCUSSION_TARGET } from '@/lib/comments/resolve-discussion-target';

const resetDiscussionNavigation = (
    setDiscussionView: React.Dispatch<React.SetStateAction<DiscussionView>>,
    setCommentsTarget: React.Dispatch<
        React.SetStateAction<DiagramCommentTarget>
    >
): void => {
    setDiscussionView('all');
    setCommentsTarget(DIAGRAM_DISCUSSION_TARGET);
};

export const LayoutProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { isMd: isDesktop } = useBreakpoint('md');
    // LayoutProvider must sit under ChartDBEditorProvider so diagram identity
    // is available without a provider cycle (see editor-page provider tree).
    const { diagramId } = useChartDB();
    const previousDiagramIdRef = useRef(diagramId);

    const [openedTableInSidebar, setOpenedTableInSidebar] = React.useState<
        string | undefined
    >();
    const [openedRefInSidebar, setOpenedRefInSidebar] = React.useState<
        string | undefined
    >();
    const [openedAreaInSidebar, setOpenedAreaInSidebar] = React.useState<
        string | undefined
    >();
    const [openedNoteInSidebar, setOpenedNoteInSidebar] = React.useState<
        string | undefined
    >();
    const [openedCustomTypeInSidebar, setOpenedCustomTypeInSidebar] =
        React.useState<string | undefined>();
    const [selectedSidebarSection, setSelectedSidebarSection] =
        React.useState<SidebarSection>('tables');
    const [selectedVisualsTab, setSelectedVisualsTab] =
        React.useState<VisualsTab>('areas');
    const [isSidePanelShowed, setIsSidePanelShowed] =
        React.useState<boolean>(isDesktop);
    const [discussionView, setDiscussionView] =
        React.useState<DiscussionView>('all');
    const [commentsTarget, setCommentsTarget] =
        React.useState<DiagramCommentTarget>(DIAGRAM_DISCUSSION_TARGET);

    useEffect(() => {
        if (previousDiagramIdRef.current === diagramId) {
            return;
        }
        previousDiagramIdRef.current = diagramId;
        resetDiscussionNavigation(setDiscussionView, setCommentsTarget);
    }, [diagramId]);

    const closeAllTablesInSidebar = useCallback(() => {
        setOpenedTableInSidebar('');
    }, []);

    const closeAllRelationshipsInSidebar = useCallback(() => {
        setOpenedRefInSidebar('');
    }, []);

    const closeAllDependenciesInSidebar = useCallback(() => {
        setOpenedRefInSidebar('');
    }, []);

    const closeAllRefsInSidebar = useCallback(() => {
        setOpenedRefInSidebar('');
    }, []);

    const closeAllAreasInSidebar = useCallback(() => {
        setOpenedAreaInSidebar('');
    }, []);

    const closeAllNotesInSidebar = useCallback(() => {
        setOpenedNoteInSidebar('');
    }, []);

    const closeAllCustomTypesInSidebar = useCallback(() => {
        setOpenedCustomTypeInSidebar('');
    }, []);

    const hideSidePanel = useCallback(() => {
        setIsSidePanelShowed(false);
    }, []);

    const showSidePanel = useCallback(() => {
        setIsSidePanelShowed(true);
    }, []);

    const toggleSidePanel = useCallback(() => {
        setIsSidePanelShowed((prevIsSidePanelShowed) => !prevIsSidePanelShowed);
    }, []);

    const openTableFromSidebar = useCallback((tableId: string) => {
        setIsSidePanelShowed(true);
        setSelectedSidebarSection('tables');
        setOpenedTableInSidebar(tableId);
    }, []);

    const openRelationshipFromSidebar = useCallback(
        (relationshipId: string) => {
            setIsSidePanelShowed(true);
            setSelectedSidebarSection('refs');
            setOpenedRefInSidebar(relationshipId);
        },
        []
    );

    const openDependencyFromSidebar = useCallback((dependencyId: string) => {
        setIsSidePanelShowed(true);
        setSelectedSidebarSection('refs');
        setOpenedRefInSidebar(dependencyId);
    }, []);

    const openRefFromSidebar = useCallback((refId: string) => {
        setIsSidePanelShowed(true);
        setSelectedSidebarSection('refs');
        setOpenedRefInSidebar(refId);
    }, []);

    const openAreaFromSidebar = useCallback((areaId: string) => {
        setIsSidePanelShowed(true);
        setSelectedSidebarSection('visuals');
        setSelectedVisualsTab('areas');
        setOpenedAreaInSidebar(areaId);
    }, []);

    const openNoteFromSidebar = useCallback((noteId: string) => {
        setIsSidePanelShowed(true);
        setSelectedSidebarSection('visuals');
        setSelectedVisualsTab('notes');
        setOpenedNoteInSidebar(noteId);
    }, []);

    const openCustomTypeFromSidebar = useCallback((customTypeId: string) => {
        setIsSidePanelShowed(true);
        setSelectedSidebarSection('customTypes');
        setOpenedTableInSidebar(customTypeId);
    }, []);

    const openAllDiscussions = useCallback(() => {
        setDiscussionView('all');
        setCommentsTarget(DIAGRAM_DISCUSSION_TARGET);
        setSelectedSidebarSection('comments');
        setIsSidePanelShowed(true);
    }, []);

    const openDiagramDiscussion = useCallback(() => {
        setDiscussionView('diagram');
        setCommentsTarget(DIAGRAM_DISCUSSION_TARGET);
        setSelectedSidebarSection('comments');
        setIsSidePanelShowed(true);
    }, []);

    const openTargetDiscussion = useCallback((target: DiagramCommentTarget) => {
        // Defensive: callers may pass the diagram target; normalize to the
        // dedicated diagram view instead of storing a spurious target view.
        if (target.targetType === 'diagram') {
            setDiscussionView('diagram');
            setCommentsTarget(DIAGRAM_DISCUSSION_TARGET);
        } else {
            setDiscussionView('target');
            setCommentsTarget(target);
        }
        setSelectedSidebarSection('comments');
        setIsSidePanelShowed(true);
    }, []);

    const value = useMemo<LayoutContext>(
        () => ({
            openedTableInSidebar,
            selectedSidebarSection,
            openTableFromSidebar,
            selectSidebarSection: setSelectedSidebarSection,
            openRelationshipFromSidebar,
            closeAllTablesInSidebar,
            closeAllRelationshipsInSidebar,
            isSidePanelShowed,
            hideSidePanel,
            showSidePanel,
            toggleSidePanel,
            openDependencyFromSidebar,
            closeAllDependenciesInSidebar,
            openedRefInSidebar,
            openRefFromSidebar,
            closeAllRefsInSidebar,
            openedAreaInSidebar,
            openAreaFromSidebar,
            closeAllAreasInSidebar,
            openedNoteInSidebar,
            openNoteFromSidebar,
            closeAllNotesInSidebar,
            openedCustomTypeInSidebar,
            openCustomTypeFromSidebar,
            closeAllCustomTypesInSidebar,
            selectedVisualsTab,
            selectVisualsTab: setSelectedVisualsTab,
            commentsTarget,
            discussionView,
            openAllDiscussions,
            openDiagramDiscussion,
            openTargetDiscussion,
        }),
        [
            openedTableInSidebar,
            selectedSidebarSection,
            openTableFromSidebar,
            openRelationshipFromSidebar,
            closeAllTablesInSidebar,
            closeAllRelationshipsInSidebar,
            isSidePanelShowed,
            hideSidePanel,
            showSidePanel,
            toggleSidePanel,
            openDependencyFromSidebar,
            closeAllDependenciesInSidebar,
            openedRefInSidebar,
            openRefFromSidebar,
            closeAllRefsInSidebar,
            openedAreaInSidebar,
            openAreaFromSidebar,
            closeAllAreasInSidebar,
            openedNoteInSidebar,
            openNoteFromSidebar,
            closeAllNotesInSidebar,
            openedCustomTypeInSidebar,
            openCustomTypeFromSidebar,
            closeAllCustomTypesInSidebar,
            selectedVisualsTab,
            commentsTarget,
            discussionView,
            openAllDiscussions,
            openDiagramDiscussion,
            openTargetDiscussion,
        ]
    );

    return (
        <layoutContext.Provider value={value}>
            {children}
        </layoutContext.Provider>
    );
};
