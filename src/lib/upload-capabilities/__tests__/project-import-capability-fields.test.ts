import { describe, expect, it } from 'vitest';
import { parseUploadCapabilities } from '@/lib/api/upload-capabilities';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from '../safety-ceiling';

describe('upload capabilities projectImport fields', () => {
    it('uses camelCase field names aligned with GET /api/capabilities/uploads', () => {
        const parsed = parseUploadCapabilities(
            CONSERVATIVE_UPLOAD_SAFETY_CEILING
        );

        expect(parsed.projectImport).toEqual({
            maxFiles: expect.any(Number),
            maxFileBytes: expect.any(Number),
            maxTotalBytes: expect.any(Number),
            maxPathLength: expect.any(Number),
            maxPathDepth: expect.any(Number),
        });
    });
});
