export interface UploadCapabilities {
    schema: {
        textMaxBytes: number;
    };
    archive: {
        compressedMaxBytes: number;
        uncompressedMaxBytes: number;
        maxEntries: number;
        maxEntryBytes: number;
        maxPathLength: number;
        maxDepth: number;
    };
    projectImport: {
        maxFiles: number;
        maxFileBytes: number;
        maxTotalBytes: number;
        maxPathLength: number;
        maxPathDepth: number;
    };
    laravelMigrationArchive: {
        maxBytes: number;
    };
    schemaMerge: {
        payloadMaxBytes: number;
    };
}
