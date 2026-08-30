/** Maximum compressed archive size (50 MB). */
export const MAX_ARCHIVE_COMPRESSED_BYTES = 50 * 1024 * 1024;

/** Maximum estimated total uncompressed size across all entries (200 MB). */
export const MAX_ARCHIVE_UNCOMPRESSED_BYTES = 200 * 1024 * 1024;

/** Maximum number of entries (files + directories) in an archive. */
export const MAX_ARCHIVE_FILE_COUNT = 10_000;

/** Maximum uncompressed size for a single file entry (10 MB). */
export const MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES = 10 * 1024 * 1024;

/** Maximum normalized path length in characters. */
export const MAX_ARCHIVE_PATH_LENGTH = 512;

/** Maximum directory depth (path segment count). */
export const MAX_ARCHIVE_DIRECTORY_DEPTH = 32;
