import type { ArchiveReader } from '../archive/archive-reader';
import type { ArchiveEntry } from '../archive/archive-entry';

export interface ArchivePathIndex {
    filePaths: string[];
    directoryPaths: string[];
    entriesByPath: ReadonlyMap<string, ArchiveEntry>;
}

export const buildArchivePathIndex = (
    archive: ArchiveReader
): ArchivePathIndex => {
    const entries = archive.listEntries();
    const filePaths: string[] = [];
    const directoryPaths: string[] = [];
    const entriesByPath = new Map<string, ArchiveEntry>();

    for (const entry of entries) {
        entriesByPath.set(entry.normalizedPath, entry);

        if (entry.isDirectory) {
            directoryPaths.push(entry.normalizedPath);
        } else {
            filePaths.push(entry.normalizedPath);
        }
    }

    filePaths.sort();
    directoryPaths.sort();

    return { filePaths, directoryPaths, entriesByPath };
};

export const normalizeRootPath = (rootPath: string): string => {
    const trimmed = rootPath.replace(/^\/+|\/+$/g, '');
    return trimmed;
};

export const joinArchivePath = (
    rootPath: string,
    relativePath: string
): string => {
    const normalizedRoot = normalizeRootPath(rootPath);
    const normalizedRelative = relativePath.replace(/^\/+/, '');

    if (normalizedRoot.length === 0) {
        return normalizedRelative;
    }

    return `${normalizedRoot}/${normalizedRelative}`;
};

export const getRootPathFromFile = (filePath: string): string => {
    const lastSlashIndex = filePath.lastIndexOf('/');
    if (lastSlashIndex === -1) {
        return '';
    }

    return filePath.slice(0, lastSlashIndex);
};

export const pathStartsWithRoot = (
    filePath: string,
    rootPath: string
): boolean => {
    const normalizedRoot = normalizeRootPath(rootPath);

    if (normalizedRoot.length === 0) {
        return true;
    }

    return (
        filePath === normalizedRoot || filePath.startsWith(`${normalizedRoot}/`)
    );
};

export const getPathsUnderRoot = (
    filePaths: string[],
    rootPath: string
): string[] =>
    filePaths.filter((filePath) => pathStartsWithRoot(filePath, rootPath));

export const getRootDepth = (rootPath: string): number => {
    const normalized = normalizeRootPath(rootPath);
    if (normalized.length === 0) {
        return 0;
    }

    return normalized.split('/').filter(Boolean).length;
};

export const basename = (filePath: string): string => {
    const lastSlashIndex = filePath.lastIndexOf('/');
    return lastSlashIndex === -1
        ? filePath
        : filePath.slice(lastSlashIndex + 1);
};
