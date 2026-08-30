import type { ProjectFramework } from './project-types';

export const PROJECT_FRAMEWORK_LABEL_KEYS: Record<ProjectFramework, string> = {
    laravel: 'new_diagram_dialog.import_schema.project.frameworks.laravel',
    prisma: 'new_diagram_dialog.import_schema.project.frameworks.prisma',
    drizzle: 'new_diagram_dialog.import_schema.project.frameworks.drizzle',
    rails: 'new_diagram_dialog.import_schema.project.frameworks.rails',
    entity_framework_core:
        'new_diagram_dialog.import_schema.project.frameworks.entity_framework_core',
    django: 'new_diagram_dialog.import_schema.project.frameworks.django',
};

export const getProjectCandidateKey = (candidate: {
    framework: ProjectFramework;
    rootPath: string;
}): string => `${candidate.framework}:${candidate.rootPath}`;
