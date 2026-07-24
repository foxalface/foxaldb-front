import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/spinner/spinner';
import { EmptyState } from '@/components/empty-state/empty-state';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDiagramAccess } from '@/hooks/use-diagram-access';
import { useDiagramComments } from '@/hooks/use-diagram-comments';
import { useLayout } from '@/hooks/use-layout';
import { useTargetComments } from '@/hooks/use-target-comments';
import type { DiagramComment } from '@/lib/comments/comment-types';
import {
    buildDiscussionScrollScopeKey,
    shouldScrollToLatestOnOpen,
    type DiscussionScrollIntent,
} from '@/lib/comments/discussion-scroll';
import { resolveDiscussionTarget } from '@/lib/comments/resolve-discussion-target';
import { CommentsComposer } from './comments-composer';
import { CommentsEmptyState } from './comments-empty-state';
import {
    CommentsErrorState,
    CommentsReloadErrorBanner,
} from './comments-error-state';
import { CommentsScrollRegion } from './comments-scroll-region';
import { CommentsTargetHeader } from './comments-target-header';

export interface CommentsSectionProps {}

const COMMENTS_SECTION_HEADING_ID = 'comments-section-heading';

export const CommentsSection: React.FC<CommentsSectionProps> = () => {
    const { t } = useTranslation();
    const {
        comments: allComments,
        status,
        isActive,
        diagramId,
        reload,
    } = useDiagramComments();
    const {
        discussionView,
        commentsTarget,
        openAllDiscussions,
        openDiagramDiscussion,
    } = useLayout();
    const scopedComments = useTargetComments(commentsTarget);
    const { tables, relationships } = useChartDB();
    const { diagramAccess } = useDiagramAccess();
    const [isRetrying, setIsRetrying] = useState(false);
    const [scrollIntent, setScrollIntent] =
        useState<DiscussionScrollIntent | null>(null);
    const scrollIntentGenerationRef = useRef(0);
    const retryInFlightRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const scrollScopeKey = useMemo(
        () =>
            buildDiscussionScrollScopeKey(
                discussionView,
                commentsTarget,
                diagramId
            ),
        [discussionView, commentsTarget, diagramId]
    );
    const scrollToLatestOnOpen = shouldScrollToLatestOnOpen(discussionView);

    // Drop stale navigation intent when the discussion scope changes.
    useEffect(() => {
        setScrollIntent(null);
    }, [scrollScopeKey]);

    const handleCommentCreated = useCallback((comment: DiagramComment) => {
        scrollIntentGenerationRef.current += 1;
        setScrollIntent({
            targetCommentId: comment.id,
            reason: 'local-create',
            generation: scrollIntentGenerationRef.current,
        });
    }, []);

    const handleRetry = useCallback(async () => {
        if (retryInFlightRef.current) {
            return;
        }

        retryInFlightRef.current = true;
        setIsRetrying(true);

        try {
            await reload();
        } catch {
            // Provider status/error remains authoritative; do not surface raw errors.
        } finally {
            retryInFlightRef.current = false;
            if (isMountedRef.current) {
                setIsRetrying(false);
            }
        }
    }, [reload]);

    const visibleComments =
        discussionView === 'all' ? allComments : scopedComments;

    const resolvedTarget = useMemo(
        () =>
            resolveDiscussionTarget(commentsTarget, {
                tables,
                relationships,
            }),
        [commentsTarget, tables, relationships]
    );

    const hasAnyComments = allComments.length > 0;
    const isInitialLoading = status === 'loading' && !hasAnyComments;
    const isReloadLoading = status === 'loading' && hasAnyComments;
    const isLoadError = status === 'error' && !hasAnyComments;
    const isReloadError = status === 'error' && hasAnyComments;
    const canEdit = diagramAccess?.can_edit === true;
    const canComposeInCurrentView =
        canEdit &&
        discussionView !== 'all' &&
        !(discussionView === 'target' && resolvedTarget.kind === 'missing');
    const showComposer =
        isActive &&
        canComposeInCurrentView &&
        !isInitialLoading &&
        !isLoadError &&
        diagramId !== null;

    const reloadErrorBanner = isReloadError ? (
        <CommentsReloadErrorBanner
            onRetry={() => {
                void handleRetry();
            }}
            isRetrying={isRetrying}
        />
    ) : null;

    let emptyContent: React.ReactNode = null;
    if (discussionView === 'diagram') {
        emptyContent = (
            <EmptyState
                title={t('side_panel.comments_section.empty.diagram_title')}
                description={t(
                    'side_panel.comments_section.empty.diagram_description'
                )}
                className="mt-12 px-2"
            />
        );
    } else if (discussionView === 'target') {
        emptyContent = (
            <EmptyState
                title={t('side_panel.comments_section.empty.target_title')}
                description={t(
                    'side_panel.comments_section.empty.target_description'
                )}
                className="mt-12 px-2"
            />
        );
    } else {
        emptyContent = <CommentsEmptyState />;
    }

    let content: React.ReactNode;

    if (!isActive) {
        content = (
            <EmptyState
                title={t('side_panel.comments_section.inactive.title')}
                description={t(
                    'side_panel.comments_section.inactive.description'
                )}
                className="mt-12 px-2"
            />
        );
    } else if (isInitialLoading) {
        content = (
            <div
                className="flex flex-1 flex-col items-center justify-center gap-2"
                aria-busy="true"
                role="status"
            >
                <Spinner size="small" />
                <span className="text-sm text-muted-foreground">
                    {t('side_panel.comments_section.loading')}
                </span>
            </div>
        );
    } else if (isLoadError) {
        content = (
            <CommentsErrorState
                onRetry={() => {
                    void handleRetry();
                }}
                isRetrying={isRetrying}
            />
        );
    } else {
        content = (
            <CommentsScrollRegion
                comments={visibleComments}
                emptyContent={emptyContent}
                labelledBy={COMMENTS_SECTION_HEADING_ID}
                scopeKey={scrollScopeKey}
                scrollToLatestOnOpen={scrollToLatestOnOpen}
                scrollIntent={scrollIntent}
                reloadErrorBanner={reloadErrorBanner}
            />
        );
    }

    return (
        <section
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-2"
            aria-labelledby={COMMENTS_SECTION_HEADING_ID}
            data-vaul-no-drag
        >
            <header className="flex shrink-0 flex-col gap-1 py-2">
                <div className="flex items-center justify-between gap-2">
                    <h2
                        id={COMMENTS_SECTION_HEADING_ID}
                        className="text-sm font-semibold text-foreground"
                    >
                        {t('side_panel.comments_section.title')}
                    </h2>
                    {isReloadLoading ? (
                        <span
                            role="status"
                            aria-label={t(
                                'side_panel.comments_section.loading'
                            )}
                        >
                            <Spinner size="small" className="size-4" />
                        </span>
                    ) : null}
                </div>
                {isActive ? (
                    <CommentsTargetHeader
                        view={discussionView}
                        resolvedTarget={resolvedTarget}
                        onShowAll={openAllDiscussions}
                        onShowDiagram={openDiagramDiscussion}
                    />
                ) : null}
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {content}
            </div>
            {showComposer && diagramId !== null ? (
                <CommentsComposer
                    diagramId={diagramId}
                    target={commentsTarget}
                    onCommentCreated={handleCommentCreated}
                />
            ) : null}
        </section>
    );
};
