import type { ArchiveReader } from '../../../archive/archive-reader';
import type { ProjectDetectionCandidate } from '../../../project-types';
import { getRootPathFromFile } from '../../archive-paths';
import { evidenceFromCode } from '../../detector-utils';
import {
    buildDatabaseGroup,
    buildFullCandidateGroup,
    listAllCandidateImportPaths,
    toDisplayLabel,
} from '../group-utils';

const DRIZZLE_CONFIG_PATTERN = /(^|\/)drizzle\.config\.(ts|js|mjs|cjs)$/;

const findDrizzleConfigPaths = (importPaths: string[]): string[] =>
    importPaths.filter((relativePath) =>
        DRIZZLE_CONFIG_PATTERN.test(relativePath)
    );

const collectPathsForConfigRoot = (
    importPaths: string[],
    configRoot: string
): string[] =>
    importPaths.filter((relativePath) => {
        if (configRoot.length === 0) {
            return (
                relativePath.startsWith('drizzle/') ||
                DRIZZLE_CONFIG_PATTERN.test(relativePath)
            );
        }

        return (
            relativePath.startsWith(`${configRoot}/`) ||
            relativePath === configRoot
        );
    });

export const detectDrizzleDatabaseGroups = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): Promise<ReturnType<typeof buildDatabaseGroup>[]> => {
    const importPaths = listAllCandidateImportPaths(archive, candidate);
    const configPaths = findDrizzleConfigPaths(importPaths);

    if (configPaths.length <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    const configRoots = [
        ...new Set(
            configPaths.map((configPath) => getRootPathFromFile(configPath))
        ),
    ].sort();

    if (configRoots.length <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    return configRoots.map((configRoot) => {
        const configPath =
            configPaths.find(
                (path) => getRootPathFromFile(path) === configRoot
            ) ?? configPaths[0];
        const primaryPaths = collectPathsForConfigRoot(importPaths, configRoot);
        const labelSegment =
            configRoot.split('/').filter(Boolean).pop() ?? 'drizzle';

        return buildDatabaseGroup({
            candidate,
            groupKey: configRoot || 'drizzle',
            label: toDisplayLabel(labelSegment),
            primaryLogicalPaths: primaryPaths,
            evidence: [evidenceFromCode('drizzle_config', configPath)],
            summaryPath: configRoot || configPath,
        });
    });
};
