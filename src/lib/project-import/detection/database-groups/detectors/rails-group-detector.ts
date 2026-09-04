import type { ArchiveReader } from '../../../archive/archive-reader';
import type { ProjectDetectionCandidate } from '../../../project-types';
import {
    buildDatabaseGroup,
    buildFullCandidateGroup,
    listAllCandidateImportPaths,
    toDisplayLabel,
} from '../group-utils';
import { evidenceFromCode } from '../../detector-utils';

const RAILS_SCHEMA_PATTERN = /^(.*\/)?db\/([^/]+_)?schema\.rb$/;
const RAILS_MIGRATE_DIR_PATTERN = /^db\/([^/]+)_migrate\//;

const findRailsSchemaGroups = (
    importPaths: string[]
): Map<string, string[]> => {
    const groups = new Map<string, string[]>();

    for (const relativePath of importPaths) {
        const schemaMatch = relativePath.match(RAILS_SCHEMA_PATTERN);

        if (schemaMatch) {
            const dbKey = schemaMatch[2]
                ? schemaMatch[2].replace(/_$/, '')
                : 'main';
            const existing = groups.get(dbKey) ?? [];
            existing.push(relativePath);
            groups.set(dbKey, existing);
            continue;
        }

        const migrateMatch = relativePath.match(RAILS_MIGRATE_DIR_PATTERN);

        if (migrateMatch) {
            const dbKey = migrateMatch[1];
            const existing = groups.get(dbKey) ?? [];
            existing.push(relativePath);
            groups.set(dbKey, existing);
        }
    }

    return groups;
};

export const detectRailsDatabaseGroups = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): Promise<ReturnType<typeof buildDatabaseGroup>[]> => {
    const importPaths = listAllCandidateImportPaths(archive, candidate);
    const groupedPaths = findRailsSchemaGroups(importPaths);

    if (groupedPaths.size <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    const groups = [...groupedPaths.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([dbKey, paths]) =>
            buildDatabaseGroup({
                candidate,
                groupKey: dbKey,
                label: dbKey === 'main' ? 'Main' : toDisplayLabel(dbKey),
                primaryLogicalPaths: paths,
                evidence: [evidenceFromCode('rails_schema_rb', paths[0])],
                isRecommended: dbKey === 'main',
                summaryPath: paths[0],
            })
        );

    if (groups.length <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    return groups;
};
