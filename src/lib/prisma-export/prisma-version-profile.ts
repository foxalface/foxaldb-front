import type { PrismaExportVersion } from './prisma-export-version';

export interface PrismaVersionProfile {
    version: PrismaExportVersion;
    clientProvider: string;
    clientOutput?: string;
    datasourceUrlInSchema: boolean;
}

export const PRISMA_VERSION_PROFILES: Record<
    PrismaExportVersion,
    PrismaVersionProfile
> = {
    '6': {
        version: '6',
        clientProvider: 'prisma-client-js',
        datasourceUrlInSchema: true,
    },
    '7': {
        version: '7',
        clientProvider: 'prisma-client',
        clientOutput: '../generated/prisma',
        datasourceUrlInSchema: false,
    },
};

export const getPrismaVersionProfile = (
    version: PrismaExportVersion
): PrismaVersionProfile => PRISMA_VERSION_PROFILES[version];
