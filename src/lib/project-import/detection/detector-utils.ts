import type { ArchiveReader } from '../archive/archive-reader';
import type {
    ProjectDetectionCandidate,
    ProjectEvidence,
} from '../project-types';
import {
    PROJECT_EVIDENCE_WEIGHTS,
    resolveDetectionConfidence,
    sumEvidenceScore,
} from './evidence';
import {
    basename,
    getPathsUnderRoot,
    joinArchivePath,
    normalizeRootPath,
    type ArchivePathIndex,
} from './archive-paths';

export type ProjectDetector = (
    archive: ArchiveReader,
    index: ArchivePathIndex,
    rootPath: string
) => Promise<ProjectDetectionCandidate[]>;

export const createCandidate = (
    framework: ProjectDetectionCandidate['framework'],
    rootPath: string,
    evidence: ProjectEvidence[],
    relevantFiles: string[]
): ProjectDetectionCandidate | null => {
    if (evidence.length === 0) {
        return null;
    }

    const score = sumEvidenceScore(evidence);
    const confidence = resolveDetectionConfidence(score, evidence);

    return {
        framework,
        rootPath: normalizeRootPath(rootPath),
        score,
        confidence,
        evidence,
        relevantFiles: [...new Set(relevantFiles)].sort(),
        parserLocation: 'local',
    };
};

export const evidenceFromCode = (
    code: ProjectEvidence['code'],
    path?: string
): ProjectEvidence => ({
    code,
    weight: PROJECT_EVIDENCE_WEIGHTS[code],
    path,
});

export const matchesRelativePath = (
    filePath: string,
    rootPath: string,
    relativePath: string
): boolean => filePath === joinArchivePath(rootPath, relativePath);

export const matchesRelativeSuffix = (
    filePath: string,
    rootPath: string,
    suffix: string
): boolean => {
    const fullPath = joinArchivePath(rootPath, suffix);
    return filePath === fullPath || filePath.endsWith(`/${suffix}`);
};

export const listPathsMatching = (
    index: ArchivePathIndex,
    rootPath: string,
    predicate: (filePath: string) => boolean
): string[] =>
    getPathsUnderRoot(index.filePaths, rootPath).filter(predicate).sort();

export const readTextIfExists = async (
    archive: ArchiveReader,
    path: string
): Promise<string | null> => {
    if (!archive.has(path)) {
        return null;
    }

    try {
        return await archive.readText(path);
    } catch {
        return null;
    }
};

export const containsDependency = (
    content: string,
    patterns: RegExp[]
): boolean => patterns.some((pattern) => pattern.test(content));

export const isMigrationFileName = (filePath: string): boolean => {
    const fileName = basename(filePath);
    return fileName !== '__init__.py' && !fileName.startsWith('.');
};
