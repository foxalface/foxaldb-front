import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type {
    ConversationNavigationIntent,
    LayoutContext,
    SidebarSection,
    VisualsTab,
} from './layout-context';
import { layoutContext } from './layout-context';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useChartDB } from '@/hooks/use-chartdb';

const resetConversationNavigation = (
    setConversationNavigationIntent: React.Dispatch<
        React.SetStateAction<ConversationNavigationIntent | null>
    >
): void => {
    setConversationNavigationIntent(null);
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
    const [conversationNavigationIntent, setConversationNavigationIntent] =
        React.useState<ConversationNavigationIntent | null>(null);

    useEffect(() => {
        if (previousDiagramIdRef.current === diagramId) {
            return;
        }
        previousDiagramIdRef.current = diagramId;
        resetConversationNavigation(setConversationNavigationIntent);
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

    const toggleSidebarSection = useCallback(
        (section: SidebarSection) => {
            if (selectedSidebarSection === section && isSidePanelShowed) {
                hideSidePanel();
                return;
            }

            setSelectedSidebarSection(section);
            showSidePanel();
        },
        [
            selectedSidebarSection,
            isSidePanelShowed,
            hideSidePanel,
            showSidePanel,
        ]
    );

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

    const openConversationsPanel = useCallback(() => {
        setSelectedSidebarSection('conversations');
        setIsSidePanelShowed(true);
    }, []);

    const openConversationDetail = useCallback((conversationId: number) => {
        setConversationNavigationIntent({ conversationId });
        setSelectedSidebarSection('conversations');
        setIsSidePanelShowed(true);
    }, []);

    const clearConversationNavigationIntent = useCallback(() => {
        setConversationNavigationIntent(null);
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
            toggleSidebarSection,
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
            openConversationsPanel,
            conversationNavigationIntent,
            openConversationDetail,
            clearConversationNavigationIntent,
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
            toggleSidebarSection,
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
            openConversationsPanel,
            conversationNavigationIntent,
            openConversationDetail,
            clearConversationNavigationIntent,
        ]
    );

    return (
        <layoutContext.Provider value={value}>
            {children}
        </layoutContext.Provider>
    );
};
