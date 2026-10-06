export const IMPORT_SCHEMA_FILE_EXTENSIONS = [
    '.sql',
    '.dbml',
    '.json',
] as const;

export const IMPORT_PROJECT_ARCHIVE_EXTENSION = '.zip';

export const IMPORT_SCHEMA_FILE_ACCEPT = [
    ...IMPORT_SCHEMA_FILE_EXTENSIONS,
    IMPORT_PROJECT_ARCHIVE_EXTENSION,
].join(',');

export const isProjectArchiveFileName = (fileName: string): boolean =>
    fileName.toLowerCase().endsWith(IMPORT_PROJECT_ARCHIVE_EXTENSION);

export const isImportSchemaFileNameAllowed = (fileName: string): boolean => {
    const lowerFileName = fileName.toLowerCase();

    return (
        IMPORT_SCHEMA_FILE_EXTENSIONS.some((extension) =>
            lowerFileName.endsWith(extension)
        ) || isProjectArchiveFileName(lowerFileName)
    );
};
