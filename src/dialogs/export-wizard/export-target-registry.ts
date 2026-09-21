import type { IconType } from 'react-icons';
import { LuFileCode2, LuFileJson2 } from 'react-icons/lu';
import { PiFileJpg, PiFilePng, PiFileSql, PiFileSvg } from 'react-icons/pi';
import type { ProjectFramework } from '@/lib/project-import/project-types';
import type { ExportTargetId, ExportTargetSection } from './export-target-id';
import {
    getExportTargetAvailability,
    type ExportAvailabilityContext,
    type ExportTargetAvailability,
} from './export-target-availability';

export interface ExportTargetDefinition {
    id: ExportTargetId;
    section: ExportTargetSection;
    titleKey: string;
    descriptionKey: string;
    icon?: IconType;
    framework?: ProjectFramework;
}

export const EXPORT_TARGET_SECTIONS: ExportTargetSection[] = [
    'database',
    'framework',
    'portable',
    'visual',
];

export const EXPORT_TARGET_SECTION_LABEL_KEYS: Record<
    ExportTargetSection,
    string
> = {
    database: 'export_wizard.sections.database',
    framework: 'export_wizard.sections.framework',
    portable: 'export_wizard.sections.portable',
    visual: 'export_wizard.sections.visual',
};

export const EXPORT_TARGET_REGISTRY: ExportTargetDefinition[] = [
    {
        id: 'sql',
        section: 'database',
        titleKey: 'export_wizard.targets.sql.title',
        descriptionKey: 'export_wizard.targets.sql.description',
        icon: PiFileSql,
    },
    {
        id: 'laravel',
        section: 'framework',
        titleKey: 'export_wizard.targets.laravel.title',
        descriptionKey: 'export_wizard.targets.laravel.description',
        framework: 'laravel',
    },
    {
        id: 'prisma',
        section: 'framework',
        titleKey: 'export_wizard.targets.prisma.title',
        descriptionKey: 'export_wizard.targets.prisma.description',
        framework: 'prisma',
    },
    {
        id: 'ef_core',
        section: 'framework',
        titleKey: 'export_wizard.targets.ef_core.title',
        descriptionKey: 'export_wizard.targets.ef_core.description',
        framework: 'entity_framework_core',
    },
    {
        id: 'rails',
        section: 'framework',
        titleKey: 'export_wizard.targets.rails.title',
        descriptionKey: 'export_wizard.targets.rails.description',
        framework: 'rails',
    },
    {
        id: 'django',
        section: 'framework',
        titleKey: 'export_wizard.targets.django.title',
        descriptionKey: 'export_wizard.targets.django.description',
        framework: 'django',
    },
    {
        id: 'drizzle',
        section: 'framework',
        titleKey: 'export_wizard.targets.drizzle.title',
        descriptionKey: 'export_wizard.targets.drizzle.description',
        framework: 'drizzle',
    },
    {
        id: 'dbml',
        section: 'portable',
        titleKey: 'export_wizard.targets.dbml.title',
        descriptionKey: 'export_wizard.targets.dbml.description',
        icon: LuFileCode2,
    },
    {
        id: 'diagram_json',
        section: 'portable',
        titleKey: 'export_wizard.targets.diagram_json.title',
        descriptionKey: 'export_wizard.targets.diagram_json.description',
        icon: LuFileJson2,
    },
    {
        id: 'png',
        section: 'visual',
        titleKey: 'export_wizard.targets.png.title',
        descriptionKey: 'export_wizard.targets.png.description',
        icon: PiFilePng,
    },
    {
        id: 'jpg',
        section: 'visual',
        titleKey: 'export_wizard.targets.jpg.title',
        descriptionKey: 'export_wizard.targets.jpg.description',
        icon: PiFileJpg,
    },
    {
        id: 'svg',
        section: 'visual',
        titleKey: 'export_wizard.targets.svg.title',
        descriptionKey: 'export_wizard.targets.svg.description',
        icon: PiFileSvg,
    },
];

export const getExportTargetsForSection = (
    section: ExportTargetSection
): ExportTargetDefinition[] =>
    EXPORT_TARGET_REGISTRY.filter((target) => target.section === section);

export interface ResolvedExportTarget extends ExportTargetDefinition {
    availability: ExportTargetAvailability;
}

export const resolveExportTargets = (
    ctx: ExportAvailabilityContext
): ResolvedExportTarget[] =>
    EXPORT_TARGET_REGISTRY.map((target) => ({
        ...target,
        availability: getExportTargetAvailability(target.id, ctx),
    }));

export const resolveVisibleExportTargetsBySection = (
    section: ExportTargetSection,
    ctx: ExportAvailabilityContext
): ResolvedExportTarget[] =>
    resolveExportTargets(ctx).filter(
        (target) =>
            target.section === section &&
            target.availability.status !== 'hidden'
    );
