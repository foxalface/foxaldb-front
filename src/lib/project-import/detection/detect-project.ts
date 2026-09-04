import type { ArchiveReader } from '../archive/archive-reader';
import type { ProjectDetectionCandidate } from '../project-types';
import {
    isSelectableCandidate,
    resolveDetectionConfidence,
    sumEvidenceScore,
} from './evidence';
import { getParserLocation } from '../parser-location';
import { detectDjangoProject } from './detectors/django-detector';
import { detectDrizzleProject } from './detectors/drizzle-detector';
import { detectEntityFrameworkCoreProject } from './detectors/entity-framework-core-detector';
import { detectLaravelProject } from './detectors/laravel-detector';
import { detectPrismaProject } from './detectors/prisma-detector';
import { detectRailsProject } from './detectors/rails-detector';
import { buildArchivePathIndex } from './archive-paths';
import { discoverProjectRootCandidates } from './project-root-discovery';
import { detectFlexibleLayoutCandidates } from './virtual-layout/detect-flexible-layout';

const DETECTORS = [
    detectLaravelProject,
    detectPrismaProject,
    detectDrizzleProject,
    detectRailsProject,
    detectEntityFrameworkCoreProject,
    detectDjangoProject,
] as const;

const candidateKey = (candidate: ProjectDetectionCandidate): string =>
    `${candidate.framework}:${candidate.rootPath}`;

const mergeCandidates = (
    candidates: ProjectDetectionCandidate[]
): ProjectDetectionCandidate[] => {
    const merged = new Map<string, ProjectDetectionCandidate>();

    for (const candidate of candidates) {
        const key = candidateKey(candidate);
        const existing = merged.get(key);

        if (!existing) {
            merged.set(key, candidate);
            continue;
        }

        const evidenceByCode = new Map(
            existing.evidence.map((item) => [item.code, item])
        );

        for (const item of candidate.evidence) {
            const current = evidenceByCode.get(item.code);
            if (!current || item.weight > current.weight) {
                evidenceByCode.set(item.code, item);
            }
        }

        const evidence = Array.from(evidenceByCode.values());
        const score = sumEvidenceScore(evidence);
        const mergedRelevantFiles = Array.from(
            new Set([...existing.relevantFiles, ...candidate.relevantFiles])
        ).sort();
        const virtualCandidate = candidate.usesVirtualLayout
            ? candidate
            : existing.usesVirtualLayout
              ? existing
              : null;

        merged.set(key, {
            ...existing,
            evidence,
            score,
            confidence: resolveDetectionConfidence(score, evidence),
            relevantFiles: virtualCandidate
                ? virtualCandidate.relevantFiles
                : mergedRelevantFiles,
            ...(virtualCandidate
                ? {
                      usesVirtualLayout: true,
                      pathMappings: virtualCandidate.pathMappings,
                  }
                : {}),
        });
    }

    return Array.from(merged.values());
};

const sortCandidates = (
    candidates: ProjectDetectionCandidate[]
): ProjectDetectionCandidate[] =>
    [...candidates].sort((left, right) => {
        if (right.score !== left.score) {
            return right.score - left.score;
        }

        const leftDepth = left.rootPath.split('/').filter(Boolean).length;
        const rightDepth = right.rootPath.split('/').filter(Boolean).length;
        if (leftDepth !== rightDepth) {
            return leftDepth - rightDepth;
        }

        return left.rootPath.localeCompare(right.rootPath);
    });

export const detectProjectCandidates = async (
    archive: ArchiveReader
): Promise<ProjectDetectionCandidate[]> => {
    const index = buildArchivePathIndex(archive);
    const rootCandidates = discoverProjectRootCandidates(index);
    const rootsToScan = rootCandidates.length > 0 ? rootCandidates : [''];

    const detected: ProjectDetectionCandidate[] = [];

    for (const rootPath of rootsToScan) {
        for (const detector of DETECTORS) {
            const result = await detector(archive, index, rootPath);
            detected.push(...result);
        }
    }

    const merged = mergeCandidates(detected);
    const flexible = await detectFlexibleLayoutCandidates(
        archive,
        index,
        merged
    );
    const combined = mergeCandidates([...merged, ...flexible]);

    return sortCandidates(
        combined.map((candidate) => ({
            ...candidate,
            parserLocation: getParserLocation(candidate.framework),
        }))
    );
};

export const getSelectableCandidates = (
    candidates: ProjectDetectionCandidate[]
): ProjectDetectionCandidate[] =>
    candidates.filter((candidate) => isSelectableCandidate(candidate));
