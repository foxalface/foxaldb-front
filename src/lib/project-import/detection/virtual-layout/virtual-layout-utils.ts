import type { ProjectPathMapping } from '../../project-types';
import { getRootPathFromFile, normalizeRootPath } from '../archive-paths';

export const isCanonicalLaravelMigrationPath = (filePath: string): boolean =>
    filePath.includes('/database/migrations/') ||
    filePath.startsWith('database/migrations/');

export const isCanonicalPrismaSchemaPath = (filePath: string): boolean =>
    filePath.endsWith('/prisma/schema.prisma') ||
    filePath === 'prisma/schema.prisma';

export const isCanonicalRailsSchemaPath = (filePath: string): boolean =>
    filePath === 'db/schema.rb' || filePath.endsWith('/db/schema.rb');

export const isCanonicalEfSnapshotPath = (filePath: string): boolean => {
    const fileName = filePath.slice(filePath.lastIndexOf('/') + 1);

    if (!fileName.endsWith('ModelSnapshot.cs')) {
        return false;
    }

    const parent = getRootPathFromFile(filePath);
    const parentName = parent.slice(parent.lastIndexOf('/') + 1);

    return parentName.toLowerCase() === 'migrations';
};

export const isCanonicalDjangoMigrationPath = (filePath: string): boolean =>
    filePath.includes('/migrations/') &&
    filePath.endsWith('.py') &&
    !filePath.endsWith('/__init__.py');

export const isCanonicalDrizzleJournalPath = (filePath: string): boolean =>
    filePath === 'drizzle/meta/_journal.json' ||
    filePath.endsWith('/drizzle/meta/_journal.json');

export const isCanonicalDrizzleSqlPath = (filePath: string): boolean => {
    const normalized = filePath.replace(/\\/g, '/');

    return (
        (normalized.startsWith('drizzle/') ||
            normalized.includes('/drizzle/')) &&
        normalized.endsWith('.sql')
    );
};

export const findCommonRootPath = (filePaths: string[]): string => {
    if (filePaths.length === 0) {
        return '';
    }

    const segmentsList = filePaths.map((filePath) =>
        getRootPathFromFile(filePath).split('/').filter(Boolean)
    );

    const minLength = Math.min(
        ...segmentsList.map((segments) => segments.length)
    );
    const common: string[] = [];

    for (let index = 0; index < minLength; index += 1) {
        const segment = segmentsList[0][index];

        if (segmentsList.every((segments) => segments[index] === segment)) {
            common.push(segment);
        } else {
            break;
        }
    }

    return common.join('/');
};

export const toPathRelativeToRoot = (
    rootPath: string,
    filePath: string
): string => {
    const normalizedRoot = normalizeRootPath(rootPath);

    if (normalizedRoot.length === 0) {
        return filePath;
    }

    if (filePath === normalizedRoot) {
        return '';
    }

    if (filePath.startsWith(`${normalizedRoot}/`)) {
        return filePath.slice(normalizedRoot.length + 1);
    }

    return filePath;
};

export const buildLogicalLaravelMigrationPath = (
    physicalPath: string,
    rootPath: string
): string => {
    const relative = toPathRelativeToRoot(rootPath, physicalPath);

    if (relative.startsWith('database/migrations/')) {
        return relative;
    }

    if (relative.startsWith('migrations/')) {
        return `database/${relative}`;
    }

    const fileName = relative.slice(relative.lastIndexOf('/') + 1);
    const parent = relative.includes('/')
        ? relative.slice(0, relative.lastIndexOf('/'))
        : '';

    if (parent.length === 0) {
        return `database/migrations/${fileName}`;
    }

    return `database/migrations/${parent}/${fileName}`;
};

export const resolveFlexibleLaravelRootPath = (
    physicalPaths: string[]
): string => {
    let rootPath = findCommonRootPath(
        physicalPaths.map((physicalPath) => getRootPathFromFile(physicalPath))
    );

    while (rootPath.length > 0) {
        const relativePaths = physicalPaths.map((physicalPath) =>
            toPathRelativeToRoot(rootPath, physicalPath)
        );

        const canLift = relativePaths.every((relativePath) => {
            const segments = relativePath.split('/').filter(Boolean);

            return segments.length <= 1;
        });

        if (!canLift) {
            break;
        }

        const parent = getRootPathFromFile(rootPath);

        if (parent === rootPath) {
            break;
        }

        rootPath = parent;
    }

    return normalizeRootPath(rootPath);
};

export const assertNoLogicalPathCollisions = (
    mappings: ProjectPathMapping[]
): boolean => {
    const logicalToPhysical = new Map<string, string>();

    for (const mapping of mappings) {
        const existing = logicalToPhysical.get(mapping.logicalPath);

        if (existing !== undefined && existing !== mapping.physicalPath) {
            return false;
        }

        logicalToPhysical.set(mapping.logicalPath, mapping.physicalPath);
    }

    return true;
};

export const parseDjangoDependencyAppLabels = (content: string): string[] => {
    const match = content.match(/dependencies\s*=\s*\[/);

    if (!match || match.index === undefined) {
        return [];
    }

    const openIndex = match.index + match[0].length - 1;
    let depth = 0;
    let closeIndex = -1;

    for (let index = openIndex; index < content.length; index += 1) {
        const char = content[index];

        if (char === '[') {
            depth += 1;
        } else if (char === ']') {
            depth -= 1;

            if (depth === 0) {
                closeIndex = index;
                break;
            }
        }
    }

    if (closeIndex < 0) {
        return [];
    }

    const body = content.slice(openIndex + 1, closeIndex);
    const labels: string[] = [];
    const tuplePattern = /\(\s*['"]([^'"]+)['"]\s*,\s*['"][^'"]+['"]\s*\)/g;

    for (const tupleMatch of body.matchAll(tuplePattern)) {
        labels.push(tupleMatch[1]);
    }

    return labels;
};
