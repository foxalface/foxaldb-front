import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/button/button';
import { EmptyState } from '@/components/empty-state/empty-state';

export interface CommentsErrorStateProps {
    onRetry: () => void;
    isRetrying: boolean;
}

export const CommentsErrorState: React.FC<CommentsErrorStateProps> = ({
    onRetry,
    isRetrying,
}) => {
    const { t } = useTranslation();

    return (
        <div role="alert" className="flex flex-1 flex-col">
            <EmptyState
                title={t('side_panel.comments_section.errors.load_title')}
                description={t(
                    'side_panel.comments_section.errors.load_description'
                )}
                className="mt-12 px-2"
                primaryAction={{
                    label: t('side_panel.comments_section.retry'),
                    onClick: onRetry,
                    disabled: isRetrying,
                }}
            />
        </div>
    );
};

export interface CommentsReloadErrorBannerProps {
    onRetry: () => void;
    isRetrying: boolean;
}

export const CommentsReloadErrorBanner: React.FC<
    CommentsReloadErrorBannerProps
> = ({ onRetry, isRetrying }) => {
    const { t } = useTranslation();

    return (
        <div
            role="alert"
            className="mb-2 flex shrink-0 items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
        >
            <p className="flex-1 text-xs text-muted-foreground">
                {t('side_panel.comments_section.errors.load_description')}
            </p>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 shrink-0 px-2 text-xs"
                onClick={onRetry}
                disabled={isRetrying}
            >
                {t('side_panel.comments_section.retry')}
            </Button>
        </div>
    );
};
