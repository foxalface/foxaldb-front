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
import {
    MAX_ARCHIVE_COMPRESSED_BYTES,
    MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES,
    MAX_ARCHIVE_FILE_COUNT,
    MAX_ARCHIVE_UNCOMPRESSED_BYTES,
} from './archive-limits';
import {
    getPathExtension,
    isZipArchiveBytes,
    normalizeArchivePath,
} from './archive-utils';

interface IndexedArchiveEntry extends ArchiveEntry {
    readonly originalPath: string;
}

const collectArchiveIndex = (
    archiveBytes: Uint8Array
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
            if (entries.length >= MAX_ARCHIVE_FILE_COUNT) {
                throw new ArchiveTooManyFilesError(
                    entries.length + 1,
                    MAX_ARCHIVE_FILE_COUNT
                );
            }

            const originalPath = file.name;
            const normalizedPath = normalizeArchivePath(originalPath);
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
                if (sizeUncompressed > MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES) {
                    throw new ArchiveEntryTooLargeError(
                        normalizedPath,
                        sizeUncompressed,
                        MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES
                    );
                }

                totalUncompressedBytes += sizeUncompressed;

                if (totalUncompressedBytes > MAX_ARCHIVE_UNCOMPRESSED_BYTES) {
                    throw new ArchiveExtractionTooLargeError(
                        totalUncompressedBytes,
                        MAX_ARCHIVE_UNCOMPRESSED_BYTES
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
        entries: IndexedArchiveEntry[]
    ) {
        this.archiveBytes = archiveBytes;
        this.entries = entries;
    }

    static async open(file: File): Promise<ArchiveReader> {
        if (file.size > MAX_ARCHIVE_COMPRESSED_BYTES) {
            throw new ArchiveTooLargeError(
                file.size,
                MAX_ARCHIVE_COMPRESSED_BYTES
            );
        }

        const buffer = await file.arrayBuffer();
        const archiveBytes = new Uint8Array(buffer);

        if (archiveBytes.length > MAX_ARCHIVE_COMPRESSED_BYTES) {
            throw new ArchiveTooLargeError(
                archiveBytes.length,
                MAX_ARCHIVE_COMPRESSED_BYTES
            );
        }

        if (!isZipArchiveBytes(archiveBytes)) {
            throw new ArchiveUnsupportedFormatError();
        }

        let index: ReturnType<typeof collectArchiveIndex>;
        try {
            index = collectArchiveIndex(archiveBytes);
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

        return new ArchiveReader(archiveBytes, index.entries);
    }

    listEntries(): readonly ArchiveEntry[] {
        this.assertOpen();
        return this.entries;
    }

    has(path: string): boolean {
        this.assertOpen();
        const normalizedPath = normalizeArchivePath(path);
        return this.entries.some(
            (entry) => entry.normalizedPath === normalizedPath
        );
    }

    readBytes(path: string): Uint8Array {
        this.assertOpen();

        const normalizedPath = normalizeArchivePath(path);
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
                    normalizeArchivePath(file.name) === normalizedPath,
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

        if (bytes.length > MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES) {
            throw new ArchiveEntryTooLargeError(
                normalizedPath,
                bytes.length,
                MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES
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
                normalizeArchivePath(path)
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
