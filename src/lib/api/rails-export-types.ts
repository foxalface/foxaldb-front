import type { Diagram } from '@/lib/domain/diagram';

export interface RailsExportRequest {
    diagram: Diagram;
}

export interface RailsExportFile {
    path: string;
    content: string;
}

export interface RailsExportNote {
    code: string;
    message: string;
    path?: string;
    metadata?: Record<string, unknown>;
}

export interface RailsExportError {
    code: string;
    message: string;
    path?: string;
}

export interface RailsExportSuccess {
    success: true;
    filename: string;
    files: RailsExportFile[];
    notes: RailsExportNote[];
}

export interface RailsExportFailure {
    success: false;
    error: RailsExportError;
}

export type RailsExportResponse = RailsExportSuccess | RailsExportFailure;
