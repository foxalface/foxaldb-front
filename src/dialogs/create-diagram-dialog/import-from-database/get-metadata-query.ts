import type { DatabaseClient } from '@/lib/domain/database-clients';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DatabaseType } from '@/lib/domain/database-type';
import { importMetadataScripts } from '@/lib/data/import-metadata/scripts/scripts';

export interface MetadataQueryOptions {
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    databaseClient?: DatabaseClient;
}

export const getMetadataQuery = ({
    databaseType,
    databaseEdition,
    databaseClient,
}: MetadataQueryOptions): string => {
    const scriptFactory = importMetadataScripts[databaseType];

    if (!scriptFactory) {
        return '';
    }

    return scriptFactory({ databaseEdition, databaseClient });
};

export const supportsMetadataImport = (databaseType: DatabaseType): boolean =>
    getMetadataQuery({ databaseType }).trim().length > 0;
