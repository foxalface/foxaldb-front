import { ApiError } from '@/lib/api/client';

export const STALE_DIAGRAM_CONTENT_CODE = 'stale_content';

export const isStaleDiagramContentError = (error: unknown): boolean => {
    if (!(error instanceof ApiError) || error.status !== 409) {
        return false;
    }

    if (typeof error.payload !== 'object' || error.payload === null) {
        return false;
    }

    const code = (error.payload as Record<string, unknown>).code;

    return code === STALE_DIAGRAM_CONTENT_CODE;
};
