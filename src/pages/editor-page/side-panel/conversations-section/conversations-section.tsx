import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/spinner/spinner';
import { EmptyState } from '@/components/empty-state/empty-state';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/tabs/tabs';
import { ConversationsList } from './conversations-list';
import { ConversationDetail } from './conversation-detail';
import { ConversationDiagramHeaderAction } from './conversation-diagram-header-action';
import { useConversationsPanel } from './use-conversations-panel';

export interface ConversationsSectionProps {}

const CONVERSATIONS_SECTION_HEADING_ID = 'conversations-section-heading';

export const ConversationsSection: React.FC<ConversationsSectionProps> = () => {
    const { t } = useTranslation();
    const activeTabLabelId = useId();
    const archivesTabLabelId = useId();
    const {
        selectedTab,
        setSelectedTab,
        selectedConversation,
        selectConversation,
        clearSelectedConversation,
        activeConversations,
        archivedConversations,
        status,
        isActive,
        activeSummariesNextCursor,
        archivedSummariesNextCursor,
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
        detailRegionRef,
    } = useConversationsPanel();

    const hasActiveLoadError =
        status === 'error' && activeConversations.length === 0;
    const hasArchivedLoadError =
        status === 'error' &&
        archivedConversations.length === 0 &&
        !isArchivesInitialLoading;

    if (!isActive) {
        return (
            <section
                className="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-2"
                aria-labelledby={CONVERSATIONS_SECTION_HEADING_ID}
                data-vaul-no-drag
            >
                <header className="flex shrink-0 flex-col gap-1 py-2">
                    <h2
                        id={CONVERSATIONS_SECTION_HEADING_ID}
                        className="text-sm font-semibold text-foreground"
                    >
                        {t('side_panel.conversations_section.title')}
                    </h2>
                </header>
                <EmptyState
                    title={t('side_panel.conversations_section.inactive.title')}
                    description={t(
                        'side_panel.conversations_section.inactive.description'
                    )}
                    className="mt-12 px-2"
                />
            </section>
        );
    }

    return (
        <section
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-2"
            aria-labelledby={CONVERSATIONS_SECTION_HEADING_ID}
            data-vaul-no-drag
        >
            <header className="flex shrink-0 flex-col gap-1 py-2">
                <div className="flex items-center justify-between gap-2">
                    <h2
                        id={CONVERSATIONS_SECTION_HEADING_ID}
                        className="text-sm font-semibold text-foreground"
                    >
                        {t('side_panel.conversations_section.title')}
                    </h2>
                    <div className="flex items-center gap-2">
                        <ConversationDiagramHeaderAction />
                        {status === 'loading' && !isInitialLoading ? (
                            <span
                                role="status"
                                aria-label={t(
                                    'side_panel.conversations_section.loading'
                                )}
                            >
                                <Spinner size="small" className="size-4" />
                            </span>
                        ) : null}
                    </div>
                </div>
            </header>

            {mutationError ? (
                <div
                    role="alert"
                    className="mb-2 flex shrink-0 items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
                >
                    <p className="flex-1 text-xs text-muted-foreground">
                        {t(
                            'side_panel.conversations_section.mutation_errors.generic'
                        )}
                    </p>
                    <button
                        type="button"
                        className="shrink-0 text-xs font-medium text-foreground underline"
                        onClick={clearMutationError}
                    >
                        {t('side_panel.conversations_section.dismiss')}
                    </button>
                </div>
            ) : null}

            {selectedConversation !== null ? (
                <ConversationDetail
                    conversation={selectedConversation}
                    onBack={clearSelectedConversation}
                    regionRef={detailRegionRef}
                />
            ) : (
                <Tabs
                    value={selectedTab}
                    onValueChange={(value) => {
                        setSelectedTab(value as 'active' | 'archives');
                    }}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                >
                    <TabsList
                        className="grid w-full shrink-0 grid-cols-2"
                        aria-label={t(
                            'side_panel.conversations_section.tabs_label'
                        )}
                    >
                        <TabsTrigger value="active">
                            {t('side_panel.conversations_section.tabs.active')}
                        </TabsTrigger>
                        <TabsTrigger value="archives">
                            {t(
                                'side_panel.conversations_section.tabs.archives'
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="active"
                        className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                    >
                        <h3 id={activeTabLabelId} className="sr-only">
                            {t('side_panel.conversations_section.tabs.active')}
                        </h3>
                        <ConversationsList
                            conversations={activeConversations}
                            isArchived={false}
                            isInitialLoading={isInitialLoading}
                            isLoadError={hasActiveLoadError}
                            isRetrying={isRetrying}
                            isLoadingMore={isLoadingMoreActive}
                            hasMore={activeSummariesNextCursor !== null}
                            isMutationPending={isMutationPending}
                            onSelect={selectConversation}
                            onArchive={(conversationId) => {
                                void handleArchive(conversationId);
                            }}
                            onLoadMore={() => {
                                void handleLoadMoreActive();
                            }}
                            onRetry={() => {
                                void handleRetry();
                            }}
                            listLabelId={activeTabLabelId}
                        />
                    </TabsContent>

                    <TabsContent
                        value="archives"
                        className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden"
                    >
                        <h3 id={archivesTabLabelId} className="sr-only">
                            {t(
                                'side_panel.conversations_section.tabs.archives'
                            )}
                        </h3>
                        <ConversationsList
                            conversations={archivedConversations}
                            isArchived
                            isInitialLoading={isArchivesInitialLoading}
                            isLoadError={hasArchivedLoadError}
                            isRetrying={isRetrying}
                            isLoadingMore={isLoadingMoreArchived}
                            hasMore={archivedSummariesNextCursor !== null}
                            isMutationPending={isMutationPending}
                            onSelect={selectConversation}
                            onReopen={(conversationId) => {
                                void handleReopen(conversationId);
                            }}
                            onLoadMore={() => {
                                void handleLoadMoreArchived();
                            }}
                            onRetry={() => {
                                void handleRetry();
                            }}
                            listLabelId={archivesTabLabelId}
                        />
                    </TabsContent>
                </Tabs>
            )}
        </section>
    );
};
