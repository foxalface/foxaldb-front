import React from 'react';
import {
    SidePanelEmptyState,
    sidePanelEmptyStateIcon,
    type SidePanelEmptyStateProps,
} from './side-panel-empty-state';
import {
    sidePanelFilterClearButtonClassName,
    sidePanelFilterClearButtonIcon,
} from './side-panel-filter-clear-action';

export interface SidePanelFilterEmptyStateProps extends Pick<
    SidePanelEmptyStateProps,
    'title' | 'description' | 'className' | 'titleClassName' | 'icon'
> {
    clearLabel: string;
    onClearFilter: () => void;
}

export const SidePanelFilterEmptyState: React.FC<
    SidePanelFilterEmptyStateProps
> = ({
    title,
    description,
    clearLabel,
    onClearFilter,
    className,
    titleClassName,
    icon = sidePanelEmptyStateIcon,
}) => (
    <SidePanelEmptyState
        title={title}
        description={description}
        className={className}
        titleClassName={titleClassName}
        icon={icon}
        secondaryAction={{
            label: clearLabel,
            onClick: onClearFilter,
            icon: sidePanelFilterClearButtonIcon,
            variant: 'outline',
            className: sidePanelFilterClearButtonClassName,
        }}
    />
);
