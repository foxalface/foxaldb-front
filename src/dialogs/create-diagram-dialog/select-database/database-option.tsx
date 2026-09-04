import React, { useMemo } from 'react';
import { ToggleGroupItem } from '@/components/toggle/toggle-group';
import type { DatabaseType } from '@/lib/domain/database-type';
import { databaseTypeToLabelMap, getDatabaseLogo } from '@/lib/databases';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { TOGGLE_OUTLINE_SELECTION_CLASS } from '@/components/toggle/toggle-variants';

export interface DatabaseOptionProps {
    type: DatabaseType;
    size?: 'default' | 'compact';
    ariaLabel?: string;
    className?: string;
}

export const DatabaseOption: React.FC<DatabaseOptionProps> = ({
    type,
    size = 'default',
    ariaLabel,
    className,
}) => {
    const { effectiveTheme } = useTheme();
    const logo = useMemo(
        () => getDatabaseLogo(type, effectiveTheme),
        [type, effectiveTheme]
    );

    return (
        <ToggleGroupItem
            value={type}
            variant="outline"
            aria-label={ariaLabel ?? databaseTypeToLabelMap[type]}
            className={cn(
                'flex shrink-0',
                TOGGLE_OUTLINE_SELECTION_CLASS,
                size === 'compact' ? 'size-[4.5rem]' : 'size-20 md:size-32',
                className
            )}
        >
            <img
                src={logo}
                alt={databaseTypeToLabelMap[type]}
                className="max-h-full max-w-full object-contain"
            />
        </ToggleGroupItem>
    );
};
