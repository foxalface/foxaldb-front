import type { ProjectDetectionCandidate } from '../../project-types';
import {
    createCandidate,
    evidenceFromCode,
    listPathsMatching,
    readTextIfExists,
    containsDependency,
    type ProjectDetector,
} from '../detector-utils';

const EF_CORE_CSPROJ_PATTERN = /Microsoft\.EntityFrameworkCore/i;

export const detectEntityFrameworkCoreProject: ProjectDetector = async (
    archive,
    index,
    rootPath
) => {
    const evidence: ProjectDetectionCandidate['evidence'] = [];
    const relevantFiles: string[] = [];

    const snapshotPaths = listPathsMatching(index, rootPath, (filePath) =>
        filePath.endsWith('ModelSnapshot.cs')
    );
    if (snapshotPaths.length > 0) {
        evidence.push(evidenceFromCode('ef_model_snapshot', snapshotPaths[0]));
        relevantFiles.push(...snapshotPaths);
    }

    const migrationPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.includes('/Migrations/') &&
            filePath.endsWith('Migration.cs')
    );
    if (migrationPaths.length > 0) {
        evidence.push(evidenceFromCode('ef_migrations', migrationPaths[0]));
        relevantFiles.push(...migrationPaths);
    }

    const csprojPaths = listPathsMatching(index, rootPath, (filePath) =>
        filePath.endsWith('.csproj')
    );
    for (const csprojPath of csprojPaths) {
        const content = await readTextIfExists(archive, csprojPath);
        if (content && containsDependency(content, [EF_CORE_CSPROJ_PATTERN])) {
            evidence.push(evidenceFromCode('ef_csproj', csprojPath));
            relevantFiles.push(csprojPath);
            break;
        }
    }

    const candidate = createCandidate(
        'entity_framework_core',
        rootPath,
        evidence,
        relevantFiles
    );

    return candidate ? [candidate] : [];
};
