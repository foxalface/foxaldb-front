import { strToU8, zipSync } from 'fflate';
import type { RailsExportFile } from '@/lib/api/rails-export-types';
import { RAILS_EXPORT_FALLBACK_FILENAME } from './rails-export-constants';

export type RailsExportZipErrorCode =
    | 'unsafe_path'
    | 'empty_files'
    | 'duplicate_path';

export class RailsExportZipError extends Error {
    readonly code: RailsExportZipErrorCode;
    readonly path?: string;

    constructor(code: RailsExportZipErrorCode, message: string, path?: string) {
        super(message);
        this.name = 'RailsExportZipError';
        this.code = code;
        this.path = path;
    }
}

const WINDOWS_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/]/;

const hasControlChars = (value: string): boolean => {
    for (let index = 0; index < value.length; index += 1) {
        if (value.charCodeAt(index) <= 0x1f) {
            return true;
        }
    }

    return false;
};

export const isUnsafeZipPath = (path: string): boolean => {
    const trimmed = path.trim();

    if (trimmed.length === 0) {
        return true;
    }

    if (hasControlChars(trimmed)) {
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

export const isValidRailsExportFilename = (filename: string): boolean => {
    const trimmed = filename.trim();

    if (trimmed.length === 0) {
        return false;
    }

    if (hasControlChars(trimmed)) {
        return false;
    }

    if (trimmed.includes('/') || trimmed.includes('\\')) {
        return false;
    }

    return !trimmed.split(/[\\/]/).some((segment) => segment === '..');
};

export const resolveRailsExportFilename = (filename?: string): string => {
    if (!filename || !isValidRailsExportFilename(filename)) {
        return RAILS_EXPORT_FALLBACK_FILENAME;
    }

    return filename.trim();
};

const STABLE_ZIP_MTIME = new Date(Date.UTC(1980, 0, 1));

export const buildRailsExportZip = (files: RailsExportFile[]): Uint8Array => {
    if (files.length === 0) {
        throw new RailsExportZipError(
            'empty_files',
            'Rails export did not include any files.'
        );
    }

    const zippable: Record<string, [Uint8Array, { mtime: Date }]> = {};

    for (const file of files) {
        if (isUnsafeZipPath(file.path)) {
            throw new RailsExportZipError(
                'unsafe_path',
                'Rails export contains an unsafe file path.',
                file.path
            );
        }

        if (Object.hasOwn(zippable, file.path)) {
            throw new RailsExportZipError(
                'duplicate_path',
                'Rails export contains a duplicate file path.',
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
