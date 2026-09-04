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

const findPrismaSchemaPaths = (importPaths: string[]): string[] =>
    importPaths.filter((relativePath) => relativePath.endsWith('.prisma'));

const schemaPackageRoot = (schemaPath: string): string => {
    const prismaDir = getRootPathFromFile(schemaPath);
    const parent = getRootPathFromFile(prismaDir);

    if (parent.length === 0) {
        return prismaDir;
    }

    return parent;
};

export const detectPrismaDatabaseGroups = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): Promise<ReturnType<typeof buildDatabaseGroup>[]> => {
    const importPaths = listAllCandidateImportPaths(archive, candidate);
    const schemaPaths = findPrismaSchemaPaths(importPaths);

    if (schemaPaths.length <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    const schemasByRoot = new Map<string, string[]>();

    for (const schemaPath of schemaPaths) {
        const packageRoot = schemaPackageRoot(schemaPath);
        const existing = schemasByRoot.get(packageRoot) ?? [];
        existing.push(schemaPath);
        schemasByRoot.set(packageRoot, existing);
    }

    for (const paths of schemasByRoot.values()) {
        if (paths.length > 1) {
            return [buildFullCandidateGroup(archive, candidate)];
        }
    }

    if (schemasByRoot.size <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    return [...schemasByRoot.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([packageRoot, paths]) => {
            const schemaPath = paths[0];
            const labelSegment =
                packageRoot.split('/').filter(Boolean).pop() ?? 'schema';

            return buildDatabaseGroup({
                candidate,
                groupKey: packageRoot || 'schema',
                label: toDisplayLabel(labelSegment),
                primaryLogicalPaths: [schemaPath],
                evidence: [evidenceFromCode('prisma_schema', schemaPath)],
                summaryPath: packageRoot || schemaPath,
            });
        });
};
