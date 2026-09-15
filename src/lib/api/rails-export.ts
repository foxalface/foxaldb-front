import type { Diagram } from '@/lib/domain/diagram';
import { apiRequest } from './client';
import type { RailsExportResponse } from './rails-export-types';

export interface ExportRailsProjectInput {
    diagram: Diagram;
}

export const exportRailsProject = async (
    input: ExportRailsProjectInput
): Promise<RailsExportResponse> =>
    apiRequest<RailsExportResponse>('/exports/rails', {
        method: 'POST',
        data: {
            diagram: input.diagram,
        },
    });
