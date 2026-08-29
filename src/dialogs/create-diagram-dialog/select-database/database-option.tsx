import React, { useMemo } from 'react';
import { ToggleGroupItem } from '@/components/toggle/toggle-group';
import type { DatabaseType } from '@/lib/domain/database-type';
import { databaseTypeToLabelMap, getDatabaseLogo } from '@/lib/databases';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

export interface DatabaseOptionProps {
    type: DatabaseType;
    size?: 'default' | 'compact';
    ariaLabel?: string;
}

export const DatabaseOption: React.FC<DatabaseOptionProps> = ({
    type,
    size = 'default',
    ariaLabel,
}) => {
    const { effectiveTheme } = useTheme();
    const logo = useMemo(
        () => getDatabaseLogo(type, effectiveTheme),
        [type, effectiveTheme]
    );

    return (
        <ToggleGroupItem
            value={type}
            aria-label={ariaLabel ?? databaseTypeToLabelMap[type]}
            className={cn(
                'flex shrink-0',
                size === 'compact' ? 'size-[4.5rem]' : 'size-20 md:size-32'
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
