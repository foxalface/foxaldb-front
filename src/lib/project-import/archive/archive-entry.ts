export interface ArchiveEntry {
    /** Path normalized for lookup (`/` separators, no traversal). */
    readonly normalizedPath: string;
    /** Path as stored in the ZIP central directory. */
    readonly originalPath: string;
    /** Lowercase extension without dot; empty for directories or extensionless files. */
    readonly extension: string;
    /** Compressed size in bytes (0 for directory entries). */
    readonly sizeCompressed: number;
    /** Uncompressed size in bytes (0 for directory entries). */
    readonly sizeUncompressed: number;
    /** True when the entry represents a directory. */
    readonly isDirectory: boolean;
}
