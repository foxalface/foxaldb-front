import type { ProjectDetectionCandidate } from '../../project-types';
import { joinArchivePath } from '../archive-paths';
import {
    createCandidate,
    evidenceFromCode,
    listPathsMatching,
    readTextIfExists,
    containsDependency,
    type ProjectDetector,
} from '../detector-utils';

const PRISMA_PACKAGE_PATTERNS = [/"@prisma\/client"/i, /"prisma"\s*:/i];

export const detectPrismaProject: ProjectDetector = async (
    archive,
    index,
    rootPath
) => {
    const evidence: ProjectDetectionCandidate['evidence'] = [];
    const relevantFiles: string[] = [];

    const schemaPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.endsWith('/prisma/schema.prisma') ||
            matchesPrismaSchemaPath(filePath, rootPath)
    );

    if (schemaPaths.length > 0) {
        evidence.push(evidenceFromCode('prisma_schema', schemaPaths[0]));
        relevantFiles.push(...schemaPaths);
    }

    const packagePath = joinArchivePath(rootPath, 'package.json');
    const packageContent = await readTextIfExists(archive, packagePath);
    if (
        packageContent &&
        containsDependency(packageContent, PRISMA_PACKAGE_PATTERNS)
    ) {
        evidence.push(evidenceFromCode('prisma_package_json', packagePath));
        relevantFiles.push(packagePath);
    }

    const migrationPaths = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.includes('/prisma/migrations/') &&
            filePath.endsWith('/migration.sql')
    );
    if (migrationPaths.length > 0) {
        evidence.push(evidenceFromCode('prisma_migrations', migrationPaths[0]));
        relevantFiles.push(...migrationPaths);
    }

    const prismaFiles = listPathsMatching(
        index,
        rootPath,
        (filePath) =>
            filePath.includes('/prisma/') && filePath.endsWith('.prisma')
    );
    for (const filePath of prismaFiles) {
        if (!relevantFiles.includes(filePath)) {
            relevantFiles.push(filePath);
        }
    }

    const candidate = createCandidate(
        'prisma',
        rootPath,
        evidence,
        relevantFiles
    );

    return candidate ? [candidate] : [];
};

const matchesPrismaSchemaPath = (
    filePath: string,
    rootPath: string
): boolean => {
    const schemaPath = joinArchivePath(rootPath, 'prisma/schema.prisma');
    return filePath === schemaPath;
};
