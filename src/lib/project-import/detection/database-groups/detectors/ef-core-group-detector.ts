import type { ArchiveReader } from '../../../archive/archive-reader';
import type { ProjectDetectionCandidate } from '../../../project-types';
import { evidenceFromCode } from '../../detector-utils';
import {
    buildDatabaseGroup,
    buildFullCandidateGroup,
    listAllCandidateImportPaths,
    formatGroupLabel,
} from '../group-utils';

const extractDbContextName = (relativePath: string): string => {
    const fileName = relativePath.slice(relativePath.lastIndexOf('/') + 1);

    if (fileName.endsWith('ModelSnapshot.cs')) {
        return fileName.slice(0, -'ModelSnapshot.cs'.length);
    }

    return fileName.replace(/\.cs$/, '');
};

export const detectEfCoreDatabaseGroups = async (
    archive: ArchiveReader,
    candidate: ProjectDetectionCandidate
): Promise<ReturnType<typeof buildDatabaseGroup>[]> => {
    const importPaths = listAllCandidateImportPaths(archive, candidate);
    const snapshotPaths = importPaths.filter((relativePath) =>
        relativePath.endsWith('ModelSnapshot.cs')
    );

    if (snapshotPaths.length <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    const snapshotsByContext = new Map<string, string[]>();

    for (const snapshotPath of snapshotPaths) {
        const contextName = extractDbContextName(snapshotPath);
        const existing = snapshotsByContext.get(contextName) ?? [];
        existing.push(snapshotPath);
        snapshotsByContext.set(contextName, existing);
    }

    for (const paths of snapshotsByContext.values()) {
        if (paths.length > 1) {
            return [buildFullCandidateGroup(archive, candidate)];
        }
    }

    if (snapshotsByContext.size <= 1) {
        return [buildFullCandidateGroup(archive, candidate)];
    }

    const sortedContexts = [...snapshotsByContext.entries()].sort(
        ([left], [right]) => left.localeCompare(right)
    );
    const hasAppContext = sortedContexts.some(([contextName]) =>
        contextName.toLowerCase().includes('app')
    );

    return sortedContexts.map(([contextName, paths], index) => {
        const snapshotPath = paths[0];
        const parentDir = snapshotPath.includes('/')
            ? snapshotPath.slice(0, snapshotPath.lastIndexOf('/'))
            : 'Migrations';
        const isRecommended =
            hasAppContext &&
            contextName.toLowerCase().includes('app') &&
            sortedContexts.findIndex(([name]) =>
                name.toLowerCase().includes('app')
            ) === index;

        return buildDatabaseGroup({
            candidate,
            groupKey: contextName.toLowerCase(),
            label: formatGroupLabel(contextName),
            primaryLogicalPaths: [snapshotPath],
            evidence: [evidenceFromCode('ef_model_snapshot', snapshotPath)],
            isRecommended,
            summaryPath: parentDir,
        });
    });
};
