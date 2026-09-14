import type { Diagram } from '@/lib/domain/diagram';

export interface EfCoreExportRequest {
    diagram: Diagram;
    namespace?: string;
    dbContextName?: string;
}

export interface EfCoreExportFile {
    path: string;
    content: string;
}

export interface EfCoreExportNote {
    code: string;
    message: string;
    path?: string;
    metadata?: Record<string, unknown>;
}

export interface EfCoreExportError {
    code: string;
    message: string;
    path?: string;
}

export interface EfCoreExportSuccessResponse {
    success: true;
    filename: string;
    files: EfCoreExportFile[];
    notes: EfCoreExportNote[];
}

export interface EfCoreExportFailureResponse {
    success: false;
    error: EfCoreExportError;
}

export type EfCoreExportResponse =
    | EfCoreExportSuccessResponse
    | EfCoreExportFailureResponse;
