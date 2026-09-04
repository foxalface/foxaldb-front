import type { ArchiveReader } from '../../archive/archive-reader';
import type {
    ProjectDatabaseGroup,
    ProjectDetectionCandidate,
    ProjectDetectionConfidence,
    ProjectEvidence,
    ProjectPathMapping,
} from '../../project-types';
import {
    getCandidateImportPaths,
    toBundleRelativePath,
} from '../../bundle/candidate-import-paths';
import {
    isAllowedFrameworkRelativePath,
    isExcludedBundlePath,
} from '../../bundle/framework-file-specs';
import {
    buildArchivePathIndex,
    getPathsUnderRoot,
    normalizeRootPath,
} from '../archive-paths';
import { toPathRelativeToRoot } from '../virtual-layout/virtual-layout-utils';
import { buildDatabaseGroupId } from './group-id';

export const listAllCandidateImportPaths = (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): string[] => {
    const fromCandidate = getCandidateImportPaths(candidate);
    const index = buildArchivePathIndex(archive);
    const scanned = getPathsUnderRoot(index.filePaths, candidate.rootPath)
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

    return [...new Set([...fromCandidate, ...scanned])].sort();
};

export const toDisplayLabel = (segment: string): string => {
    if (segment.length === 0) {
        return 'Main';
    }

    const normalized = segment.replace(/[-_]+/g, ' ').trim();

    if (normalized.length === 0) {
        return 'Main';
    }

    return normalized
        .split(/\s+/)
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ');
};

export const formatGroupLabel = (segment: string): string => {
    if (segment.length === 0) {
        return 'Main';
    }

    if (/[-_]/.test(segment)) {
        return toDisplayLabel(segment);
    }

    if (/^[A-Za-z][A-Za-z0-9]*$/.test(segment)) {
        return segment;
    }

    return toDisplayLabel(segment);
};

export const resolveLogicalPathMappings = (
    candidate: ProjectDetectionCandidate,
    logicalPaths: string[]
): ProjectPathMapping[] => {
    const uniqueLogicalPaths = [...new Set(logicalPaths)].sort();

    if (candidate.usesVirtualLayout && candidate.pathMappings) {
        const mappingsByLogical = new Map(
            candidate.pathMappings.map((mapping) => [
                mapping.logicalPath,
                mapping,
            ])
        );

        return uniqueLogicalPaths
            .map((logicalPath) => mappingsByLogical.get(logicalPath))
            .filter(
                (mapping): mapping is ProjectPathMapping =>
                    mapping !== undefined
            );
    }

    const normalizedRoot = normalizeRootPath(candidate.rootPath);

    return uniqueLogicalPaths.map((logicalPath) => {
        const physicalPath =
            normalizedRoot.length === 0
                ? logicalPath
                : `${normalizedRoot}/${logicalPath}`;

        return {
            physicalPath,
            logicalPath,
        };
    });
};

export const resolveSupportingMappings = (
    candidate: ProjectDetectionCandidate,
    primaryLogicalPaths: string[],
    supportingLogicalPaths: string[]
): ProjectPathMapping[] => {
    const primarySet = new Set(primaryLogicalPaths);
    const filtered = supportingLogicalPaths.filter(
        (logicalPath) => !primarySet.has(logicalPath)
    );

    return resolveLogicalPathMappings(candidate, filtered);
};

export const buildDatabaseGroup = (params: {
    candidate: ProjectDetectionCandidate;
    groupKey: string;
    label: string;
    primaryLogicalPaths: string[];
    supportingLogicalPaths?: string[];
    evidence?: ProjectEvidence[];
    confidence?: ProjectDetectionConfidence;
    isRecommended?: boolean;
    summaryPath?: string;
}): ProjectDatabaseGroup => {
    const {
        candidate,
        groupKey,
        label,
        primaryLogicalPaths,
        supportingLogicalPaths = [],
        evidence = [],
        confidence = candidate.confidence,
        isRecommended = false,
        summaryPath,
    } = params;

    const fileMappings = resolveLogicalPathMappings(
        candidate,
        primaryLogicalPaths
    );
    const supportingFileMappings = resolveSupportingMappings(
        candidate,
        primaryLogicalPaths,
        supportingLogicalPaths
    );

    return {
        id: buildDatabaseGroupId(
            candidate.framework,
            candidate.rootPath,
            groupKey
        ),
        framework: candidate.framework,
        label,
        rootPath: normalizeRootPath(candidate.rootPath),
        fileMappings,
        ...(supportingFileMappings.length > 0
            ? { supportingFileMappings }
            : {}),
        evidence,
        confidence,
        ...(isRecommended ? { isRecommended: true } : {}),
        ...(summaryPath ? { summaryPath } : {}),
    };
};

export const buildFullCandidateGroup = (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): ProjectDatabaseGroup => {
    const importPaths = listAllCandidateImportPaths(archive, candidate);
    const label =
        candidate.framework === 'entity_framework_core'
            ? 'Main'
            : toDisplayLabel(
                  candidate.rootPath.split('/').filter(Boolean).pop() ?? 'main'
              );

    return buildDatabaseGroup({
        candidate,
        groupKey: 'main',
        label: label === 'Main' ? 'Main' : label,
        primaryLogicalPaths: importPaths,
        evidence: candidate.evidence,
        confidence: candidate.confidence,
        isRecommended: true,
        summaryPath:
            candidate.rootPath.length > 0 ? candidate.rootPath : undefined,
    });
};

export const toLogicalPath = (
    candidate: ProjectDetectionCandidate,
    archivePath: string
): string => {
    if (candidate.usesVirtualLayout && candidate.pathMappings) {
        const mapping = candidate.pathMappings.find(
            (item) => item.physicalPath === archivePath
        );

        if (mapping) {
            return mapping.logicalPath;
        }
    }

    return toPathRelativeToRoot(candidate.rootPath, archivePath);
};
