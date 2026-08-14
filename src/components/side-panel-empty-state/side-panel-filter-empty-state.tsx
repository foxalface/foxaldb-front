import React from 'react';
import { X } from 'lucide-react';
import {
    SidePanelEmptyState,
    sidePanelEmptyStateIcon,
    type SidePanelEmptyStateProps,
} from './side-panel-empty-state';

export interface SidePanelFilterEmptyStateProps extends Pick<
    SidePanelEmptyStateProps,
    'title' | 'description' | 'className'
> {
    clearLabel: string;
    onClearFilter: () => void;
}

export const SidePanelFilterEmptyState: React.FC<
    SidePanelFilterEmptyStateProps
> = ({ title, description, clearLabel, onClearFilter, className }) => (
    <SidePanelEmptyState
        title={title}
        description={description}
        className={className}
        icon={sidePanelEmptyStateIcon}
        secondaryAction={{
            label: clearLabel,
            onClick: onClearFilter,
            icon: <X className="size-3.5" aria-hidden="true" />,
        }}
    />
);
