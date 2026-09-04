import type { ArchiveReader } from '../../../archive/archive-reader';
import type { ProjectDetectionCandidate } from '../../../project-types';
import { buildFullCandidateGroup } from '../group-utils';

/**
 * Django database routing cannot be inferred safely without executing Python.
 * Conservative default: one logical schema per project candidate.
 */
export const detectDjangoDatabaseGroups = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): Promise<ReturnType<typeof buildFullCandidateGroup>[]> => [
    buildFullCandidateGroup(archive, candidate),
];
