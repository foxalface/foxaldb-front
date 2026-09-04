import type { ArchiveReader } from '../../archive/archive-reader';
import type {
    ProjectDatabaseGroup,
    ProjectDatabaseGroupAnalysis,
    ProjectDetectionCandidate,
    ProjectFramework,
} from '../../project-types';
import { detectDjangoDatabaseGroups } from './detectors/django-group-detector';
import { detectDrizzleDatabaseGroups } from './detectors/drizzle-group-detector';
import { detectEfCoreDatabaseGroups } from './detectors/ef-core-group-detector';
import { detectLaravelDatabaseGroups } from './detectors/laravel-group-detector';
import { detectPrismaDatabaseGroups } from './detectors/prisma-group-detector';
import { detectRailsDatabaseGroups } from './detectors/rails-group-detector';
import { buildFullCandidateGroup } from './group-utils';

type DatabaseGroupDetector = (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
) => Promise<ProjectDatabaseGroup[]>;

const GROUP_DETECTORS: Record<ProjectFramework, DatabaseGroupDetector> = {
    laravel: detectLaravelDatabaseGroups,
    entity_framework_core: detectEfCoreDatabaseGroups,
    prisma: detectPrismaDatabaseGroups,
    django: detectDjangoDatabaseGroups,
    rails: detectRailsDatabaseGroups,
    drizzle: detectDrizzleDatabaseGroups,
};

export const detectDatabaseGroups = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): Promise<ProjectDatabaseGroupAnalysis> => {
    const detector = GROUP_DETECTORS[candidate.framework];
    const detectedGroups = await detector(archive, candidate);
    const groups =
        detectedGroups.length > 0
            ? detectedGroups
            : [buildFullCandidateGroup(archive, candidate)];

    if (groups.length === 1) {
        return {
            groups,
            recommendedGroup: groups[0],
            status: 'single',
        };
    }

    const recommendedGroup =
        groups.find((group) => group.isRecommended) ?? null;

    return {
        groups,
        recommendedGroup,
        status: 'multiple',
    };
};

export { getDatabaseGroupKey } from './group-id';
