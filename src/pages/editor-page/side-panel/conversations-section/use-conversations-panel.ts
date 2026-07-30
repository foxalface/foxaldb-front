import { useCallback, useEffect, useRef, useState } from 'react';
import { useDiagramConversations } from '@/hooks/use-diagram-conversations';
import { useConversationMutations } from '@/hooks/use-conversation-mutations';

export type ConversationsPanelTab = 'active' | 'archives';

export interface UseConversationsPanelResult {
    selectedTab: ConversationsPanelTab;
    setSelectedTab: (tab: ConversationsPanelTab) => void;
    activeConversations: ReturnType<
        typeof useDiagramConversations
    >['activeConversations'];
    archivedConversations: ReturnType<
        typeof useDiagramConversations
    >['archivedConversations'];
    status: ReturnType<typeof useDiagramConversations>['status'];
    error: ReturnType<typeof useDiagramConversations>['error'];
    isActive: boolean;
    diagramId: string | null;
    activeSummariesNextCursor: string | null;
    archivedSummariesNextCursor: string | null;
    reload: () => Promise<void>;
    isInitialLoading: boolean;
    isArchivesInitialLoading: boolean;
    isLoadingMoreActive: boolean;
    isLoadingMoreArchived: boolean;
    isRetrying: boolean;
    mutationError: string | null;
    clearMutationError: () => void;
    isMutationPending: (conversationId: number) => boolean;
    handleArchive: (conversationId: number) => Promise<void>;
    handleReopen: (conversationId: number) => Promise<void>;
    handleLoadMoreActive: () => Promise<void>;
    handleLoadMoreArchived: () => Promise<void>;
    handleRetry: () => Promise<void>;
}

export const useConversationsPanel = (): UseConversationsPanelResult => {
    const {
        activeConversations,
        archivedConversations,
        status,
        error,
        isActive,
        diagramId,
        activeSummariesNextCursor,
        archivedSummariesNextCursor,
        reload,
        loadArchivedSummaries,
        loadMoreActiveSummaries,
        loadMoreArchivedSummaries,
    } = useDiagramConversations();
    const { archiveConversation, reopenConversation } =
        useConversationMutations();

    const [selectedTab, setSelectedTab] =
        useState<ConversationsPanelTab>('active');
    const [pendingMutations, setPendingMutations] = useState<Set<number>>(
        () => new Set()
    );
    const [mutationError, setMutationError] = useState<string | null>(null);
    const [isArchivesInitialLoading, setIsArchivesInitialLoading] =
        useState(false);
    const [isLoadingMoreActive, setIsLoadingMoreActive] = useState(false);
    const [isLoadingMoreArchived, setIsLoadingMoreArchived] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const archivesLoadStartedRef = useRef(false);
    const retryInFlightRef = useRef(false);

    useEffect(() => {
        if (selectedTab !== 'archives' || archivesLoadStartedRef.current) {
            return;
        }

        archivesLoadStartedRef.current = true;
        setIsArchivesInitialLoading(true);

        void loadArchivedSummaries()
            .catch(() => {
                // Provider stores the authoritative error state.
            })
            .finally(() => {
                setIsArchivesInitialLoading(false);
            });
    }, [selectedTab, loadArchivedSummaries]);

    const isInitialLoading =
        status === 'loading' && activeConversations.length === 0;

    const clearMutationError = useCallback(() => {
        setMutationError(null);
    }, []);

    const isMutationPending = useCallback(
        (conversationId: number) => pendingMutations.has(conversationId),
        [pendingMutations]
    );

    const runMutation = useCallback(
        async (
            conversationId: number,
            action: () => Promise<unknown>
        ): Promise<void> => {
            if (pendingMutations.has(conversationId)) {
                return;
            }

            setMutationError(null);
            setPendingMutations((current) => {
                const next = new Set(current);
                next.add(conversationId);
                return next;
            });

            try {
                await action();
            } catch {
                setMutationError('mutation_failed');
            } finally {
                setPendingMutations((current) => {
                    const next = new Set(current);
                    next.delete(conversationId);
                    return next;
                });
            }
        },
        [pendingMutations]
    );

    const handleArchive = useCallback(
        async (conversationId: number): Promise<void> => {
            await runMutation(conversationId, () =>
                archiveConversation(conversationId)
            );
        },
        [archiveConversation, runMutation]
    );

    const handleReopen = useCallback(
        async (conversationId: number): Promise<void> => {
            await runMutation(conversationId, () =>
                reopenConversation(conversationId)
            );
        },
        [reopenConversation, runMutation]
    );

    const handleLoadMoreActive = useCallback(async (): Promise<void> => {
        if (isLoadingMoreActive || activeSummariesNextCursor === null) {
            return;
        }

        setIsLoadingMoreActive(true);
        try {
            await loadMoreActiveSummaries();
        } finally {
            setIsLoadingMoreActive(false);
        }
    }, [
        activeSummariesNextCursor,
        isLoadingMoreActive,
        loadMoreActiveSummaries,
    ]);

    const handleLoadMoreArchived = useCallback(async (): Promise<void> => {
        if (isLoadingMoreArchived || archivedSummariesNextCursor === null) {
            return;
        }

        setIsLoadingMoreArchived(true);
        try {
            await loadMoreArchivedSummaries();
        } finally {
            setIsLoadingMoreArchived(false);
        }
    }, [
        archivedSummariesNextCursor,
        isLoadingMoreArchived,
        loadMoreArchivedSummaries,
    ]);

    const handleRetry = useCallback(async (): Promise<void> => {
        if (retryInFlightRef.current) {
            return;
        }

        retryInFlightRef.current = true;
        setIsRetrying(true);

        try {
            if (selectedTab === 'archives') {
                await loadArchivedSummaries();
            } else {
                await reload();
            }
        } catch {
            // Provider status/error remains authoritative.
        } finally {
            retryInFlightRef.current = false;
            setIsRetrying(false);
        }
    }, [loadArchivedSummaries, reload, selectedTab]);

    return {
        selectedTab,
        setSelectedTab,
        activeConversations,
        archivedConversations,
        status,
        error,
        isActive,
        diagramId,
        activeSummariesNextCursor,
        archivedSummariesNextCursor,
        reload,
        isInitialLoading,
        isArchivesInitialLoading,
        isLoadingMoreActive,
        isLoadingMoreArchived,
        isRetrying,
        mutationError,
        clearMutationError,
        isMutationPending,
        handleArchive,
        handleReopen,
        handleLoadMoreActive,
        handleLoadMoreArchived,
        handleRetry,
    };
};
