import { Unzip, UnzipInflate, unzipSync } from 'fflate';
import type { ArchiveEntry } from './archive-entry';
import {
    ArchiveClosedError,
    ArchiveCorruptedError,
    ArchiveDirectoryReadError,
    ArchiveDuplicatePathError,
    ArchiveEntryNotFoundError,
    ArchiveEntryTooLargeError,
    ArchiveError,
    ArchiveExtractionTooLargeError,
    ArchiveInvalidUtf8ContentError,
    ArchiveTooLargeError,
    ArchiveTooManyFilesError,
    ArchiveUnsupportedFormatError,
} from './archive-errors';
import type { ArchiveLimits } from './archive-limits';
import {
    getPathExtension,
    isZipArchiveBytes,
    normalizeArchivePath,
} from './archive-utils';

interface IndexedArchiveEntry extends ArchiveEntry {
    readonly originalPath: string;
}

const collectArchiveIndex = (
    archiveBytes: Uint8Array,
    limits: ArchiveLimits
): {
    entries: IndexedArchiveEntry[];
    totalUncompressedBytes: number;
} => {
    const entries: IndexedArchiveEntry[] = [];
    const normalizedPaths = new Map<string, string>();
    let totalUncompressedBytes = 0;
    let parseError: unknown;

    const unzip = new Unzip();
    unzip.register(UnzipInflate);

    unzip.onfile = (file) => {
        if (parseError !== undefined) {
            return;
        }

        try {
            if (entries.length >= limits.maxEntries) {
                throw new ArchiveTooManyFilesError(
                    entries.length + 1,
                    limits.maxEntries
                );
            }

            const originalPath = file.name;
            const normalizedPath = normalizeArchivePath(originalPath, limits);
            const isDirectory = normalizedPath.endsWith('/');
            const sizeCompressed = file.size ?? 0;
            const sizeUncompressed = file.originalSize ?? 0;

            const duplicateOf = normalizedPaths.get(normalizedPath);
            if (duplicateOf !== undefined) {
                throw new ArchiveDuplicatePathError(
                    normalizedPath,
                    duplicateOf
                );
            }

            normalizedPaths.set(normalizedPath, originalPath);

            if (!isDirectory) {
                if (sizeUncompressed > limits.maxEntryBytes) {
                    throw new ArchiveEntryTooLargeError(
                        normalizedPath,
                        sizeUncompressed,
                        limits.maxEntryBytes
                    );
                }

                totalUncompressedBytes += sizeUncompressed;

                if (totalUncompressedBytes > limits.uncompressedMaxBytes) {
                    throw new ArchiveExtractionTooLargeError(
                        totalUncompressedBytes,
                        limits.uncompressedMaxBytes
                    );
                }
            }

            entries.push({
                normalizedPath,
                originalPath,
                extension: getPathExtension(normalizedPath),
                sizeCompressed,
                sizeUncompressed,
                isDirectory,
            });
        } catch (error) {
            parseError = error;
        }
    };

    try {
        unzip.push(archiveBytes, true);
    } catch (error) {
        throw new ArchiveCorruptedError(
            'Archive is corrupted or could not be read.',
            error
        );
    }

    if (parseError !== undefined) {
        throw parseError;
    }

    entries.sort((left, right) =>
        left.normalizedPath.localeCompare(right.normalizedPath)
    );

    return { entries, totalUncompressedBytes };
};

export class ArchiveReader {
    private archiveBytes: Uint8Array | null;
    private entries: IndexedArchiveEntry[];
    private closed = false;

    private constructor(
        archiveBytes: Uint8Array,
        entries: IndexedArchiveEntry[],
        private readonly limits: ArchiveLimits
    ) {
        this.archiveBytes = archiveBytes;
        this.entries = entries;
    }

    static async open(
        file: File,
        limits: ArchiveLimits
    ): Promise<ArchiveReader> {
        if (file.size > limits.compressedMaxBytes) {
            throw new ArchiveTooLargeError(
                file.size,
                limits.compressedMaxBytes
            );
        }

        const buffer = await file.arrayBuffer();
        const archiveBytes = new Uint8Array(buffer);

        if (archiveBytes.length > limits.compressedMaxBytes) {
            throw new ArchiveTooLargeError(
                archiveBytes.length,
                limits.compressedMaxBytes
            );
        }

        if (!isZipArchiveBytes(archiveBytes)) {
            throw new ArchiveUnsupportedFormatError();
        }

        let index: ReturnType<typeof collectArchiveIndex>;
        try {
            index = collectArchiveIndex(archiveBytes, limits);
        } catch (error) {
            if (error instanceof ArchiveError) {
                throw error;
            }

            throw new ArchiveCorruptedError(
                'Archive is corrupted or could not be read.',
                error
            );
        }

        if (index.entries.length === 0) {
            throw new ArchiveCorruptedError('Archive contains no entries.');
        }

        return new ArchiveReader(archiveBytes, index.entries, limits);
    }

    listEntries(): readonly ArchiveEntry[] {
        this.assertOpen();
        return this.entries;
    }

    has(path: string): boolean {
        this.assertOpen();
        const normalizedPath = normalizeArchivePath(path, this.limits);
        return this.entries.some(
            (entry) => entry.normalizedPath === normalizedPath
        );
    }

    readBytes(path: string): Uint8Array {
        this.assertOpen();

        const normalizedPath = normalizeArchivePath(path, this.limits);
        const entry = this.getEntry(normalizedPath);

        if (entry.isDirectory) {
            throw new ArchiveDirectoryReadError(normalizedPath);
        }

        const archiveBytes = this.archiveBytes;
        if (archiveBytes === null) {
            throw new ArchiveClosedError();
        }

        let extracted: Record<string, Uint8Array>;
        try {
            extracted = unzipSync(archiveBytes, {
                filter: (file) =>
                    normalizeArchivePath(file.name, this.limits) ===
                    normalizedPath,
            });
        } catch (error) {
            throw new ArchiveCorruptedError(
                `Failed to read archive entry "${normalizedPath}".`,
                error
            );
        }

        const bytes =
            extracted[entry.originalPath] ??
            extracted[normalizedPath] ??
            Object.values(extracted)[0];

        if (bytes === undefined) {
            throw new ArchiveEntryNotFoundError(normalizedPath);
        }

        if (bytes.length > this.limits.maxEntryBytes) {
            throw new ArchiveEntryTooLargeError(
                normalizedPath,
                bytes.length,
                this.limits.maxEntryBytes
            );
        }

        return bytes;
    }

    readText(path: string): string {
        const bytes = this.readBytes(path);

        try {
            return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        } catch {
            throw new ArchiveInvalidUtf8ContentError(
                normalizeArchivePath(path, this.limits)
            );
        }
    }

    close(): void {
        this.closed = true;
        this.archiveBytes = null;
        this.entries = [];
    }

    private assertOpen(): void {
        if (this.closed) {
            throw new ArchiveClosedError();
        }
    }

    private getEntry(normalizedPath: string): IndexedArchiveEntry {
        const entry = this.entries.find(
            (candidate) => candidate.normalizedPath === normalizedPath
        );

        if (entry === undefined) {
            throw new ArchiveEntryNotFoundError(normalizedPath);
        }

        return entry;
    }
}
