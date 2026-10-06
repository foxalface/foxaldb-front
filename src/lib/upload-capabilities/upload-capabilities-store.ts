import { fetchUploadCapabilities } from '@/lib/api/upload-capabilities';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from './safety-ceiling';
import type { UploadCapabilities } from './types';

let cachedCapabilities: UploadCapabilities | null = null;
let pendingLoad: Promise<UploadCapabilities> | null = null;

export const peekUploadCapabilities = (): UploadCapabilities | null =>
    cachedCapabilities;

export const resetUploadCapabilitiesCache = (): void => {
    cachedCapabilities = null;
    pendingLoad = null;
};

/**
 * Loads the public capabilities once and reuses the result.
 * A failed load is not cached, so the next call tries again.
 */
export const loadUploadCapabilities = (): Promise<UploadCapabilities> => {
    if (cachedCapabilities) {
        return Promise.resolve(cachedCapabilities);
    }

    if (pendingLoad) {
        return pendingLoad;
    }

    pendingLoad = fetchUploadCapabilities()
        .then((capabilities) => {
            cachedCapabilities = capabilities;
            return capabilities;
        })
        .finally(() => {
            pendingLoad = null;
        });

    return pendingLoad;
};

/**
 * Backend capabilities when the public endpoint answers.
 * Otherwise the conservative local safety ceiling.
 */
export const resolveUploadCapabilities =
    async (): Promise<UploadCapabilities> => {
        try {
            return await loadUploadCapabilities();
        } catch {
            return CONSERVATIVE_UPLOAD_SAFETY_CEILING;
        }
    };
