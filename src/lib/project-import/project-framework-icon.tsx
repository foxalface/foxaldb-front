import React from 'react';
import type { IconType } from 'react-icons';
import {
    SiDjango,
    SiDotnet,
    SiDrizzle,
    SiLaravel,
    SiPrisma,
    SiRubyonrails,
} from 'react-icons/si';
import type { ProjectFramework } from './project-types';

interface ProjectFrameworkIconProps {
    framework: ProjectFramework;
    className?: string;
}

const FRAMEWORK_ICONS: Record<ProjectFramework, IconType> = {
    laravel: SiLaravel,
    prisma: SiPrisma,
    rails: SiRubyonrails,
    drizzle: SiDrizzle,
    entity_framework_core: SiDotnet,
    django: SiDjango,
};

export const ProjectFrameworkIcon: React.FC<ProjectFrameworkIconProps> = ({
    framework,
    className = 'size-4 shrink-0',
}) => {
    const Icon = FRAMEWORK_ICONS[framework];

    return <Icon className={className} aria-hidden />;
};
