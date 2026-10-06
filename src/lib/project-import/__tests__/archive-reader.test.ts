import { describe, expect, it } from 'vitest';
import { strToU8 } from 'fflate';
import { ArchiveReader } from '../archive/archive-reader';
import {
    fixtureArchiveLimits,
    openFixtureArchive,
} from './fixtures/open-fixture-archive';
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
import { normalizeArchivePath } from '../archive/archive-utils';
import { createRawZipFile, createTestZipFile } from './fixtures/build-test-zip';

describe('normalizeArchivePath', () => {
    it('normalizes duplicate slashes', () => {
        expect(
            normalizeArchivePath('foo//bar/baz.txt', fixtureArchiveLimits)
        ).toBe('foo/bar/baz.txt');
    });

    it('normalizes backslashes', () => {
        expect(
            normalizeArchivePath('foo\\bar\\baz.txt', fixtureArchiveLimits)
        ).toBe('foo/bar/baz.txt');
    });

    it('removes dot segments', () => {
        expect(
            normalizeArchivePath('foo/./bar/./baz.txt', fixtureArchiveLimits)
        ).toBe('foo/bar/baz.txt');
    });

    it('preserves directory trailing slash', () => {
        expect(normalizeArchivePath('foo/bar/', fixtureArchiveLimits)).toBe(
            'foo/bar/'
        );
    });

    it('rejects path traversal', () => {
        expect(() =>
            normalizeArchivePath('../etc/passwd', fixtureArchiveLimits)
        ).toThrow(ArchivePathTraversalError);
    });

    it('rejects absolute paths', () => {
        expect(() =>
            normalizeArchivePath('/etc/passwd', fixtureArchiveLimits)
        ).toThrow(ArchiveInvalidPathError);
        expect(() =>
            normalizeArchivePath('C:\\windows\\system32', fixtureArchiveLimits)
        ).toThrow(ArchiveInvalidPathError);
    });
});

describe('ArchiveReader', () => {
    it('opens a valid archive and lists entries', async () => {
        const reader = await openFixtureArchive(
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
        const reader = await openFixtureArchive(
            createTestZipFile({ 'docs/guide.md': '# Guide' })
        );

        expect(reader.has('docs/guide.md')).toBe(true);
        expect(reader.has('docs\\guide.md')).toBe(true);
        expect(reader.has('missing.txt')).toBe(false);

        reader.close();
    });

    it('reads file bytes and text on demand', async () => {
        const reader = await openFixtureArchive(
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
        const reader = await openFixtureArchive(
            createTestZipFile({ 'nested/': '' })
        );

        expect(() => reader.readBytes('nested/')).toThrow(
            ArchiveDirectoryReadError
        );

        reader.close();
    });

    it('throws when reading a missing entry', async () => {
        const reader = await openFixtureArchive(
            createTestZipFile({ 'only.txt': 'x' })
        );

        expect(() => reader.readText('missing.txt')).toThrow(
            ArchiveEntryNotFoundError
        );

        reader.close();
    });

    it('rejects duplicate normalized paths', async () => {
        await expect(
            openFixtureArchive(
                createTestZipFile({
                    'foo/bar.txt': 'one',
                    'foo//bar.txt': 'two',
                })
            )
        ).rejects.toThrow(ArchiveDuplicatePathError);
    });

    it('rejects path traversal entries', async () => {
        await expect(
            openFixtureArchive(createTestZipFile({ '../escape.txt': 'bad' }))
        ).rejects.toThrow(ArchivePathTraversalError);
    });

    it('rejects absolute path entries', async () => {
        await expect(
            openFixtureArchive(createTestZipFile({ '/absolute.txt': 'bad' }))
        ).rejects.toThrow(ArchiveInvalidPathError);
    });

    it('rejects archives exceeding directory depth', async () => {
        const segments = Array.from(
            { length: fixtureArchiveLimits.maxDepth + 1 },
            (_, index) => `level-${index}`
        );
        const deepPath = `${segments.join('/')}/deep.txt`;

        await expect(
            openFixtureArchive(createTestZipFile({ [deepPath]: 'deep' }))
        ).rejects.toThrow(ArchiveDepthExceededError);
    });

    it('rejects archives exceeding compressed size limit', async () => {
        const oversized = new File(
            [new Uint8Array(fixtureArchiveLimits.compressedMaxBytes + 1)],
            'big.zip',
            { type: 'application/zip' }
        );

        await expect(openFixtureArchive(oversized)).rejects.toThrow(
            ArchiveTooLargeError
        );
    });

    it('rejects archives exceeding per-entry uncompressed size', async () => {
        await expect(
            ArchiveReader.open(createTestZipFile({ 'large.txt': '12345' }), {
                ...fixtureArchiveLimits,
                maxEntryBytes: 4,
            })
        ).rejects.toMatchObject({ code: 'ARCHIVE_ENTRY_TOO_LARGE' });
    });

    it('rejects archives exceeding total uncompressed estimate', async () => {
        await expect(
            ArchiveReader.open(
                createTestZipFile({
                    'a.txt': 'aaaaa',
                    'b.txt': 'bbbbb',
                    'c.txt': 'ccccc',
                }),
                {
                    ...fixtureArchiveLimits,
                    uncompressedMaxBytes: 10,
                    maxEntryBytes: 10,
                }
            )
        ).rejects.toMatchObject({ code: 'ARCHIVE_EXTRACTION_TOO_LARGE' });
    });

    it('rejects archives exceeding file count limit', async () => {
        await expect(
            ArchiveReader.open(
                createTestZipFile({
                    'one.txt': '1',
                    'two.txt': '2',
                    'three.txt': '3',
                }),
                {
                    ...fixtureArchiveLimits,
                    maxEntries: 2,
                }
            )
        ).rejects.toMatchObject({ code: 'ARCHIVE_TOO_MANY_FILES' });
    });

    it('rejects unsupported formats', async () => {
        const readerPromise = openFixtureArchive(
            createRawZipFile(strToU8('not-a-zip-archive'))
        );

        await expect(readerPromise).rejects.toThrow(
            ArchiveUnsupportedFormatError
        );
    });

    it('rejects corrupted archives', async () => {
        const corrupted = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0xff, 0xff]);

        await expect(
            openFixtureArchive(createRawZipFile(corrupted))
        ).rejects.toThrow(ArchiveCorruptedError);
    });

    it('rejects invalid UTF-8 file content when reading text', async () => {
        const reader = await openFixtureArchive(
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
        const reader = await openFixtureArchive(
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
        const reader = await openFixtureArchive(
            createTestZipFile({ 'lazy.txt': 'lazy-content' })
        );

        const entries = reader.listEntries();
        expect(entries).toHaveLength(1);
        expect(entries[0]?.sizeUncompressed).toBeGreaterThan(0);

        expect(reader.readText('lazy.txt')).toBe('lazy-content');

        reader.close();
    });
});
