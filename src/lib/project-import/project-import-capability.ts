import type { ProjectFramework } from './project-types';
import { getParserLocation, isRemoteParserFramework } from './parser-location';

const PARSER_EXECUTION_AVAILABLE: Record<ProjectFramework, boolean> = {
    laravel: true,
    prisma: false,
    drizzle: false,
    rails: false,
    entity_framework_core: false,
    django: false,
};

export interface ProjectParserCapability {
    framework: ProjectFramework;
    location: ReturnType<typeof getParserLocation>;
    executionAvailable: boolean;
}

export const getProjectParserCapability = (
    framework: ProjectFramework
): ProjectParserCapability => ({
    framework,
    location: getParserLocation(framework),
    executionAvailable: PARSER_EXECUTION_AVAILABLE[framework],
});

export const isProjectImportParserAvailable = (
    framework: ProjectFramework
): boolean => PARSER_EXECUTION_AVAILABLE[framework];

export const canExecuteProjectImport = (
    framework: ProjectFramework,
    isAuthenticated: boolean
): boolean => {
    if (!isProjectImportParserAvailable(framework)) {
        return false;
    }

    if (isRemoteParserFramework(framework) && !isAuthenticated) {
        return false;
    }

    return true;
};

/**
 * @deprecated Use isProjectImportParserAvailable() or canExecuteProjectImport() instead.
 */
export const PROJECT_IMPORT_PARSER_ENABLED = false;
