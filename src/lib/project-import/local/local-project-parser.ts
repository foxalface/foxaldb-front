import type {
    ProjectImportInput,
    ProjectImportResult,
} from '../project-execution-types';
import type { LocalProjectFramework } from '../project-execution-types';
import { ProjectImportParserUnavailableError } from '../project-import-errors';
import { parseDrizzleProject } from './drizzle/drizzle-project-parser';
import { parsePrismaProject } from './prisma/prisma-project-parser';
import { parseRailsProject } from './rails/rails-project-parser';

export type LocalProjectParser = (
    input: ProjectImportInput
) => Promise<ProjectImportResult>;

const LOCAL_PROJECT_PARSERS: Partial<
    Record<LocalProjectFramework, LocalProjectParser>
> = {
    drizzle: parseDrizzleProject,
    prisma: parsePrismaProject,
    rails: parseRailsProject,
};

export const getLocalProjectParser = (
    framework: LocalProjectFramework
): LocalProjectParser | null => LOCAL_PROJECT_PARSERS[framework] ?? null;

export const parseLocalProject = async (
    input: ProjectImportInput
): Promise<ProjectImportResult> => {
    const parser = getLocalProjectParser(
        input.candidate.framework as LocalProjectFramework
    );

    if (!parser) {
        throw new ProjectImportParserUnavailableError();
    }

    return parser(input);
};
