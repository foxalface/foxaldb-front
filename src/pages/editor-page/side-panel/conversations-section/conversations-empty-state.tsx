import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
} from '@/components/side-panel-empty-state/side-panel-empty-state';

export interface ConversationsEmptyStateProps {
    isArchived: boolean;
}

export const ConversationsEmptyState: React.FC<
    ConversationsEmptyStateProps
> = ({ isArchived }) => {
    const { t } = useTranslation();

    return (
        <SidePanelEmptyStateViewport>
            <SidePanelEmptyState
                title={t(
                    isArchived
                        ? 'side_panel.conversations_section.empty.archives_title'
                        : 'side_panel.conversations_section.empty.active_title'
                )}
                description={t(
                    isArchived
                        ? 'side_panel.conversations_section.empty.archives_description'
                        : 'side_panel.conversations_section.empty.active_description'
                )}
            />
        </SidePanelEmptyStateViewport>
    );
};
