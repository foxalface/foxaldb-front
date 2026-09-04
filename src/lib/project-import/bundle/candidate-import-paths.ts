import type { ProjectDetectionCandidate } from '../project-types';
import { normalizeRootPath } from '../detection/archive-paths';
import {
    isAllowedFrameworkRelativePath,
    isExcludedBundlePath,
} from './framework-file-specs';

export const toBundleRelativePath = (
    rootPath: string,
    archivePath: string
): string => {
    const normalizedRoot = normalizeRootPath(rootPath);

    if (normalizedRoot.length === 0) {
        return archivePath;
    }

    if (archivePath === normalizedRoot) {
        return '';
    }

    return archivePath.slice(normalizedRoot.length + 1);
};

export const getCandidateImportPaths = (
    candidate: ProjectDetectionCandidate
): string[] => {
    if (candidate.usesVirtualLayout && candidate.pathMappings) {
        const logicalPaths = candidate.pathMappings
            .map((mapping) => mapping.logicalPath)
            .filter(
                (relativePath) =>
                    relativePath.length > 0 &&
                    !isExcludedBundlePath(relativePath) &&
                    isAllowedFrameworkRelativePath(
                        candidate.framework,
                        relativePath
                    )
            );

        return [...new Set(logicalPaths)].sort();
    }

    const importPaths = candidate.relevantFiles
        .map((archivePath) =>
            toBundleRelativePath(candidate.rootPath, archivePath)
        )
        .filter(
            (relativePath) =>
                relativePath.length > 0 &&
                !isExcludedBundlePath(relativePath) &&
                isAllowedFrameworkRelativePath(
                    candidate.framework,
                    relativePath
                )
        );

    return [...new Set(importPaths)].sort();
};
