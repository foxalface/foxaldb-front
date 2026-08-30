import {
    getRootDepth,
    getRootPathFromFile,
    normalizeRootPath,
    type ArchivePathIndex,
} from './archive-paths';

const ANCHOR_SUFFIXES = [
    'artisan',
    'prisma/schema.prisma',
    'drizzle.config.ts',
    'drizzle.config.js',
    'drizzle.config.mjs',
    'drizzle.config.cjs',
    'db/schema.rb',
    'manage.py',
] as const;

const ANCHOR_BASENAMES = [
    'composer.json',
    'package.json',
    'Gemfile',
    'pyproject.toml',
    'requirements.txt',
] as const;

const ANCHOR_DIRECTORY_MARKERS = [
    'database/migrations',
    'prisma/migrations',
    'drizzle/meta',
    'db/migrate',
    'Migrations',
] as const;

const collectRootFromAnchorFile = (
    filePath: string,
    suffix: string
): string | null => {
    if (!filePath.endsWith(suffix)) {
        return null;
    }

    const rootPath = filePath.slice(0, filePath.length - suffix.length);
    return normalizeRootPath(rootPath.replace(/\/$/, ''));
};

const collectRootFromDirectoryMarker = (
    filePath: string,
    marker: string
): string | null => {
    const nestedMarker = `/${marker}/`;
    const nestedMarkerIndex = filePath.indexOf(nestedMarker);
    if (nestedMarkerIndex !== -1) {
        return normalizeRootPath(filePath.slice(0, nestedMarkerIndex));
    }

    if (filePath.startsWith(`${marker}/`)) {
        return '';
    }

    return null;
};

const collectRootFromBasename = (filePath: string): string | null => {
    const fileName = filePath.slice(filePath.lastIndexOf('/') + 1);
    if (
        !ANCHOR_BASENAMES.includes(
            fileName as (typeof ANCHOR_BASENAMES)[number]
        )
    ) {
        return null;
    }

    return normalizeRootPath(getRootPathFromFile(filePath));
};

const collectRootFromModelSnapshot = (filePath: string): string | null => {
    const fileName = filePath.slice(filePath.lastIndexOf('/') + 1);
    if (!fileName.endsWith('ModelSnapshot.cs')) {
        return null;
    }

    return normalizeRootPath(getRootPathFromFile(filePath));
};

export const discoverProjectRootCandidates = (
    index: ArchivePathIndex
): string[] => {
    const roots = new Set<string>();

    for (const filePath of index.filePaths) {
        for (const suffix of ANCHOR_SUFFIXES) {
            const root = collectRootFromAnchorFile(filePath, suffix);
            if (root !== null) {
                roots.add(root);
            }
        }

        for (const marker of ANCHOR_DIRECTORY_MARKERS) {
            const root = collectRootFromDirectoryMarker(filePath, marker);
            if (root !== null) {
                roots.add(root);
            }
        }

        const basenameRoot = collectRootFromBasename(filePath);
        if (basenameRoot !== null) {
            roots.add(basenameRoot);
        }

        const snapshotRoot = collectRootFromModelSnapshot(filePath);
        if (snapshotRoot !== null) {
            roots.add(snapshotRoot);
        }
    }

    return Array.from(roots).sort((left, right) => {
        const depthDelta = getRootDepth(left) - getRootDepth(right);
        if (depthDelta !== 0) {
            return depthDelta;
        }

        return left.localeCompare(right);
    });
};
