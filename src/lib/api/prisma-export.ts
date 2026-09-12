import type { Diagram } from '@/lib/domain/diagram';
import { apiRequest } from './client';
import type {
    PrismaExportResult,
    PrismaExportVersion,
} from './prisma-export-types';

export interface ExportPrismaSchemaInput {
    version: PrismaExportVersion;
    diagram: Diagram;
}

export const exportPrismaSchema = async (
    input: ExportPrismaSchemaInput
): Promise<PrismaExportResult> =>
    apiRequest<PrismaExportResult>('/exports/prisma', {
        method: 'POST',
        data: {
            version: input.version,
            diagram: input.diagram,
        },
    });
