import type { ArchiveReader } from './archive/archive-reader';
import type { ProjectArchiveAnalysis } from './project-types';
import {
    detectProjectCandidates,
    getSelectableCandidates,
} from './detection/detect-project';

export const analyzeProjectArchive = async (
    archive: ArchiveReader
): Promise<ProjectArchiveAnalysis> => {
    const candidates = await detectProjectCandidates(archive);
    const selectableCandidates = getSelectableCandidates(candidates);

    if (selectableCandidates.length === 0) {
        return {
            candidates,
            recommendedCandidate: null,
            status: 'unsupported',
        };
    }

    if (selectableCandidates.length === 1) {
        return {
            candidates,
            recommendedCandidate: selectableCandidates[0],
            status: 'detected',
        };
    }

    return {
        candidates,
        recommendedCandidate: selectableCandidates[0],
        status: 'ambiguous',
    };
};
