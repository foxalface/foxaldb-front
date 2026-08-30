import {
    ArchiveDepthExceededError,
    ArchiveInvalidPathError,
    ArchiveInvalidUtf8PathError,
    ArchivePathTooLongError,
    ArchivePathTraversalError,
} from './archive-errors';
import {
    MAX_ARCHIVE_DIRECTORY_DEPTH,
    MAX_ARCHIVE_PATH_LENGTH,
} from './archive-limits';

const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[a-zA-Z]:[\\/]/;

const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04] as const;
const ZIP_EMPTY_MAGIC_BYTES = [0x50, 0x4b, 0x05, 0x06] as const;
const ZIP_SPANNED_MAGIC_BYTES = [0x50, 0x4b, 0x07, 0x08] as const;

export const isZipArchiveBytes = (bytes: Uint8Array): boolean => {
    if (bytes.length < 4) {
        return false;
    }

    const matches = (signature: readonly number[]): boolean =>
        signature.every((value, index) => bytes[index] === value);

    return (
        matches(ZIP_MAGIC_BYTES) ||
        matches(ZIP_EMPTY_MAGIC_BYTES) ||
        matches(ZIP_SPANNED_MAGIC_BYTES)
    );
};

const hasLoneSurrogate = (value: string): boolean => {
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);

        if (code >= 0xd800 && code <= 0xdbff) {
            const next = value.charCodeAt(index + 1);
            if (next < 0xdc00 || next > 0xdfff) {
                return true;
            }
            index += 1;
            continue;
        }

        if (code >= 0xdc00 && code <= 0xdfff) {
            return true;
        }
    }

    return false;
};

export const assertValidUtf8Path = (path: string): void => {
    if (path.includes('\0')) {
        throw new ArchiveInvalidUtf8PathError(path);
    }

    if (hasLoneSurrogate(path)) {
        throw new ArchiveInvalidUtf8PathError(path);
    }
};

export const getPathDepth = (path: string): number => {
    return path
        .split('/')
        .filter((segment) => segment.length > 0 && segment !== '.').length;
};

export const assertPathDepthWithinLimit = (
    path: string,
    maxDepth: number = MAX_ARCHIVE_DIRECTORY_DEPTH
): void => {
    const depth = getPathDepth(path);

    if (depth > maxDepth) {
        throw new ArchiveDepthExceededError(path, depth, maxDepth);
    }
};

export const assertPathLengthWithinLimit = (
    path: string,
    maxLength: number = MAX_ARCHIVE_PATH_LENGTH
): void => {
    if (path.length > maxLength) {
        throw new ArchivePathTooLongError(path, path.length, maxLength);
    }
};

/**
 * Normalizes an archive entry path for indexing and lookup.
 * Throws typed errors for invalid paths.
 */
export const normalizeArchivePath = (rawPath: string): string => {
    if (rawPath.length === 0) {
        throw new ArchiveInvalidPathError(rawPath, 'path must not be empty');
    }

    assertValidUtf8Path(rawPath);

    const path = rawPath.replace(/\\/g, '/');

    if (
        path.startsWith('/') ||
        WINDOWS_ABSOLUTE_PATH_PATTERN.test(path) ||
        path.startsWith('//')
    ) {
        throw new ArchiveInvalidPathError(
            rawPath,
            'absolute paths are not allowed'
        );
    }

    const segments: string[] = [];

    for (const segment of path.split('/')) {
        if (segment.length === 0 || segment === '.') {
            continue;
        }

        if (segment === '..') {
            throw new ArchivePathTraversalError(rawPath);
        }

        segments.push(segment);
    }

    const isDirectory = path.endsWith('/');
    const normalized = segments.join('/');

    if (normalized.length === 0) {
        throw new ArchiveInvalidPathError(rawPath, 'path must not be empty');
    }

    const normalizedPath = isDirectory ? `${normalized}/` : normalized;

    assertPathLengthWithinLimit(normalizedPath);
    assertPathDepthWithinLimit(normalizedPath);

    return normalizedPath;
};

export const getPathExtension = (path: string): string => {
    if (path.endsWith('/')) {
        return '';
    }

    const lastSlashIndex = path.lastIndexOf('/');
    const fileName =
        lastSlashIndex === -1 ? path : path.slice(lastSlashIndex + 1);
    const dotIndex = fileName.lastIndexOf('.');

    if (dotIndex <= 0) {
        return '';
    }

    return fileName.slice(dotIndex + 1).toLowerCase();
};
