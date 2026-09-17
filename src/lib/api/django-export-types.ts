import type { Diagram } from '@/lib/domain/diagram';

export interface DjangoExportRequest {
    diagram: Diagram;
}

export interface DjangoExportFile {
    path: string;
    content: string;
}

export interface DjangoExportNote {
    code: string;
    message: string;
    path?: string;
    metadata?: Record<string, unknown>;
}

export interface DjangoExportError {
    code: string;
    message: string;
    path?: string;
}

export interface DjangoExportSuccess {
    success: true;
    filename: string;
    files: DjangoExportFile[];
    notes: DjangoExportNote[];
}

export interface DjangoExportFailure {
    success: false;
    error: DjangoExportError;
}

export type DjangoExportResponse = DjangoExportSuccess | DjangoExportFailure;
