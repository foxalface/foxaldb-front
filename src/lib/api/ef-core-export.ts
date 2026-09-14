import type { Diagram } from '@/lib/domain/diagram';
import { apiRequest } from './client';
import type { EfCoreExportResponse } from './ef-core-export-types';

export interface ExportEfCoreProjectInput {
    diagram: Diagram;
    namespace?: string;
    dbContextName?: string;
}

const trimmedOptional = (value: string | undefined): string | undefined => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
};

export const exportEfCoreProject = async (
    input: ExportEfCoreProjectInput
): Promise<EfCoreExportResponse> => {
    const namespace = trimmedOptional(input.namespace);
    const dbContextName = trimmedOptional(input.dbContextName);

    return apiRequest<EfCoreExportResponse>('/exports/ef-core', {
        method: 'POST',
        data: {
            diagram: input.diagram,
            ...(namespace ? { namespace } : {}),
            ...(dbContextName ? { dbContextName } : {}),
        },
    });
};
