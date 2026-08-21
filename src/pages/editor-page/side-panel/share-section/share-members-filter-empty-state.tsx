import React from 'react';
import { useTranslation } from 'react-i18next';
import { SidePanelFilterEmptyState } from '@/components/side-panel-empty-state/side-panel-filter-empty-state';

export interface ShareMembersFilterEmptyStateProps {
    onClearFilter: () => void;
}

export const ShareMembersFilterEmptyState: React.FC<
    ShareMembersFilterEmptyStateProps
> = ({ onClearFilter }) => {
    const { t } = useTranslation();

    return (
        <SidePanelFilterEmptyState
            title={t('side_panel.share_section.collaborators.no_results_title')}
            description={t(
                'side_panel.share_section.collaborators.no_results_description'
            )}
            clearLabel={t('side_panel.share_section.collaborators.clear')}
            onClearFilter={onClearFilter}
        />
    );
};
