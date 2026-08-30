import type { ArchiveReader } from '../archive/archive-reader';
import type {
    ProjectDetectionCandidate,
    ProjectFileBundle,
    ProjectFileBundleEntry,
} from '../project-types';
import {
    getPathsUnderRoot,
    normalizeRootPath,
    pathStartsWithRoot,
} from '../detection/archive-paths';
import { buildArchivePathIndex } from '../detection/archive-paths';
import {
    FRAMEWORK_FILE_SPECS,
    isAllowedFrameworkRelativePath,
    isExcludedBundlePath,
} from './framework-file-specs';

const toRelativePath = (rootPath: string, archivePath: string): string => {
    const normalizedRoot = normalizeRootPath(rootPath);

    if (normalizedRoot.length === 0) {
        return archivePath;
    }

    if (archivePath === normalizedRoot) {
        return '';
    }

    return archivePath.slice(normalizedRoot.length + 1);
};

const isRelevantCandidatePath = (
    candidate: ProjectDetectionCandidate,
    archivePath: string
): boolean => {
    if (!pathStartsWithRoot(archivePath, candidate.rootPath)) {
        return false;
    }

    const relativePath = toRelativePath(candidate.rootPath, archivePath);
    if (relativePath.length === 0 || isExcludedBundlePath(relativePath)) {
        return false;
    }

    if (candidate.relevantFiles.includes(archivePath)) {
        return true;
    }

    return isAllowedFrameworkRelativePath(candidate.framework, relativePath);
};

export const collectFileBundle = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): Promise<ProjectFileBundle> => {
    const index = buildArchivePathIndex(archive);
    const candidatePaths = getPathsUnderRoot(
        index.filePaths,
        candidate.rootPath
    ).filter((archivePath) => isRelevantCandidatePath(candidate, archivePath));

    const filesByRelativePath = new Map<string, ProjectFileBundleEntry>();

    for (const archivePath of candidatePaths) {
        const relativePath = toRelativePath(candidate.rootPath, archivePath);
        if (relativePath.length === 0) {
            continue;
        }

        if (
            !isAllowedFrameworkRelativePath(candidate.framework, relativePath)
        ) {
            continue;
        }

        if (filesByRelativePath.has(relativePath)) {
            continue;
        }

        const content = await archive.readText(archivePath);
        filesByRelativePath.set(relativePath, {
            relativePath,
            content,
        });
    }

    // Ensure required specs are represented when present in relevantFiles
    for (const archivePath of candidate.relevantFiles) {
        if (!pathStartsWithRoot(archivePath, candidate.rootPath)) {
            continue;
        }

        const relativePath = toRelativePath(candidate.rootPath, archivePath);
        if (
            relativePath.length === 0 ||
            filesByRelativePath.has(relativePath) ||
            isExcludedBundlePath(relativePath)
        ) {
            continue;
        }

        if (
            !isAllowedFrameworkRelativePath(candidate.framework, relativePath)
        ) {
            continue;
        }

        const content = await archive.readText(archivePath);
        filesByRelativePath.set(relativePath, {
            relativePath,
            content,
        });
    }

    const files = Array.from(filesByRelativePath.values()).sort((left, right) =>
        left.relativePath.localeCompare(right.relativePath)
    );

    return {
        framework: candidate.framework,
        rootPath: normalizeRootPath(candidate.rootPath),
        files,
    };
};

export const getFrameworkRequiredSpecs = (
    framework: ProjectDetectionCandidate['framework']
) => FRAMEWORK_FILE_SPECS[framework].filter((spec) => !spec.optional);
