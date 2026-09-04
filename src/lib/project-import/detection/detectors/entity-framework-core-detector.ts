import type { ProjectDetectionCandidate } from '../../project-types';
import { normalizeRootPath } from '../archive-paths';
import {
    createCandidate,
    evidenceFromCode,
    listPathsMatching,
    readTextIfExists,
    containsDependency,
    type ProjectDetector,
} from '../detector-utils';
import {
    filterEfSnapshotsInProjectScope,
    resolveEfCsprojProjectRoot,
} from '../ef-project-scope';
import { isCanonicalEfSnapshotPath } from '../virtual-layout/virtual-layout-utils';

const EF_CORE_CSPROJ_PATTERN = /Microsoft\.EntityFrameworkCore/i;

export const detectEntityFrameworkCoreProject: ProjectDetector = async (
    archive,
    index,
    rootPath
) => {
    const evidence: ProjectDetectionCandidate['evidence'] = [];
    const relevantFiles: string[] = [];

    const csprojPaths = listPathsMatching(index, rootPath, (filePath) =>
        filePath.endsWith('.csproj')
    );
    let resolvedCsprojPath: string | null = null;

    for (const csprojPath of csprojPaths) {
        const content = await readTextIfExists(archive, csprojPath);
        if (content && containsDependency(content, [EF_CORE_CSPROJ_PATTERN])) {
            evidence.push(evidenceFromCode('ef_csproj', csprojPath));
            resolvedCsprojPath = csprojPath;
            relevantFiles.push(csprojPath);
            break;
        }
    }

    const allSnapshotPaths = listPathsMatching(index, rootPath, (filePath) =>
        filePath.endsWith('ModelSnapshot.cs')
    );
    const projectRoot = resolvedCsprojPath
        ? resolveEfCsprojProjectRoot(resolvedCsprojPath)
        : normalizeRootPath(rootPath);
    const snapshotPaths = resolvedCsprojPath
        ? filterEfSnapshotsInProjectScope(allSnapshotPaths, projectRoot, index)
        : allSnapshotPaths.filter((filePath) =>
              isCanonicalEfSnapshotPath(filePath)
          );

    if (snapshotPaths.length > 0) {
        evidence.push(evidenceFromCode('ef_model_snapshot', snapshotPaths[0]));
        relevantFiles.push(...snapshotPaths);
    } else {
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
    }

    const candidate = createCandidate(
        'entity_framework_core',
        rootPath,
        evidence,
        relevantFiles
    );

    return candidate ? [candidate] : [];
};
