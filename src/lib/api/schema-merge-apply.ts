import { ApiError, apiRequest } from './client';
import { getClientId } from '@/lib/realtime/client-id';
import type { SchemaMergeApplyRequest } from '@/lib/schema-merge/apply-request';
import {
    decodeSchemaMergeApplyResponse,
    type SchemaMergeApplyResponse,
} from '@/lib/schema-merge/apply-response';
import {
    isSchemaMergeErrorCode,
    type SchemaMergeErrorCode,
} from '@/lib/schema-merge/diff-types';
import { SchemaMergePayloadTooLargeError } from './schema-merge-compare';
import { resolveUploadCapabilities } from '@/lib/upload-capabilities';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export class SchemaMergeApplyResponseError extends Error {
    constructor() {
        super('Schema merge apply response was not valid.');
        this.name = 'SchemaMergeApplyResponseError';
    }
}

export type SchemaMergeApplyFailure =
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

export const mapSchemaMergeApplyError = (
    error: unknown
): SchemaMergeApplyFailure => {
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

    if (error.status === 409) {
        const code = readErrorCode(error.payload);

        if (code === 'stale_comparison') {
            return { type: 'merge_code', code: 'stale_comparison' };
        }
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

const requestByteLength = (body: unknown): number =>
    new TextEncoder().encode(JSON.stringify(body)).length;

/**
 * Posts a closed selection to Apply.
 *
 * `clientId` is the realtime session id from `getClientId()`, the same token
 * DiagramOperation requests send.
 */
export const applySchemaMerge = async (
    diagramId: string | number,
    request: SchemaMergeApplyRequest
): Promise<SchemaMergeApplyResponse> => {
    const body = {
        baseContentHash: request.baseContentHash,
        incomingDiagram: request.incomingDiagram,
        includeDeletions: request.includeDeletions,
        source: {
            kind: request.source.kind,
        },
        selectedOperationIds: [...request.selectedOperationIds],
        clientId: getClientId(),
    };
    const capabilities = await resolveUploadCapabilities();

    if (requestByteLength(body) > capabilities.schemaMerge.payloadMaxBytes) {
        throw new SchemaMergePayloadTooLargeError();
    }

    const payload = await apiRequest<unknown>(
        `/diagrams/${encodeURIComponent(String(diagramId))}/merge/apply`,
        {
            method: 'POST',
            data: body,
        }
    );
    const decoded = decodeSchemaMergeApplyResponse(payload, String(diagramId));

    if (!decoded) {
        throw new SchemaMergeApplyResponseError();
    }

    return decoded;
};
