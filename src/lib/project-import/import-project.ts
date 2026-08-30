import type { ArchiveReader } from './archive/archive-reader';
import type { DatabaseType } from '@/lib/domain/database-type';
import { collectFileBundle } from './bundle/collect-file-bundle';
import { getParserLocation } from './parser-location';
import { parseLocalProject } from './local/local-project-parser';
import { parseRemoteProject } from './remote/parse-remote-project';
import type {
    ProjectImportInput,
    ProjectImportResult,
} from './project-execution-types';
import type { ProjectDetectionCandidate } from './project-types';
import { isProjectImportParserAvailable } from './project-import-capability';
import { ProjectImportParserUnavailableError } from './project-import-errors';

export interface ImportProjectParams {
    archive: ArchiveReader;
    candidate: ProjectDetectionCandidate;
    targetDatabaseType: DatabaseType;
}

export const importProject = async (
    params: ImportProjectParams
): Promise<ProjectImportResult> => {
    const { archive, candidate, targetDatabaseType } = params;

    if (!isProjectImportParserAvailable(candidate.framework)) {
        throw new ProjectImportParserUnavailableError();
    }

    const bundle = await collectFileBundle(archive, candidate);

    const input: ProjectImportInput = {
        candidate,
        bundle,
        targetDatabaseType,
    };

    const parserLocation = getParserLocation(candidate.framework);

    if (parserLocation === 'local') {
        return parseLocalProject(input);
    }

    return parseRemoteProject({
        framework: candidate.framework,
        files: bundle.files,
        rootPath: bundle.rootPath,
        targetDatabaseType,
    });
};
