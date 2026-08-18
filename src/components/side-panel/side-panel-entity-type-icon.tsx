import React from 'react';
import { getSidePanelEntityTypeIcon } from '@/components/side-panel/side-panel-entity-type-icons';
import type { SidePanelEntityType } from '@/components/side-panel/side-panel-entity-type-icons';
import { cn } from '@/lib/utils';

export interface SidePanelEntityTypeIconProps {
    entityType: SidePanelEntityType;
    className?: string;
}

export const SidePanelEntityTypeIcon: React.FC<
    SidePanelEntityTypeIconProps
> = ({ entityType, className }) => {
    const Icon = getSidePanelEntityTypeIcon(entityType);

    return (
        <Icon
            data-testid={`side-panel-entity-type-icon-${entityType}`}
            className={cn('size-3.5 shrink-0', className)}
            aria-hidden="true"
        />
    );
};
