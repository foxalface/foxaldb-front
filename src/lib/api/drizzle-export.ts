import type { Diagram } from '@/lib/domain/diagram';
import { apiRequest } from './client';
import type { DrizzleExportResponse } from './drizzle-export-types';

export interface ExportDrizzleProjectInput {
    diagram: Diagram;
}

export const exportDrizzleProject = async (
    input: ExportDrizzleProjectInput
): Promise<DrizzleExportResponse> =>
    apiRequest<DrizzleExportResponse>('/exports/drizzle', {
        method: 'POST',
        data: {
            diagram: input.diagram,
        },
    });
