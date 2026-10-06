import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as ClientModule from '@/lib/api/client';
import { ArchiveTooLargeError } from '@/lib/project-import/archive/archive-errors';
import { ArchiveReader } from '@/lib/project-import/archive/archive-reader';
import { createTestZipFile } from '@/lib/project-import/__tests__/fixtures/build-test-zip';
import { parseUploadCapabilities } from '@/lib/api/upload-capabilities';
import { CONSERVATIVE_UPLOAD_SAFETY_CEILING } from '../safety-ceiling';
import {
    loadUploadCapabilities,
    resetUploadCapabilitiesCache,
    resolveUploadCapabilities,
} from '../upload-capabilities-store';
import type { UploadCapabilities } from '../types';

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}));

vi.mock('@/lib/api/client', async () => {
    const actual = (await vi.importActual(
        '@/lib/api/client'
    )) as typeof ClientModule;

    return {
        ...actual,
        apiRequest: apiRequestMock,
    };
});

const shippedCapabilities = (): UploadCapabilities =>
    structuredClone(CONSERVATIVE_UPLOAD_SAFETY_CEILING);

describe('upload capabilities', () => {
    beforeEach(() => {
        apiRequestMock.mockReset();
        resetUploadCapabilitiesCache();
    });

    it('parses the public capabilities payload', () => {
        expect(parseUploadCapabilities(shippedCapabilities())).toEqual(
            shippedCapabilities()
        );
    });

    it('rejects a payload that omits archive safety limits', () => {
        const payload = shippedCapabilities();
        const incomplete: Record<string, unknown> = { ...payload };
        delete incomplete.archive;

        expect(() => parseUploadCapabilities(incomplete)).toThrow(/archive/);
    });

    it('reuses a successful load', async () => {
        apiRequestMock.mockResolvedValue(shippedCapabilities());

        const first = await loadUploadCapabilities();
        const second = await loadUploadCapabilities();

        expect(second).toBe(first);
        expect(apiRequestMock).toHaveBeenCalledTimes(1);
        expect(apiRequestMock).toHaveBeenCalledWith('/capabilities/uploads');
    });

    it('shares one request while the first load is in flight', async () => {
        let resolvePayload: (value: UploadCapabilities) => void = () => {};
        apiRequestMock.mockReturnValue(
            new Promise<UploadCapabilities>((resolve) => {
                resolvePayload = resolve;
            })
        );

        const first = loadUploadCapabilities();
        const second = loadUploadCapabilities();
        resolvePayload(shippedCapabilities());

        await expect(Promise.all([first, second])).resolves.toEqual([
            shippedCapabilities(),
            shippedCapabilities(),
        ]);
        expect(apiRequestMock).toHaveBeenCalledTimes(1);
    });

    it('does not cache a failed load', async () => {
        apiRequestMock.mockRejectedValueOnce(new Error('offline'));
        await expect(loadUploadCapabilities()).rejects.toThrow('offline');

        apiRequestMock.mockResolvedValueOnce(shippedCapabilities());
        await expect(loadUploadCapabilities()).resolves.toEqual(
            shippedCapabilities()
        );
        expect(apiRequestMock).toHaveBeenCalledTimes(2);
    });

    it('uses the conservative ceiling when the public endpoint fails', async () => {
        apiRequestMock.mockRejectedValue(new Error('offline'));

        await expect(resolveUploadCapabilities()).resolves.toBe(
            CONSERVATIVE_UPLOAD_SAFETY_CEILING
        );

        apiRequestMock.mockResolvedValueOnce(shippedCapabilities());
        const fetched = await resolveUploadCapabilities();
        expect(fetched).toEqual(shippedCapabilities());
        expect(fetched).not.toBe(CONSERVATIVE_UPLOAD_SAFETY_CEILING);
    });

    it('rejects an oversized archive against fetched limits', async () => {
        const capabilities = shippedCapabilities();
        capabilities.archive.compressedMaxBytes = 32;
        apiRequestMock.mockResolvedValue(capabilities);

        const resolved = await resolveUploadCapabilities();
        const file = createTestZipFile({ 'schema.prisma': 'model User {}' });

        await expect(
            ArchiveReader.open(file, resolved.archive)
        ).rejects.toBeInstanceOf(ArchiveTooLargeError);
    });

    it('still bounds local archive inspection when capabilities cannot be fetched', async () => {
        apiRequestMock.mockRejectedValue(new Error('offline'));
        const resolved = await resolveUploadCapabilities();
        const file = new File(['zip'], 'project.zip', {
            type: 'application/zip',
        });
        Object.defineProperty(file, 'size', {
            value: resolved.archive.compressedMaxBytes + 1,
        });

        await expect(
            ArchiveReader.open(file, resolved.archive)
        ).rejects.toBeInstanceOf(ArchiveTooLargeError);
    });
});
