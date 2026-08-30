import { isZipArchiveBytes } from './archive/archive-utils';

export const readFileHeaderBytes = async (
    file: File,
    length: number
): Promise<Uint8Array> => {
    const slice = file.slice(0, length);
    const buffer = await slice.arrayBuffer();
    return new Uint8Array(buffer);
};

export const isZipArchiveFile = async (file: File): Promise<boolean> => {
    const bytes = await readFileHeaderBytes(file, 4);
    return isZipArchiveBytes(bytes);
};
