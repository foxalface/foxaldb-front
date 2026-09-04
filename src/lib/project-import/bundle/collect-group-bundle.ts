import type { ArchiveReader } from '../archive/archive-reader';
import type {
    ProjectDatabaseGroup,
    ProjectDetectionCandidate,
    ProjectFileBundle,
    ProjectFileBundleEntry,
} from '../project-types';
import { normalizeRootPath } from '../detection/archive-paths';
import {
    isAllowedFrameworkRelativePath,
    isExcludedBundlePath,
} from './framework-file-specs';

const collectMappingsBundle = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate,
    mappings: ProjectDatabaseGroup['fileMappings']
): Promise<ProjectFileBundleEntry[]> => {
    const filesByRelativePath = new Map<string, ProjectFileBundleEntry>();

    for (const mapping of mappings) {
        if (filesByRelativePath.has(mapping.logicalPath)) {
            continue;
        }

        if (
            !isAllowedFrameworkRelativePath(
                candidate.framework,
                mapping.logicalPath
            ) ||
            isExcludedBundlePath(mapping.logicalPath)
        ) {
            continue;
        }

        const content = await archive.readText(mapping.physicalPath);
        filesByRelativePath.set(mapping.logicalPath, {
            relativePath: mapping.logicalPath,
            content,
        });
    }

    return Array.from(filesByRelativePath.values()).sort((left, right) =>
        left.relativePath.localeCompare(right.relativePath)
    );
};

export const collectGroupBundle = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate,
    group: ProjectDatabaseGroup,
    options?: { diagramNameHint?: string }
): Promise<ProjectFileBundle> => {
    const allMappings = [
        ...group.fileMappings,
        ...(group.supportingFileMappings ?? []),
    ];
    const files = await collectMappingsBundle(archive, candidate, allMappings);

    return {
        framework: candidate.framework,
        rootPath: normalizeRootPath(candidate.rootPath),
        files,
        diagramNameHint: options?.diagramNameHint ?? group.label,
    };
};
