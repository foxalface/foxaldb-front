import type { ArchivePathIndex } from './archive-paths';
import { getRootPathFromFile, normalizeRootPath } from './archive-paths';
import { resolveEfSnapshotProjectRoot } from './project-root-discovery';
import { isCanonicalEfSnapshotPath } from './virtual-layout/virtual-layout-utils';

export const resolveEfCsprojProjectRoot = (csprojPath: string): string =>
    normalizeRootPath(getRootPathFromFile(csprojPath));

export const isEfSnapshotInProjectScope = (
    snapshotPath: string,
    projectRoot: string,
    index: ArchivePathIndex
): boolean => {
    const resolvedRoot = resolveEfSnapshotProjectRoot(snapshotPath, index);

    if (resolvedRoot === null) {
        return false;
    }

    return normalizeRootPath(resolvedRoot) === normalizeRootPath(projectRoot);
};

export const filterEfSnapshotsInProjectScope = (
    snapshotPaths: string[],
    projectRoot: string,
    index: ArchivePathIndex
): string[] =>
    snapshotPaths.filter((snapshotPath) =>
        isEfSnapshotInProjectScope(snapshotPath, projectRoot, index)
    );

export const isUnclaimedEfSnapshot = (
    snapshotPath: string,
    index: ArchivePathIndex,
    claimedProjectRoots: ReadonlySet<string>
): boolean => {
    const resolvedRoot = resolveEfSnapshotProjectRoot(snapshotPath, index);

    if (resolvedRoot === null) {
        return isCanonicalEfSnapshotPath(snapshotPath);
    }

    return !claimedProjectRoots.has(normalizeRootPath(resolvedRoot));
};
