import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
} from '@/components/side-panel-empty-state/side-panel-empty-state';

export interface ConversationsFilterEmptyStateProps {
    onClearFilter: () => void;
}

export const ConversationsFilterEmptyState: React.FC<
    ConversationsFilterEmptyStateProps
> = ({ onClearFilter }) => {
    const { t } = useTranslation();

    return (
        <SidePanelEmptyStateViewport>
            <SidePanelEmptyState
                title={t('side_panel.conversations_section.no_results_title')}
                description={t(
                    'side_panel.conversations_section.no_results_description'
                )}
                secondaryAction={{
                    label: t('side_panel.conversations_section.clear'),
                    onClick: onClearFilter,
                    icon: <X className="size-3.5" />,
                }}
            />
        </SidePanelEmptyStateViewport>
    );
};
