import type { ArchiveReader } from '../../../archive/archive-reader';
import type { ProjectDetectionCandidate } from '../../../project-types';
import { listAllCandidateImportPaths } from '../group-utils';
import { evidenceFromCode } from '../../detector-utils';
import {
    buildDatabaseGroup,
    buildFullCandidateGroup,
    toDisplayLabel,
} from '../group-utils';

const LARAVEL_MIGRATIONS_PREFIX = 'database/migrations/';

const isLaravelMigrationPath = (relativePath: string): boolean =>
    relativePath.startsWith(LARAVEL_MIGRATIONS_PREFIX) &&
    relativePath.endsWith('.php');

const classifyLaravelMigration = (
    relativePath: string
):
    | { kind: 'root'; path: string }
    | { kind: 'subdir'; subdir: string; path: string } => {
    const afterPrefix = relativePath.slice(LARAVEL_MIGRATIONS_PREFIX.length);
    const slashIndex = afterPrefix.indexOf('/');

    if (slashIndex === -1) {
        return { kind: 'root', path: relativePath };
    }

    const subdir = afterPrefix.slice(0, slashIndex);

    return {
        kind: 'subdir',
        subdir,
        path: relativePath,
    };
};

export const detectLaravelDatabaseGroups = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): Promise<ReturnType<typeof buildDatabaseGroup>[]> => {
    const importPaths = listAllCandidateImportPaths(archive, candidate);
    const migrations = importPaths.filter(isLaravelMigrationPath);

    if (migrations.length === 0) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    const rootMigrations: string[] = [];
    const subdirMigrations = new Map<string, string[]>();

    for (const migrationPath of migrations) {
        const classified = classifyLaravelMigration(migrationPath);

        if (classified.kind === 'root') {
            rootMigrations.push(classified.path);
            continue;
        }

        const existing = subdirMigrations.get(classified.subdir) ?? [];
        existing.push(classified.path);
        subdirMigrations.set(classified.subdir, existing);
    }

    const subdirs = [...subdirMigrations.keys()].sort();

    if (subdirs.length === 0) {
        return [
            buildDatabaseGroup({
                candidate,
                groupKey: 'main',
                label: 'Main',
                primaryLogicalPaths: rootMigrations,
                evidence: [evidenceFromCode('laravel_migrations')],
                isRecommended: true,
                summaryPath: 'database/migrations',
            }),
        ];
    }

    if (subdirs.length === 1 && rootMigrations.length === 0) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    const groups = [];

    if (rootMigrations.length > 0) {
        groups.push(
            buildDatabaseGroup({
                candidate,
                groupKey: 'main',
                label: 'Main',
                primaryLogicalPaths: rootMigrations,
                evidence: [evidenceFromCode('laravel_migrations')],
                isRecommended: true,
                summaryPath: 'database/migrations',
            })
        );
    }

    for (const subdir of subdirs) {
        const primaryPaths = subdirMigrations.get(subdir) ?? [];

        groups.push(
            buildDatabaseGroup({
                candidate,
                groupKey: subdir,
                label: toDisplayLabel(subdir),
                primaryLogicalPaths: primaryPaths,
                supportingLogicalPaths: rootMigrations,
                evidence: [evidenceFromCode('laravel_migrations')],
                summaryPath: `database/migrations/${subdir}`,
            })
        );
    }

    if (groups.length <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    return groups;
};
