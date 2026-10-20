import type { UploadCapabilities } from '@/lib/upload-capabilities/types';
import type { ProjectFileBundle } from '../project-types';
import type { ProjectImportBackendErrorCode } from '../project-import-backend-error-codes';

export class ProjectImportBundlePrecheckError extends Error {
    readonly code: ProjectImportBackendErrorCode;

    constructor(code: ProjectImportBackendErrorCode, message: string) {
        super(message);
        this.name = 'ProjectImportBundlePrecheckError';
        this.code = code;
    }
}

const pathDepth = (relativePath: string): number => {
    if (relativePath.length === 0) {
        return 0;
    }

    return relativePath.split('/').filter((segment) => segment.length > 0)
        .length;
};

const contentByteLength = (content: string): number =>
    new TextEncoder().encode(content).byteLength;

/**
 * Client-side bundle checks using published upload capabilities.
 * Backend validation remains authoritative.
 */
export const validateProjectImportBundle = (
    bundle: ProjectFileBundle,
    limits: UploadCapabilities['projectImport']
): void => {
    const files = bundle.files;

    if (files.length > limits.maxFiles) {
        throw new ProjectImportBundlePrecheckError(
            'bundle_too_many_files',
            'The project import bundle contains too many files.'
        );
    }

    let totalBytes = 0;

    for (const file of files) {
        if (file.relativePath.length > limits.maxPathLength) {
            throw new ProjectImportBundlePrecheckError(
                'unsafe_path',
                'A project import file path exceeds the maximum allowed length.'
            );
        }

        if (pathDepth(file.relativePath) > limits.maxPathDepth) {
            throw new ProjectImportBundlePrecheckError(
                'unsafe_path',
                'A project import file path exceeds the maximum allowed depth.'
            );
        }

        const fileBytes = contentByteLength(file.content);
        if (fileBytes > limits.maxFileBytes) {
            throw new ProjectImportBundlePrecheckError(
                'bundle_file_too_large',
                'A project import file exceeds the maximum allowed size.'
            );
        }

        totalBytes += fileBytes;

        if (totalBytes > limits.maxTotalBytes) {
            throw new ProjectImportBundlePrecheckError(
                'bundle_total_too_large',
                'The project import bundle exceeds the maximum allowed total size.'
            );
        }
    }
};
