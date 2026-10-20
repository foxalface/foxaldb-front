import type { ArchiveReader } from './archive/archive-reader';
import type { DatabaseType } from '@/lib/domain/database-type';
import { collectFileBundle } from './bundle/collect-file-bundle';
import { collectGroupBundle } from './bundle/collect-group-bundle';
import { getParserLocation } from './parser-location';
import { parseLocalProject } from './local/local-project-parser';
import { parseRemoteProject } from './remote/parse-remote-project';
import type {
    ProjectImportInput,
    ProjectImportResult,
} from './project-execution-types';
import type {
    ProjectDetectionCandidate,
    ProjectDatabaseGroup,
} from './project-types';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';
import {
    ProjectImportBundlePrecheckError,
    validateProjectImportBundle,
} from './bundle/validate-project-import-bundle';
import { ProjectImportValidationRejectedError } from './project-import-errors';
import { isProjectImportParserAvailable } from './project-import-capability';
import { ProjectImportParserUnavailableError } from './project-import-errors';
import {
    resolveProjectDiagramName,
    FRAMEWORK_DIAGRAM_LABELS,
} from './resolve-project-diagram-name';

export interface ImportProjectParams {
    archive: ArchiveReader;
    candidate: ProjectDetectionCandidate;
    targetDatabaseType: DatabaseType;
    archiveFileName?: string;
    databaseGroup?: ProjectDatabaseGroup;
    projectImportLimits?: UploadCapabilities['projectImport'];
}

const applyDiagramNameHint = (
    result: ProjectImportResult,
    bundleDiagramNameHint?: string
): ProjectImportResult => {
    if (!bundleDiagramNameHint) {
        return result;
    }

    return {
        ...result,
        diagram: {
            ...result.diagram,
            name: bundleDiagramNameHint,
        },
    };
};

export const importProject = async (
    params: ImportProjectParams
): Promise<ProjectImportResult> => {
    const {
        archive,
        candidate,
        targetDatabaseType,
        archiveFileName,
        databaseGroup,
        projectImportLimits,
    } = params;

    if (!isProjectImportParserAvailable(candidate.framework)) {
        throw new ProjectImportParserUnavailableError();
    }

    const archiveBaseName = archiveFileName?.replace(/\.zip$/i, '');
    const diagramNameHint = candidate.usesVirtualLayout
        ? resolveProjectDiagramName(
              candidate.rootPath,
              FRAMEWORK_DIAGRAM_LABELS[candidate.framework],
              archiveBaseName,
              true
          )
        : undefined;

    const bundle = databaseGroup
        ? await collectGroupBundle(archive, candidate, databaseGroup, {
              diagramNameHint,
          })
        : await collectFileBundle(archive, candidate, {
              diagramNameHint,
          });

    if (projectImportLimits) {
        try {
            validateProjectImportBundle(bundle, projectImportLimits);
        } catch (caught) {
            if (caught instanceof ProjectImportBundlePrecheckError) {
                throw new ProjectImportValidationRejectedError(caught.message, {
                    backendCode: caught.code,
                });
            }

            throw caught;
        }
    }

    const input: ProjectImportInput = {
        candidate,
        bundle,
        targetDatabaseType,
    };

    const parserLocation = getParserLocation(candidate.framework);

    const result =
        parserLocation === 'local'
            ? await parseLocalProject(input)
            : await parseRemoteProject({
                  framework: candidate.framework,
                  files: bundle.files,
                  rootPath: bundle.rootPath,
                  targetDatabaseType,
              });

    return applyDiagramNameHint(result, bundle.diagramNameHint);
};
