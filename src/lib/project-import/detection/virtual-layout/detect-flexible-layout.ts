import type { ArchiveReader } from '../../archive/archive-reader';
import type {
    ProjectDetectionCandidate,
    ProjectFramework,
    ProjectPathMapping,
} from '../../project-types';
import {
    basename,
    getPathsUnderRoot,
    getRootPathFromFile,
    normalizeRootPath,
    type ArchivePathIndex,
} from '../archive-paths';
import {
    isDjangoMigrationContent,
    isDjangoMigrationFileName,
    isDrizzleConfigBasename,
    isEfModelSnapshotContent,
    isLaravelMigrationContent,
    isPrismaSchemaContent,
    isRailsSchemaContent,
    parseDrizzleJournalContent,
} from '../content-signatures';
import { evidenceFromCode } from '../detector-utils';
import { isUnclaimedEfSnapshot } from '../ef-project-scope';
import { createCandidate } from '../detector-utils';
import {
    assertNoLogicalPathCollisions,
    buildLogicalLaravelMigrationPath,
    findCommonRootPath,
    isCanonicalDjangoMigrationPath,
    isCanonicalDrizzleJournalPath,
    isCanonicalDrizzleSqlPath,
    isCanonicalEfSnapshotPath,
    isCanonicalLaravelMigrationPath,
    isCanonicalPrismaSchemaPath,
    isCanonicalRailsSchemaPath,
    parseDjangoDependencyAppLabels,
    resolveFlexibleLaravelRootPath,
    toPathRelativeToRoot,
} from './virtual-layout-utils';

const SYNTHETIC_DJANGO_APP = 'imported';

const hasCanonicalSelectableCandidate = (
    candidates: ProjectDetectionCandidate[],
    framework: ProjectFramework,
    rootPath: string
): boolean =>
    candidates.some(
        (candidate) =>
            candidate.framework === framework &&
            candidate.rootPath === normalizeRootPath(rootPath) &&
            !candidate.usesVirtualLayout &&
            (candidate.confidence === 'high' ||
                candidate.confidence === 'medium')
    );

const buildVirtualCandidate = (
    framework: ProjectFramework,
    rootPath: string,
    evidence: ProjectDetectionCandidate['evidence'],
    relevantFiles: string[],
    pathMappings: ProjectPathMapping[]
): ProjectDetectionCandidate | null => {
    if (!assertNoLogicalPathCollisions(pathMappings)) {
        return null;
    }

    const candidate = createCandidate(
        framework,
        rootPath,
        evidence,
        relevantFiles
    );

    if (!candidate) {
        return null;
    }

    return {
        ...candidate,
        usesVirtualLayout: true,
        pathMappings,
    };
};

const detectFlexibleLaravel = async (
    archive: ArchiveReader,
    index: ArchivePathIndex,
    existingCandidates: ProjectDetectionCandidate[]
): Promise<ProjectDetectionCandidate[]> => {
    const migrationPaths = index.filePaths.filter(
        (filePath) =>
            filePath.endsWith('.php') &&
            !isCanonicalLaravelMigrationPath(filePath)
    );

    if (migrationPaths.length === 0) {
        return [];
    }

    const verified: string[] = [];

    for (const filePath of migrationPaths) {
        const content = await archive.readText(filePath);

        if (isLaravelMigrationContent(content)) {
            verified.push(filePath);
        }
    }

    if (verified.length === 0) {
        return [];
    }

    const rootPath = resolveFlexibleLaravelRootPath(verified);

    if (
        hasCanonicalSelectableCandidate(existingCandidates, 'laravel', rootPath)
    ) {
        return [];
    }

    const pathMappings = verified.map((physicalPath) => ({
        physicalPath,
        logicalPath: buildLogicalLaravelMigrationPath(physicalPath, rootPath),
    }));

    return [
        buildVirtualCandidate(
            'laravel',
            rootPath,
            [evidenceFromCode('laravel_source_signature', verified[0])],
            verified,
            pathMappings
        ),
    ].filter(
        (candidate): candidate is ProjectDetectionCandidate =>
            candidate !== null
    );
};

const detectFlexiblePrisma = async (
    archive: ArchiveReader,
    index: ArchivePathIndex,
    existingCandidates: ProjectDetectionCandidate[]
): Promise<ProjectDetectionCandidate[]> => {
    const schemaPaths = index.filePaths.filter(
        (filePath) =>
            basename(filePath) === 'schema.prisma' &&
            !isCanonicalPrismaSchemaPath(filePath)
    );

    const verified: string[] = [];

    for (const filePath of schemaPaths) {
        const content = await archive.readText(filePath);

        if (isPrismaSchemaContent(content)) {
            verified.push(filePath);
        }
    }

    if (verified.length !== 1) {
        return [];
    }

    const physicalPath = verified[0];
    const rootPath = normalizeRootPath(getRootPathFromFile(physicalPath));

    if (
        hasCanonicalSelectableCandidate(existingCandidates, 'prisma', rootPath)
    ) {
        return [];
    }

    const pathMappings = [
        {
            physicalPath,
            logicalPath: 'prisma/schema.prisma',
        },
    ];

    return [
        buildVirtualCandidate(
            'prisma',
            rootPath,
            [evidenceFromCode('prisma_schema_signature', physicalPath)],
            [physicalPath],
            pathMappings
        ),
    ].filter(
        (candidate): candidate is ProjectDetectionCandidate =>
            candidate !== null
    );
};

const detectFlexibleRails = async (
    archive: ArchiveReader,
    index: ArchivePathIndex,
    existingCandidates: ProjectDetectionCandidate[]
): Promise<ProjectDetectionCandidate[]> => {
    const schemaPaths = index.filePaths.filter(
        (filePath) =>
            basename(filePath) === 'schema.rb' &&
            !isCanonicalRailsSchemaPath(filePath)
    );

    const verified: string[] = [];

    for (const filePath of schemaPaths) {
        const content = await archive.readText(filePath);

        if (isRailsSchemaContent(content)) {
            verified.push(filePath);
        }
    }

    if (verified.length !== 1) {
        return [];
    }

    const physicalPath = verified[0];
    const rootPath = normalizeRootPath(getRootPathFromFile(physicalPath));

    if (
        hasCanonicalSelectableCandidate(existingCandidates, 'rails', rootPath)
    ) {
        return [];
    }

    const pathMappings = [
        {
            physicalPath,
            logicalPath: 'db/schema.rb',
        },
    ];

    return [
        buildVirtualCandidate(
            'rails',
            rootPath,
            [evidenceFromCode('rails_schema_signature', physicalPath)],
            [physicalPath],
            pathMappings
        ),
    ].filter(
        (candidate): candidate is ProjectDetectionCandidate =>
            candidate !== null
    );
};

const detectFlexibleEfCore = async (
    archive: ArchiveReader,
    index: ArchivePathIndex,
    existingCandidates: ProjectDetectionCandidate[]
): Promise<ProjectDetectionCandidate[]> => {
    const snapshotPaths = index.filePaths.filter(
        (filePath) =>
            filePath.endsWith('ModelSnapshot.cs') &&
            !isCanonicalEfSnapshotPath(filePath)
    );

    const verifiedSnapshots: string[] = [];
    const claimedEfProjectRoots = new Set(
        existingCandidates
            .filter(
                (candidate) =>
                    candidate.framework === 'entity_framework_core' &&
                    !candidate.usesVirtualLayout
            )
            .map((candidate) => normalizeRootPath(candidate.rootPath))
    );

    for (const filePath of snapshotPaths) {
        if (!isUnclaimedEfSnapshot(filePath, index, claimedEfProjectRoots)) {
            continue;
        }

        const content = await archive.readText(filePath);

        if (isEfModelSnapshotContent(content)) {
            verifiedSnapshots.push(filePath);
        }
    }

    if (verifiedSnapshots.length !== 1) {
        return [];
    }

    const snapshotPath = verifiedSnapshots[0];
    const snapshotRoot = findCommonRootPath([snapshotPath]);
    const scopePaths = getPathsUnderRoot(index.filePaths, snapshotRoot);
    const csprojPaths = scopePaths.filter((filePath) =>
        filePath.endsWith('.csproj')
    );

    const rootPath = normalizeRootPath(snapshotRoot);

    if (
        hasCanonicalSelectableCandidate(
            existingCandidates,
            'entity_framework_core',
            rootPath
        )
    ) {
        return [];
    }

    const pathMappings: ProjectPathMapping[] = [
        {
            physicalPath: snapshotPath,
            logicalPath: `Migrations/${basename(snapshotPath)}`,
        },
    ];

    const relevantFiles = [snapshotPath];

    for (const csprojPath of csprojPaths) {
        const relative = toPathRelativeToRoot(rootPath, csprojPath);
        pathMappings.push({
            physicalPath: csprojPath,
            logicalPath: relative,
        });
        relevantFiles.push(csprojPath);
    }

    return [
        buildVirtualCandidate(
            'entity_framework_core',
            rootPath,
            [evidenceFromCode('ef_snapshot_signature', snapshotPath)],
            relevantFiles,
            pathMappings
        ),
    ].filter(
        (candidate): candidate is ProjectDetectionCandidate =>
            candidate !== null
    );
};

interface DjangoFlexibleFile {
    physicalPath: string;
    content: string;
    inferredApp: string | null;
}

const inferDjangoAppLabel = (
    physicalPath: string,
    rootPath: string,
    content: string
): string | null => {
    const relative = toPathRelativeToRoot(rootPath, physicalPath);
    const segments = relative.split('/').filter(Boolean);

    if (
        segments.length >= 2 &&
        segments[segments.length - 2] === 'migrations'
    ) {
        const appSegment = segments[segments.length - 3];

        return appSegment ?? SYNTHETIC_DJANGO_APP;
    }

    if (segments.length >= 2 && segments[0] === 'migrations') {
        return SYNTHETIC_DJANGO_APP;
    }

    if (segments.length === 1) {
        const dependencyApps = parseDjangoDependencyAppLabels(content);

        if (dependencyApps.length === 1) {
            return dependencyApps[0];
        }

        return SYNTHETIC_DJANGO_APP;
    }

    if (segments.length >= 2) {
        return segments[0];
    }

    return null;
};

const detectFlexibleDjango = async (
    archive: ArchiveReader,
    index: ArchivePathIndex,
    existingCandidates: ProjectDetectionCandidate[]
): Promise<ProjectDetectionCandidate[]> => {
    const candidatePaths = index.filePaths.filter((filePath) => {
        const fileName = basename(filePath);

        return (
            filePath.endsWith('.py') &&
            isDjangoMigrationFileName(fileName) &&
            !isCanonicalDjangoMigrationPath(filePath)
        );
    });

    if (candidatePaths.length === 0) {
        return [];
    }

    const verified: DjangoFlexibleFile[] = [];

    for (const physicalPath of candidatePaths) {
        const content = await archive.readText(physicalPath);

        if (!isDjangoMigrationContent(content)) {
            continue;
        }

        verified.push({
            physicalPath,
            content,
            inferredApp: null,
        });
    }

    if (verified.length === 0) {
        return [];
    }

    const rootPath = normalizeRootPath(
        findCommonRootPath(verified.map((file) => file.physicalPath))
    );

    if (
        hasCanonicalSelectableCandidate(existingCandidates, 'django', rootPath)
    ) {
        return [];
    }

    const filesWithApps = verified.map((file) => ({
        ...file,
        inferredApp: inferDjangoAppLabel(
            file.physicalPath,
            rootPath,
            file.content
        ),
    }));

    if (filesWithApps.some((file) => file.inferredApp === null)) {
        return [];
    }

    const appLabels = new Set(
        filesWithApps.map((file) => file.inferredApp as string)
    );

    if (appLabels.size > 1) {
        return [];
    }

    const pathMappings: ProjectPathMapping[] = filesWithApps.map((file) => {
        const fileName = basename(file.physicalPath);

        return {
            physicalPath: file.physicalPath,
            logicalPath: `${file.inferredApp}/migrations/${fileName}`,
        };
    });

    if (!assertNoLogicalPathCollisions(pathMappings)) {
        return [];
    }

    return [
        buildVirtualCandidate(
            'django',
            rootPath,
            [
                evidenceFromCode(
                    'django_migration_signature',
                    filesWithApps[0].physicalPath
                ),
            ],
            filesWithApps.map((file) => file.physicalPath),
            pathMappings
        ),
    ].filter(
        (candidate): candidate is ProjectDetectionCandidate =>
            candidate !== null
    );
};

const detectFlexibleDrizzle = async (
    archive: ArchiveReader,
    index: ArchivePathIndex,
    existingCandidates: ProjectDetectionCandidate[]
): Promise<ProjectDetectionCandidate[]> => {
    const journalPaths = index.filePaths.filter(
        (filePath) =>
            basename(filePath) === '_journal.json' &&
            !isCanonicalDrizzleJournalPath(filePath)
    );

    const sqlPaths = index.filePaths.filter(
        (filePath) =>
            filePath.endsWith('.sql') && !isCanonicalDrizzleSqlPath(filePath)
    );

    const configPaths = index.filePaths.filter((filePath) =>
        isDrizzleConfigBasename(basename(filePath))
    );

    if (
        journalPaths.length === 0 &&
        sqlPaths.length === 0 &&
        configPaths.length === 0
    ) {
        return [];
    }

    let journalPath: string | null = null;
    let journal = null;

    for (const candidatePath of journalPaths) {
        const parsed = parseDrizzleJournalContent(
            await archive.readText(candidatePath)
        );

        if (parsed) {
            if (journalPath !== null) {
                return [];
            }

            journalPath = candidatePath;
            journal = parsed;
        }
    }

    if (journalPath === null || journal === null) {
        if (sqlPaths.length > 0 && configPaths.length === 0) {
            return [];
        }

        if (configPaths.length > 0 && sqlPaths.length === 0) {
            return [];
        }

        return [];
    }

    const scopePaths = [...sqlPaths, journalPath, ...configPaths];
    const rootPath = normalizeRootPath(findCommonRootPath(scopePaths));

    if (
        hasCanonicalSelectableCandidate(existingCandidates, 'drizzle', rootPath)
    ) {
        return [];
    }

    const pathMappings: ProjectPathMapping[] = [
        {
            physicalPath: journalPath,
            logicalPath: 'drizzle/meta/_journal.json',
        },
    ];

    const relevantFiles = [journalPath];
    const journalTags = new Set(journal.entries.map((entry) => entry.tag));

    for (const sqlPath of sqlPaths) {
        const fileName = basename(sqlPath);
        const tag = fileName.replace(/\.sql$/, '');

        if (!journalTags.has(tag)) {
            return [];
        }

        pathMappings.push({
            physicalPath: sqlPath,
            logicalPath: `drizzle/${fileName}`,
        });
        relevantFiles.push(sqlPath);
    }

    for (const configPath of configPaths) {
        const relative = toPathRelativeToRoot(rootPath, configPath);
        pathMappings.push({
            physicalPath: configPath,
            logicalPath: relative,
        });
        relevantFiles.push(configPath);
    }

    if (!assertNoLogicalPathCollisions(pathMappings)) {
        return [];
    }

    const evidence = [
        evidenceFromCode('drizzle_journal_signature', journalPath),
    ];

    if (configPaths.length > 0) {
        evidence.push(evidenceFromCode('drizzle_config', configPaths[0]));
    }

    if (sqlPaths.length > 0) {
        evidence.push(evidenceFromCode('drizzle_sql', sqlPaths[0]));
    }

    return [
        buildVirtualCandidate(
            'drizzle',
            rootPath,
            evidence,
            relevantFiles,
            pathMappings
        ),
    ].filter(
        (candidate): candidate is ProjectDetectionCandidate =>
            candidate !== null
    );
};

export const detectFlexibleLayoutCandidates = async (
    archive: ArchiveReader,
    index: ArchivePathIndex,
    existingCandidates: ProjectDetectionCandidate[]
): Promise<ProjectDetectionCandidate[]> => {
    const detectors = [
        detectFlexibleLaravel,
        detectFlexiblePrisma,
        detectFlexibleRails,
        detectFlexibleEfCore,
        detectFlexibleDjango,
        detectFlexibleDrizzle,
    ] as const;

    const detected: ProjectDetectionCandidate[] = [];

    for (const detector of detectors) {
        detected.push(
            ...(await detector(archive, index, [
                ...existingCandidates,
                ...detected,
            ]))
        );
    }

    return detected;
};
