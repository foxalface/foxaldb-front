import { strToU8, zipSync } from 'fflate';
import type { EfCoreExportFile } from '@/lib/api/ef-core-export-types';
import { EF_CORE_EXPORT_FALLBACK_FILENAME } from './ef-core-export-constants';

export type EfCoreExportZipErrorCode = 'unsafe_path' | 'empty_files';

export class EfCoreExportZipError extends Error {
    readonly code: EfCoreExportZipErrorCode;
    readonly path?: string;

    constructor(
        code: EfCoreExportZipErrorCode,
        message: string,
        path?: string
    ) {
        super(message);
        this.name = 'EfCoreExportZipError';
        this.code = code;
        this.path = path;
    }
}

const WINDOWS_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/]/;

export const isUnsafeZipPath = (path: string): boolean => {
    const trimmed = path.trim();

    if (trimmed.length === 0) {
        return true;
    }

    if (trimmed.startsWith('/') || trimmed.startsWith('\\')) {
        return true;
    }

    if (WINDOWS_ABSOLUTE_PATH.test(trimmed)) {
        return true;
    }

    const segments = trimmed.replace(/\\/g, '/').split('/');

    return segments.some(
        (segment) => segment.length === 0 || segment === '.' || segment === '..'
    );
};

export const isValidEfCoreExportFilename = (filename: string): boolean => {
    const trimmed = filename.trim();

    if (trimmed.length === 0) {
        return false;
    }

    if (trimmed.includes('/') || trimmed.includes('\\')) {
        return false;
    }

    return !trimmed.split(/[\\/]/).some((segment) => segment === '..');
};

export const resolveEfCoreExportFilename = (filename?: string): string => {
    if (!filename || !isValidEfCoreExportFilename(filename)) {
        return EF_CORE_EXPORT_FALLBACK_FILENAME;
    }

    return filename.trim();
};

const STABLE_ZIP_MTIME = new Date(Date.UTC(1980, 0, 1));

export const buildEfCoreExportZip = (files: EfCoreExportFile[]): Uint8Array => {
    if (files.length === 0) {
        throw new EfCoreExportZipError(
            'empty_files',
            'EF Core export did not include any files.'
        );
    }

    const zippable: Record<string, [Uint8Array, { mtime: Date }]> = {};

    for (const file of files) {
        if (isUnsafeZipPath(file.path)) {
            throw new EfCoreExportZipError(
                'unsafe_path',
                'EF Core export contains an unsafe file path.',
                file.path
            );
        }

        zippable[file.path] = [
            strToU8(file.content),
            { mtime: STABLE_ZIP_MTIME },
        ];
    }

    return zipSync(zippable, { mtime: STABLE_ZIP_MTIME });
};
