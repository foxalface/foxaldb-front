import { describe, expect, it, vi } from 'vitest';
import { strToU8 } from 'fflate';
import { ArchiveReader } from '../archive/archive-reader';
import {
    ArchiveClosedError,
    ArchiveCorruptedError,
    ArchiveDepthExceededError,
    ArchiveDirectoryReadError,
    ArchiveDuplicatePathError,
    ArchiveEntryNotFoundError,
    ArchiveInvalidPathError,
    ArchiveInvalidUtf8ContentError,
    ArchivePathTraversalError,
    ArchiveTooLargeError,
    ArchiveUnsupportedFormatError,
} from '../archive/archive-errors';
import {
    MAX_ARCHIVE_COMPRESSED_BYTES,
    MAX_ARCHIVE_DIRECTORY_DEPTH,
} from '../archive/archive-limits';
import { normalizeArchivePath } from '../archive/archive-utils';
import { createRawZipFile, createTestZipFile } from './fixtures/build-test-zip';

describe('normalizeArchivePath', () => {
    it('normalizes duplicate slashes', () => {
        expect(normalizeArchivePath('foo//bar/baz.txt')).toBe(
            'foo/bar/baz.txt'
        );
    });

    it('normalizes backslashes', () => {
        expect(normalizeArchivePath('foo\\bar\\baz.txt')).toBe(
            'foo/bar/baz.txt'
        );
    });

    it('removes dot segments', () => {
        expect(normalizeArchivePath('foo/./bar/./baz.txt')).toBe(
            'foo/bar/baz.txt'
        );
    });

    it('preserves directory trailing slash', () => {
        expect(normalizeArchivePath('foo/bar/')).toBe('foo/bar/');
    });

    it('rejects path traversal', () => {
        expect(() => normalizeArchivePath('../etc/passwd')).toThrow(
            ArchivePathTraversalError
        );
    });

    it('rejects absolute paths', () => {
        expect(() => normalizeArchivePath('/etc/passwd')).toThrow(
            ArchiveInvalidPathError
        );
        expect(() => normalizeArchivePath('C:\\windows\\system32')).toThrow(
            ArchiveInvalidPathError
        );
    });
});

describe('ArchiveReader', () => {
    it('opens a valid archive and lists entries', async () => {
        const reader = await ArchiveReader.open(
            createTestZipFile({
                'readme.txt': 'hello',
                'src/main.ts': 'export {};',
                'empty-dir/': '',
            })
        );

        const entries = reader.listEntries();

        expect(entries).toHaveLength(3);
        expect(entries.map((entry) => entry.normalizedPath)).toEqual([
            'empty-dir/',
            'readme.txt',
            'src/main.ts',
        ]);

        const readme = entries.find(
            (entry) => entry.normalizedPath === 'readme.txt'
        );
        expect(readme).toMatchObject({
            extension: 'txt',
            isDirectory: false,
            sizeUncompressed: 5,
        });

        reader.close();
    });

    it('looks up entries with has()', async () => {
        const reader = await ArchiveReader.open(
            createTestZipFile({ 'docs/guide.md': '# Guide' })
        );

        expect(reader.has('docs/guide.md')).toBe(true);
        expect(reader.has('docs\\guide.md')).toBe(true);
        expect(reader.has('missing.txt')).toBe(false);

        reader.close();
    });

    it('reads file bytes and text on demand', async () => {
        const reader = await ArchiveReader.open(
            createTestZipFile({
                'data/binary.bin': '\u0000\u0001',
                'data/text.txt': 'café',
            })
        );

        const text = reader.readText('data/text.txt');
        expect(text).toBe('café');

        const bytes = reader.readBytes('data/binary.bin');
        expect(Array.from(bytes)).toEqual([0, 1]);

        reader.close();
    });

    it('rejects reading a directory entry', async () => {
        const reader = await ArchiveReader.open(
            createTestZipFile({ 'nested/': '' })
        );

        expect(() => reader.readBytes('nested/')).toThrow(
            ArchiveDirectoryReadError
        );

        reader.close();
    });

    it('throws when reading a missing entry', async () => {
        const reader = await ArchiveReader.open(
            createTestZipFile({ 'only.txt': 'x' })
        );

        expect(() => reader.readText('missing.txt')).toThrow(
            ArchiveEntryNotFoundError
        );

        reader.close();
    });

    it('rejects duplicate normalized paths', async () => {
        await expect(
            ArchiveReader.open(
                createTestZipFile({
                    'foo/bar.txt': 'one',
                    'foo//bar.txt': 'two',
                })
            )
        ).rejects.toThrow(ArchiveDuplicatePathError);
    });

    it('rejects path traversal entries', async () => {
        await expect(
            ArchiveReader.open(createTestZipFile({ '../escape.txt': 'bad' }))
        ).rejects.toThrow(ArchivePathTraversalError);
    });

    it('rejects absolute path entries', async () => {
        await expect(
            ArchiveReader.open(createTestZipFile({ '/absolute.txt': 'bad' }))
        ).rejects.toThrow(ArchiveInvalidPathError);
    });

    it('rejects archives exceeding directory depth', async () => {
        const segments = Array.from(
            { length: MAX_ARCHIVE_DIRECTORY_DEPTH + 1 },
            (_, index) => `level-${index}`
        );
        const deepPath = `${segments.join('/')}/deep.txt`;

        await expect(
            ArchiveReader.open(createTestZipFile({ [deepPath]: 'deep' }))
        ).rejects.toThrow(ArchiveDepthExceededError);
    });

    it('rejects archives exceeding compressed size limit', async () => {
        const oversized = new File(
            [new Uint8Array(MAX_ARCHIVE_COMPRESSED_BYTES + 1)],
            'big.zip',
            { type: 'application/zip' }
        );

        await expect(ArchiveReader.open(oversized)).rejects.toThrow(
            ArchiveTooLargeError
        );
    });

    it('rejects archives exceeding per-entry uncompressed size', async () => {
        vi.resetModules();
        vi.doMock('../archive/archive-limits', () => ({
            MAX_ARCHIVE_COMPRESSED_BYTES: 50 * 1024 * 1024,
            MAX_ARCHIVE_UNCOMPRESSED_BYTES: 200 * 1024 * 1024,
            MAX_ARCHIVE_FILE_COUNT: 10_000,
            MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES: 4,
            MAX_ARCHIVE_PATH_LENGTH: 512,
            MAX_ARCHIVE_DIRECTORY_DEPTH: 32,
        }));

        const { ArchiveReader: LimitedArchiveReader } =
            await import('../archive/archive-reader');

        await expect(
            LimitedArchiveReader.open(
                createTestZipFile({ 'large.txt': '12345' })
            )
        ).rejects.toMatchObject({ code: 'ARCHIVE_ENTRY_TOO_LARGE' });

        vi.unmock('../archive/archive-limits');
        vi.resetModules();
    });

    it('rejects archives exceeding total uncompressed estimate', async () => {
        vi.resetModules();
        vi.doMock('../archive/archive-limits', () => ({
            MAX_ARCHIVE_COMPRESSED_BYTES: 50 * 1024 * 1024,
            MAX_ARCHIVE_UNCOMPRESSED_BYTES: 10,
            MAX_ARCHIVE_FILE_COUNT: 10_000,
            MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES: 10,
            MAX_ARCHIVE_PATH_LENGTH: 512,
            MAX_ARCHIVE_DIRECTORY_DEPTH: 32,
        }));

        const { ArchiveReader: LimitedArchiveReader } =
            await import('../archive/archive-reader');

        await expect(
            LimitedArchiveReader.open(
                createTestZipFile({
                    'a.txt': 'aaaaa',
                    'b.txt': 'bbbbb',
                    'c.txt': 'ccccc',
                })
            )
        ).rejects.toMatchObject({ code: 'ARCHIVE_EXTRACTION_TOO_LARGE' });

        vi.unmock('../archive/archive-limits');
        vi.resetModules();
    });

    it('rejects archives exceeding file count limit', async () => {
        vi.resetModules();
        vi.doMock('../archive/archive-limits', () => ({
            MAX_ARCHIVE_COMPRESSED_BYTES: 50 * 1024 * 1024,
            MAX_ARCHIVE_UNCOMPRESSED_BYTES: 200 * 1024 * 1024,
            MAX_ARCHIVE_FILE_COUNT: 2,
            MAX_ARCHIVE_ENTRY_UNCOMPRESSED_BYTES: 10 * 1024 * 1024,
            MAX_ARCHIVE_PATH_LENGTH: 512,
            MAX_ARCHIVE_DIRECTORY_DEPTH: 32,
        }));

        const { ArchiveReader: LimitedArchiveReader } =
            await import('../archive/archive-reader');

        await expect(
            LimitedArchiveReader.open(
                createTestZipFile({
                    'one.txt': '1',
                    'two.txt': '2',
                    'three.txt': '3',
                })
            )
        ).rejects.toMatchObject({ code: 'ARCHIVE_TOO_MANY_FILES' });

        vi.unmock('../archive/archive-limits');
        vi.resetModules();
    });

    it('rejects unsupported formats', async () => {
        const readerPromise = ArchiveReader.open(
            createRawZipFile(strToU8('not-a-zip-archive'))
        );

        await expect(readerPromise).rejects.toThrow(
            ArchiveUnsupportedFormatError
        );
    });

    it('rejects corrupted archives', async () => {
        const corrupted = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0xff, 0xff]);

        await expect(
            ArchiveReader.open(createRawZipFile(corrupted))
        ).rejects.toThrow(ArchiveCorruptedError);
    });

    it('rejects invalid UTF-8 file content when reading text', async () => {
        const reader = await ArchiveReader.open(
            createTestZipFile({
                'invalid.txt': new Uint8Array([0xff, 0xfe, 0xfd]),
            })
        );

        expect(() => reader.readText('invalid.txt')).toThrow(
            ArchiveInvalidUtf8ContentError
        );

        reader.close();
    });

    it('closes the reader and blocks subsequent operations', async () => {
        const reader = await ArchiveReader.open(
            createTestZipFile({ 'after-close.txt': 'value' })
        );

        reader.close();

        expect(() => reader.listEntries()).toThrow(ArchiveClosedError);
        expect(() => reader.has('after-close.txt')).toThrow(ArchiveClosedError);
        expect(() => reader.readText('after-close.txt')).toThrow(
            ArchiveClosedError
        );

        expect(() => reader.close()).not.toThrow();
    });

    it('indexes entries without reading file contents during open', async () => {
        const reader = await ArchiveReader.open(
            createTestZipFile({ 'lazy.txt': 'lazy-content' })
        );

        const entries = reader.listEntries();
        expect(entries).toHaveLength(1);
        expect(entries[0]?.sizeUncompressed).toBeGreaterThan(0);

        expect(reader.readText('lazy.txt')).toBe('lazy-content');

        reader.close();
    });
});
