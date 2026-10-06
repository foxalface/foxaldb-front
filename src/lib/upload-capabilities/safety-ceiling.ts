import type { UploadCapabilities } from './types';

/**
 * Conservative safety ceiling for local inspection when the public
 * capabilities endpoint cannot be reached.
 *
 * This is not the product authority. `backend/config/uploads.php` is.
 * The numbers match the shipped backend defaults so a guest or offline
 * session does not inspect unlimited input. A successful fetch replaces
 * this object and is not merged with it. If an operator lowers a backend
 * limit, an offline client can be looser than that override until the
 * next successful fetch. Requests that reach the backend are still
 * rejected there. Do not raise these numbers above the shipped defaults.
 */
const MIB = 1024 * 1024;

export const CONSERVATIVE_UPLOAD_SAFETY_CEILING: UploadCapabilities = {
    schema: {
        textMaxBytes: 5 * MIB,
    },
    archive: {
        compressedMaxBytes: 50 * MIB,
        uncompressedMaxBytes: 200 * MIB,
        maxEntries: 10_000,
        maxEntryBytes: 10 * MIB,
        maxPathLength: 512,
        maxDepth: 32,
    },
    projectImport: {
        maxFiles: 500,
        maxFileBytes: 2 * MIB,
        maxTotalBytes: 10 * MIB,
        maxPathLength: 512,
        maxPathDepth: 32,
    },
    laravelMigrationArchive: {
        maxBytes: 5 * MIB,
    },
};
