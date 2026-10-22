import React from 'react';
import { FiSlash } from 'react-icons/fi';
import {
    SidePanelEmptyState,
    type SidePanelEmptyStateProps,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import { SidePanelFilterEmptyState } from '@/components/side-panel-empty-state/side-panel-filter-empty-state';
import {
    OPEN_DIAGRAM_EMPTY_STATE_TITLE_CLASS,
    OPEN_DIAGRAM_EMPTY_STATE_WRAPPER_CLASS,
} from './open-diagram-dialog-layout';

const openDiagramEmptyStateIcon = (
    <FiSlash className="size-8" strokeWidth={1.25} aria-hidden="true" />
);

const sharedEmptyProps: Pick<
    SidePanelEmptyStateProps,
    'icon' | 'titleClassName' | 'className'
> = {
    icon: openDiagramEmptyStateIcon,
    titleClassName: OPEN_DIAGRAM_EMPTY_STATE_TITLE_CLASS,
    className: 'mt-0 py-0',
};

export interface OpenDiagramTableEmptyStateProps {
    title: string;
    filterActive: boolean;
    clearFilterLabel?: string;
    onClearFilter?: () => void;
}

export const OpenDiagramTableEmptyState: React.FC<
    OpenDiagramTableEmptyStateProps
> = ({ title, filterActive, clearFilterLabel, onClearFilter }) => (
    <div className={OPEN_DIAGRAM_EMPTY_STATE_WRAPPER_CLASS}>
        {filterActive && onClearFilter && clearFilterLabel ? (
            <SidePanelFilterEmptyState
                title={title}
                clearLabel={clearFilterLabel}
                onClearFilter={onClearFilter}
                {...sharedEmptyProps}
            />
        ) : (
            <SidePanelEmptyState title={title} {...sharedEmptyProps} />
        )}
    </div>
);
