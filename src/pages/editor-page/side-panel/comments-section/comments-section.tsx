import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/spinner/spinner';
import { EmptyState } from '@/components/empty-state/empty-state';
import { useDiagramComments } from '@/hooks/use-diagram-comments';
import { CommentsEmptyState } from './comments-empty-state';
import {
    CommentsErrorState,
    CommentsReloadErrorBanner,
} from './comments-error-state';
import { CommentsList } from './comments-list';

export interface CommentsSectionProps {}

const COMMENTS_SECTION_HEADING_ID = 'comments-section-heading';

export const CommentsSection: React.FC<CommentsSectionProps> = () => {
    const { t } = useTranslation();
    const { comments, status, isActive, reload } = useDiagramComments();
    const [isRetrying, setIsRetrying] = useState(false);
    const retryInFlightRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
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

    const hasComments = comments.length > 0;
    const isInitialLoading = status === 'loading' && !hasComments;
    const isReloadLoading = status === 'loading' && hasComments;
    const isLoadError = status === 'error' && !hasComments;
    const isReloadError = status === 'error' && hasComments;

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
    } else if (!hasComments) {
        content = <CommentsEmptyState />;
    } else {
        content = (
            <div className="flex min-h-0 flex-1 flex-col">
                {isReloadError ? (
                    <CommentsReloadErrorBanner
                        onRetry={() => {
                            void handleRetry();
                        }}
                        isRetrying={isRetrying}
                    />
                ) : null}
                <div className="min-h-0 flex-1">
                    <CommentsList
                        comments={comments}
                        labelledBy={COMMENTS_SECTION_HEADING_ID}
                    />
                </div>
            </div>
        );
    }

    return (
        <section
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-2"
            aria-labelledby={COMMENTS_SECTION_HEADING_ID}
            data-vaul-no-drag
        >
            <header className="flex shrink-0 items-center justify-between gap-2 py-2">
                <h2
                    id={COMMENTS_SECTION_HEADING_ID}
                    className="text-sm font-semibold text-foreground"
                >
                    {t('side_panel.comments_section.title')}
                </h2>
                {isReloadLoading ? (
                    <span
                        role="status"
                        aria-label={t('side_panel.comments_section.loading')}
                    >
                        <Spinner size="small" className="size-4" />
                    </span>
                ) : null}
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {content}
            </div>
        </section>
    );
};
