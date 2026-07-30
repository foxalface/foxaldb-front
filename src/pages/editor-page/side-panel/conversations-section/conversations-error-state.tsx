import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/empty-state/empty-state';

export interface ConversationsErrorStateProps {
    onRetry: () => void;
    isRetrying: boolean;
    titleKey?: string;
    descriptionKey?: string;
}

export const ConversationsErrorState: React.FC<
    ConversationsErrorStateProps
> = ({
    onRetry,
    isRetrying,
    titleKey = 'side_panel.conversations_section.errors.load_title',
    descriptionKey = 'side_panel.conversations_section.errors.load_description',
}) => {
    const { t } = useTranslation();

    return (
        <div role="alert" className="flex flex-1 flex-col">
            <EmptyState
                title={t(titleKey)}
                description={t(descriptionKey)}
                className="mt-12 px-2"
                primaryAction={{
                    label: t('side_panel.conversations_section.retry'),
                    onClick: onRetry,
                    disabled: isRetrying,
                }}
            />
        </div>
    );
};
