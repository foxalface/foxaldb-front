import type { Diagram } from '@/lib/domain/diagram';

export interface DrizzleExportRequest {
    diagram: Diagram;
}

export interface DrizzleExportFile {
    path: string;
    content: string;
}

export interface DrizzleExportNote {
    code: string;
    message: string;
    path?: string;
    metadata?: Record<string, unknown>;
}

export interface DrizzleExportError {
    code: string;
    message: string;
    path?: string;
}

export interface DrizzleExportSuccess {
    success: true;
    filename: string;
    files: DrizzleExportFile[];
    notes: DrizzleExportNote[];
}

export interface DrizzleExportFailure {
    success: false;
    error: DrizzleExportError;
}

export type DrizzleExportResponse = DrizzleExportSuccess | DrizzleExportFailure;
