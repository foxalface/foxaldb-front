import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/empty-state/empty-state';

export const CommentsEmptyState: React.FC = () => {
    const { t } = useTranslation();

    return (
        <EmptyState
            title={t('side_panel.comments_section.empty.title')}
            description={t('side_panel.comments_section.empty.description')}
            className="mt-12 px-2"
        />
    );
};
