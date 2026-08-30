import type { ParserLocation, ProjectFramework } from './project-types';

const PARSER_LOCATION_BY_FRAMEWORK: Record<ProjectFramework, ParserLocation> = {
    prisma: 'local',
    drizzle: 'local',
    rails: 'local',
    laravel: 'remote',
    entity_framework_core: 'remote',
    django: 'remote',
};

export const getParserLocation = (
    framework: ProjectFramework
): ParserLocation => PARSER_LOCATION_BY_FRAMEWORK[framework];

export const isRemoteParserFramework = (framework: ProjectFramework): boolean =>
    getParserLocation(framework) === 'remote';
