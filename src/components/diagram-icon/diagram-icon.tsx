import React from 'react';
import type { TooltipContentProps } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip/tooltip';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import {
    databaseEditionToImageMap,
    databaseEditionToLabelMap,
} from '@/lib/domain/database-edition';
import {
    databaseSecondaryLogoMap,
    databaseTypeToLabelMap,
} from '@/lib/databases';
import type { DatabaseType } from '@/lib/domain/database-type';
import { cn } from '@/lib/utils';

export interface DiagramIconProps extends React.ComponentPropsWithoutRef<'div'> {
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    imgClassName?: string;
    tooltipSide?: TooltipContentProps['side'];
}

export const DiagramIcon = React.forwardRef<
    React.ElementRef<typeof TooltipTrigger>,
    DiagramIconProps
>(
    (
        {
            databaseType,
            databaseEdition,
            className,
            imgClassName,
            onClick,
            tooltipSide = 'top',
        },
        ref
    ) =>
        databaseEdition ? (
            <Tooltip>
                <TooltipTrigger
                    className={cn('mr-1', className)}
                    ref={ref}
                    asChild
                >
                    <img
                        src={databaseEditionToImageMap[databaseEdition]}
                        className={cn(
                            'max-h-5 max-w-5 rounded-full',
                            imgClassName
                        )}
                        alt="database"
                        onClick={onClick}
                    />
                </TooltipTrigger>
                <TooltipContent
                    side={tooltipSide}
                    sideOffset={8}
                    className="z-[1100]"
                >
                    {databaseEditionToLabelMap[databaseEdition]}
                </TooltipContent>
            </Tooltip>
        ) : (
            <Tooltip>
                <TooltipTrigger
                    className={cn('mr-2', className)}
                    ref={ref}
                    asChild
                >
                    <img
                        src={databaseSecondaryLogoMap[databaseType]}
                        className={cn('max-h-5 max-w-5', imgClassName)}
                        alt="database"
                        onClick={onClick}
                    />
                </TooltipTrigger>
                <TooltipContent
                    side={tooltipSide}
                    sideOffset={8}
                    className="z-[1100]"
                >
                    {databaseTypeToLabelMap[databaseType]}
                </TooltipContent>
            </Tooltip>
        )
);

DiagramIcon.displayName = 'DiagramIcon';
