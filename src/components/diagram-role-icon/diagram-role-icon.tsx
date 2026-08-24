import React from 'react';
import type { TooltipContentProps } from '@radix-ui/react-tooltip';
import { Crown, Eye, Pencil, type LucideIcon } from 'lucide-react';
import type { DiagramAccessRole } from '@/lib/api/diagrams';
import type { DiagramMemberRole } from '@/lib/api/diagram-members';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type DiagramRoleValue = DiagramAccessRole | DiagramMemberRole;

const ROLE_ICONS: Record<DiagramRoleValue, LucideIcon> = {
    owner: Crown,
    editor: Pencil,
    viewer: Eye,
};

export interface DiagramRoleIconProps {
    role: DiagramRoleValue;
    className?: string;
    iconClassName?: string;
    withTooltip?: boolean;
    tooltipSide?: TooltipContentProps['side'];
}

export const DiagramRoleIcon: React.FC<DiagramRoleIconProps> = ({
    role,
    className,
    iconClassName,
    withTooltip = true,
    tooltipSide = 'top',
}) => {
    const { t } = useTranslation();
    const Icon = ROLE_ICONS[role];
    const label = t(`diagram_role.${role}`);

    const iconMarkup = (
        <Icon className={cn('size-3.5', iconClassName)} aria-hidden />
    );
    const wrapperClassName = cn(
        'inline-flex shrink-0 items-center justify-center text-muted-foreground',
        className
    );

    if (!withTooltip) {
        return (
            <span aria-hidden className={wrapperClassName}>
                {iconMarkup}
            </span>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span aria-label={label} className={wrapperClassName}>
                    {iconMarkup}
                </span>
            </TooltipTrigger>
            <TooltipContent
                side={tooltipSide}
                sideOffset={8}
                className="z-[1100]"
            >
                {label}
            </TooltipContent>
        </Tooltip>
    );
};
