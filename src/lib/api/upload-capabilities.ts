import { apiRequest } from './client';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';

const requirePositiveInt = (value: unknown, label: string): number => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        throw new Error(`Invalid upload capability: ${label}`);
    }

    return value;
};

const requireObject = (
    value: unknown,
    label: string
): Record<string, unknown> => {
    if (typeof value !== 'object' || value === null) {
        throw new Error(`Invalid upload capability: ${label}`);
    }

    return value as Record<string, unknown>;
};

export const parseUploadCapabilities = (
    payload: unknown
): UploadCapabilities => {
    const root = requireObject(payload, 'response');
    const schema = requireObject(root.schema, 'schema');
    const archive = requireObject(root.archive, 'archive');
    const projectImport = requireObject(root.projectImport, 'projectImport');
    const laravelMigrationArchive = requireObject(
        root.laravelMigrationArchive,
        'laravelMigrationArchive'
    );
    const schemaMerge = requireObject(root.schemaMerge, 'schemaMerge');

    return {
        schema: {
            textMaxBytes: requirePositiveInt(
                schema.textMaxBytes,
                'schema.textMaxBytes'
            ),
        },
        archive: {
            compressedMaxBytes: requirePositiveInt(
                archive.compressedMaxBytes,
                'archive.compressedMaxBytes'
            ),
            uncompressedMaxBytes: requirePositiveInt(
                archive.uncompressedMaxBytes,
                'archive.uncompressedMaxBytes'
            ),
            maxEntries: requirePositiveInt(
                archive.maxEntries,
                'archive.maxEntries'
            ),
            maxEntryBytes: requirePositiveInt(
                archive.maxEntryBytes,
                'archive.maxEntryBytes'
            ),
            maxPathLength: requirePositiveInt(
                archive.maxPathLength,
                'archive.maxPathLength'
            ),
            maxDepth: requirePositiveInt(archive.maxDepth, 'archive.maxDepth'),
        },
        projectImport: {
            maxFiles: requirePositiveInt(
                projectImport.maxFiles,
                'projectImport.maxFiles'
            ),
            maxFileBytes: requirePositiveInt(
                projectImport.maxFileBytes,
                'projectImport.maxFileBytes'
            ),
            maxTotalBytes: requirePositiveInt(
                projectImport.maxTotalBytes,
                'projectImport.maxTotalBytes'
            ),
            maxPathLength: requirePositiveInt(
                projectImport.maxPathLength,
                'projectImport.maxPathLength'
            ),
            maxPathDepth: requirePositiveInt(
                projectImport.maxPathDepth,
                'projectImport.maxPathDepth'
            ),
        },
        laravelMigrationArchive: {
            maxBytes: requirePositiveInt(
                laravelMigrationArchive.maxBytes,
                'laravelMigrationArchive.maxBytes'
            ),
        },
        schemaMerge: {
            payloadMaxBytes: requirePositiveInt(
                schemaMerge.payloadMaxBytes,
                'schemaMerge.payloadMaxBytes'
            ),
        },
    };
};

export const fetchUploadCapabilities =
    async (): Promise<UploadCapabilities> => {
        const payload = await apiRequest<unknown>('/capabilities/uploads');

        return parseUploadCapabilities(payload);
    };
