import React from 'react';
import { useTranslation } from 'react-i18next';
import { SidePanelFilterEmptyState } from '@/components/side-panel-empty-state/side-panel-filter-empty-state';
import { SidePanelEmptyStateViewport } from '@/components/side-panel-empty-state/side-panel-empty-state';

export interface ConversationsFilterEmptyStateProps {
    onClearFilter: () => void;
}

export const ConversationsFilterEmptyState: React.FC<
    ConversationsFilterEmptyStateProps
> = ({ onClearFilter }) => {
    const { t } = useTranslation();

    return (
        <SidePanelEmptyStateViewport>
            <SidePanelFilterEmptyState
                title={t('side_panel.conversations_section.no_results_title')}
                description={t(
                    'side_panel.conversations_section.no_results_description'
                )}
                clearLabel={t('side_panel.conversations_section.clear')}
                onClearFilter={onClearFilter}
            />
        </SidePanelEmptyStateViewport>
    );
};
