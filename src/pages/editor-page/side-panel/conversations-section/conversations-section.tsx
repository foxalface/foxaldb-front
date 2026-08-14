import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { Archive } from 'lucide-react';
import { SlBubbles } from 'react-icons/sl';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/empty-state/empty-state';
import { Input } from '@/components/input/input';
import { Tabs, TabsContent } from '@/components/tabs/tabs';
import {
    SidePanelSectionTabsList,
    SidePanelSectionTabsToolbar,
    SidePanelSectionTabsTrigger,
} from '@/components/side-panel-section-tabs/side-panel-section-tabs';
import { ConversationsList } from './conversations-list';
import { ConversationDetail } from './conversation-detail';
import { useConversationsPanel } from './use-conversations-panel';
import { useChartDB } from '@/hooks/use-chartdb';
import type { ConversationTargetType } from '@/lib/conversations/conversation-types';
import { ConversationTargetTypeFilter } from './conversation-target-type-filter';
import {
    DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES,
    filterConversations,
    hasActiveConversationFilter,
} from './filter-conversations';

export interface ConversationsSectionProps {}

export const ConversationsSection: React.FC<ConversationsSectionProps> = () => {
    const { t } = useTranslation();
    const { tables, relationships, diagramName } = useChartDB();
    const activeTabLabelId = useId();
    const archivesTabLabelId = useId();
    const [filterText, setFilterText] = useState('');
    const [selectedTargetTypes, setSelectedTargetTypes] = useState<
        ConversationTargetType[]
    >(DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES);
    const filterInputRef = useRef<HTMLInputElement>(null);
    const {
        selectedTab,
        setSelectedTab,
        selectedConversation,
        selectConversation,
        handleBackFromDetail,
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
        handleDelete,
        handleLoadMoreActive,
        handleLoadMoreArchived,
        handleRetry,
        detailRegionRef,
    } = useConversationsPanel();

    const filterContext = useMemo(
        () => ({
            diagramName,
            tables,
            relationships,
            t,
        }),
        [diagramName, tables, relationships, t]
    );

    const listFilterOptions = useMemo(
        () => ({
            filterText,
            selectedTargetTypes,
        }),
        [filterText, selectedTargetTypes]
    );

    const hasActiveFilter = hasActiveConversationFilter(listFilterOptions);

    const filteredActiveConversations = useMemo(
        () =>
            filterConversations(
                activeConversations,
                listFilterOptions,
                filterContext
            ),
        [activeConversations, filterContext, listFilterOptions]
    );

    const filteredArchivedConversations = useMemo(
        () =>
            filterConversations(
                archivedConversations,
                listFilterOptions,
                filterContext
            ),
        [archivedConversations, filterContext, listFilterOptions]
    );

    const handleClearFilter = useCallback(() => {
        setFilterText('');
        setSelectedTargetTypes(DEFAULT_SELECTED_CONVERSATION_TARGET_TYPES);
    }, []);

    const hasActiveLoadError =
        status === 'error' && activeConversations.length === 0;
    const hasArchivedLoadError =
        status === 'error' &&
        archivedConversations.length === 0 &&
        !isArchivesInitialLoading;

    if (!isActive) {
        return (
            <section
                className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
                aria-label={t('side_panel.conversations_section.title')}
                data-vaul-no-drag
            >
                <div className="px-2">
                    <EmptyState
                        title={t(
                            'side_panel.conversations_section.inactive.title'
                        )}
                        description={t(
                            'side_panel.conversations_section.inactive.description'
                        )}
                        className="mt-12"
                    />
                </div>
            </section>
        );
    }

    return (
        <section
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
            aria-label={t('side_panel.conversations_section.title')}
            data-vaul-no-drag
        >
            {mutationError ? (
                <div
                    role="alert"
                    className="mx-2 mb-2 flex shrink-0 items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
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
                    onBack={handleBackFromDetail}
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
                    <SidePanelSectionTabsToolbar>
                        <SidePanelSectionTabsList
                            aria-label={t(
                                'side_panel.conversations_section.tabs_label'
                            )}
                        >
                            <SidePanelSectionTabsTrigger value="active">
                                <SlBubbles
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                {t(
                                    'side_panel.conversations_section.tabs.active'
                                )}
                            </SidePanelSectionTabsTrigger>
                            <SidePanelSectionTabsTrigger value="archives">
                                <Archive
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                {t(
                                    'side_panel.conversations_section.tabs.archives'
                                )}
                            </SidePanelSectionTabsTrigger>
                        </SidePanelSectionTabsList>
                    </SidePanelSectionTabsToolbar>

                    <div className="flex items-center gap-2 px-2 pb-1">
                        <div className="flex-1">
                            <Input
                                ref={filterInputRef}
                                type="text"
                                placeholder={t(
                                    'side_panel.conversations_section.filter'
                                )}
                                className="h-8 w-full focus-visible:ring-0"
                                value={filterText}
                                onChange={(event) =>
                                    setFilterText(event.target.value)
                                }
                            />
                        </div>
                        <ConversationTargetTypeFilter
                            selectedTargetTypes={selectedTargetTypes}
                            onSelectedTargetTypesChange={setSelectedTargetTypes}
                        />
                    </div>

                    <TabsContent
                        value="active"
                        className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden px-2 data-[state=inactive]:hidden"
                    >
                        <h3 id={activeTabLabelId} className="sr-only">
                            {t('side_panel.conversations_section.tabs.active')}
                        </h3>
                        <ConversationsList
                            conversations={filteredActiveConversations}
                            totalConversationCount={activeConversations.length}
                            hasActiveFilter={hasActiveFilter}
                            onClearFilter={handleClearFilter}
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
                            onDelete={(conversationId) =>
                                handleDelete(conversationId)
                            }
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
                        className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden px-2 data-[state=inactive]:hidden"
                    >
                        <h3 id={archivesTabLabelId} className="sr-only">
                            {t(
                                'side_panel.conversations_section.tabs.archives'
                            )}
                        </h3>
                        <ConversationsList
                            conversations={filteredArchivedConversations}
                            totalConversationCount={
                                archivedConversations.length
                            }
                            hasActiveFilter={hasActiveFilter}
                            onClearFilter={handleClearFilter}
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
                            onDelete={(conversationId) =>
                                handleDelete(conversationId)
                            }
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
