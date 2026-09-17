import type { Diagram } from '@/lib/domain/diagram';
import { apiRequest } from './client';
import type { DjangoExportResponse } from './django-export-types';

export interface ExportDjangoProjectInput {
    diagram: Diagram;
}

export const exportDjangoProject = async (
    input: ExportDjangoProjectInput
): Promise<DjangoExportResponse> =>
    apiRequest<DjangoExportResponse>('/exports/django', {
        method: 'POST',
        data: {
            diagram: input.diagram,
        },
    });
