import { ApiError } from '@/lib/api/client';

export type LaravelExportErrorCode =
    | 'unauthenticated'
    | 'forbidden'
    | 'not_found'
    | 'empty'
    | 'invalid'
    | 'network'
    | 'generation_failed';

export const resolveLaravelExportErrorCode = (
    error: unknown
): LaravelExportErrorCode => {
    if (error instanceof ApiError) {
        switch (error.status) {
            case 401:
                return 'unauthenticated';
            case 403:
                return 'forbidden';
            case 404:
                return 'not_found';
            case 422:
                return hasEmptyDiagramValidationError(error.payload)
                    ? 'empty'
                    : 'invalid';
            default:
                return 'generation_failed';
        }
    }

    return 'network';
};

const hasEmptyDiagramValidationError = (payload: unknown): boolean => {
    if (
        typeof payload !== 'object' ||
        payload === null ||
        !('errors' in payload)
    ) {
        return false;
    }

    const errors = payload.errors;
    if (
        typeof errors !== 'object' ||
        errors === null ||
        !('diagram' in errors)
    ) {
        return false;
    }

    const diagramErrors = errors.diagram;

    return Array.isArray(diagramErrors) && diagramErrors.length > 0;
};
