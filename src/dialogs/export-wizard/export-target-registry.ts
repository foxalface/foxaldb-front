import type { LucideIcon } from 'lucide-react';
import {
    Archive,
    Database,
    FileCode2,
    FileImage,
    FileJson,
    Image,
} from 'lucide-react';
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
    icon: LucideIcon;
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
        icon: Database,
    },
    {
        id: 'laravel',
        section: 'framework',
        titleKey: 'export_wizard.targets.laravel.title',
        descriptionKey: 'export_wizard.targets.laravel.description',
        icon: Archive,
    },
    {
        id: 'prisma',
        section: 'framework',
        titleKey: 'export_wizard.targets.prisma.title',
        descriptionKey: 'export_wizard.targets.prisma.description',
        icon: FileCode2,
    },
    {
        id: 'ef_core',
        section: 'framework',
        titleKey: 'export_wizard.targets.ef_core.title',
        descriptionKey: 'export_wizard.targets.ef_core.description',
        icon: FileCode2,
    },
    {
        id: 'rails',
        section: 'framework',
        titleKey: 'export_wizard.targets.rails.title',
        descriptionKey: 'export_wizard.targets.rails.description',
        icon: FileCode2,
    },
    {
        id: 'django',
        section: 'framework',
        titleKey: 'export_wizard.targets.django.title',
        descriptionKey: 'export_wizard.targets.django.description',
        icon: FileCode2,
    },
    {
        id: 'drizzle',
        section: 'framework',
        titleKey: 'export_wizard.targets.drizzle.title',
        descriptionKey: 'export_wizard.targets.drizzle.description',
        icon: FileCode2,
    },
    {
        id: 'dbml',
        section: 'portable',
        titleKey: 'export_wizard.targets.dbml.title',
        descriptionKey: 'export_wizard.targets.dbml.description',
        icon: FileCode2,
    },
    {
        id: 'diagram_json',
        section: 'portable',
        titleKey: 'export_wizard.targets.diagram_json.title',
        descriptionKey: 'export_wizard.targets.diagram_json.description',
        icon: FileJson,
    },
    {
        id: 'png',
        section: 'visual',
        titleKey: 'export_wizard.targets.png.title',
        descriptionKey: 'export_wizard.targets.png.description',
        icon: Image,
    },
    {
        id: 'jpg',
        section: 'visual',
        titleKey: 'export_wizard.targets.jpg.title',
        descriptionKey: 'export_wizard.targets.jpg.description',
        icon: Image,
    },
    {
        id: 'svg',
        section: 'visual',
        titleKey: 'export_wizard.targets.svg.title',
        descriptionKey: 'export_wizard.targets.svg.description',
        icon: FileImage,
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
