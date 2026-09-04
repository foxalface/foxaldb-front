export const FRAMEWORK_DIAGRAM_LABELS = {
    laravel: 'Laravel',
    prisma: 'Prisma',
    drizzle: 'Drizzle',
    rails: 'Rails',
    entity_framework_core: 'EF Core',
    django: 'Django',
} as const;

export const resolveProjectDiagramName = (
    rootPath: string,
    frameworkLabel: string,
    archiveBaseName?: string,
    usesVirtualLayout?: boolean
): string => {
    if (usesVirtualLayout && archiveBaseName) {
        const normalized = archiveBaseName.replace(/\.zip$/i, '').trim();

        if (normalized.length > 0) {
            return `${normalized} Import`;
        }
    }

    const segments = rootPath.split('/').filter(Boolean);
    const basename = segments[segments.length - 1];

    if (basename) {
        return `${basename} Import`;
    }

    return `${frameworkLabel} Import`;
};
