import { strToU8, zipSync } from 'fflate';

export const createTestZipBytes = (
    files: Record<string, string | Uint8Array>
): Uint8Array => {
    const zippable: Record<string, Uint8Array> = {};

    for (const [path, content] of Object.entries(files)) {
        zippable[path] =
            typeof content === 'string' ? strToU8(content) : content;
    }

    return zipSync(zippable);
};

export const createTestZipFile = (
    files: Record<string, string | Uint8Array>,
    name = 'test.zip'
): File => {
    const bytes = createTestZipBytes(files);
    return new File([new Uint8Array(bytes)], name, { type: 'application/zip' });
};

export const createRawZipFile = (
    bytes: Uint8Array,
    name = 'test.zip'
): File => {
    return new File([new Uint8Array(bytes)], name, { type: 'application/zip' });
};
