import { ApiError, apiRequest } from './client';
import type { SchemaMergeCompareRequest } from '@/lib/schema-merge/compare-request';
import {
    decodeSchemaMergeCompareResponse,
    type SchemaMergeCompareResponse,
} from '@/lib/schema-merge/compare-response';
import {
    isSchemaMergeErrorCode,
    type SchemaMergeErrorCode,
} from '@/lib/schema-merge/diff-types';
import { resolveUploadCapabilities } from '@/lib/upload-capabilities';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export class SchemaMergeCompareResponseError extends Error {
    constructor() {
        super('Schema merge compare response was not valid.');
        this.name = 'SchemaMergeCompareResponseError';
    }
}

export class SchemaMergePayloadTooLargeError extends Error {
    readonly code = 'payload_too_large' as const;

    constructor() {
        super('payload_too_large');
        this.name = 'SchemaMergePayloadTooLargeError';
    }
}

export type SchemaMergeCompareFailure =
    | {
          type: 'merge_code';
          code: SchemaMergeErrorCode;
      }
    | {
          type: 'unauthenticated';
      }
    | {
          type: 'forbidden';
      }
    | {
          type: 'rate_limit';
      }
    | {
          type: 'unexpected';
      };

const readErrorCode = (payload: unknown): string | null => {
    if (!isRecord(payload) || typeof payload.code !== 'string') {
        return null;
    }

    return payload.code;
};

export const mapSchemaMergeCompareError = (
    error: unknown
): SchemaMergeCompareFailure => {
    if (error instanceof SchemaMergePayloadTooLargeError) {
        return {
            type: 'merge_code',
            code: 'payload_too_large',
        };
    }

    if (!(error instanceof ApiError)) {
        return { type: 'unexpected' };
    }

    if (error.status === 401) {
        return { type: 'unauthenticated' };
    }

    if (error.status === 403) {
        return { type: 'forbidden' };
    }

    if (error.status === 429) {
        return { type: 'rate_limit' };
    }

    const code = readErrorCode(error.payload);

    if (code && isSchemaMergeErrorCode(code)) {
        return {
            type: 'merge_code',
            code,
        };
    }

    return { type: 'unexpected' };
};

const compareRequestBody = (
    request: SchemaMergeCompareRequest
): SchemaMergeCompareRequest => ({
    incomingDiagram: request.incomingDiagram,
    includeDeletions: request.includeDeletions,
    source: {
        kind: request.source.kind,
    },
});

const requestByteLength = (request: SchemaMergeCompareRequest): number =>
    new TextEncoder().encode(JSON.stringify(request)).length;

/**
 * Posts a normalized incoming diagram to Compare.
 *
 * The body is rebuilt so `source` stays `{ kind }` only. Pending editor
 * changes are not flushed: autosave has no flush handle. That flush is M8.
 */
export const compareSchemaMerge = async (
    diagramId: string | number,
    request: SchemaMergeCompareRequest
): Promise<SchemaMergeCompareResponse> => {
    const body = compareRequestBody(request);
    const capabilities = await resolveUploadCapabilities();

    if (requestByteLength(body) > capabilities.schemaMerge.payloadMaxBytes) {
        throw new SchemaMergePayloadTooLargeError();
    }

    const payload = await apiRequest<unknown>(
        `/diagrams/${encodeURIComponent(String(diagramId))}/merge/compare`,
        {
            method: 'POST',
            data: body,
        }
    );
    const decoded = decodeSchemaMergeCompareResponse(payload);

    if (!decoded) {
        throw new SchemaMergeCompareResponseError();
    }

    return decoded;
};
