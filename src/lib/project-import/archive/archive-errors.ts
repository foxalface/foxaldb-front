export abstract class ArchiveError extends Error {
    abstract readonly code: string;

    constructor(message: string) {
        super(message);
        this.name = new.target.name;
    }
}

export class ArchiveTooLargeError extends ArchiveError {
    readonly code = 'ARCHIVE_TOO_LARGE';

    constructor(
        public readonly sizeBytes: number,
        public readonly maxBytes: number
    ) {
        super(
            `Archive size ${sizeBytes} bytes exceeds maximum ${maxBytes} bytes.`
        );
    }
}

export class ArchiveExtractionTooLargeError extends ArchiveError {
    readonly code = 'ARCHIVE_EXTRACTION_TOO_LARGE';

    constructor(
        public readonly sizeBytes: number,
        public readonly maxBytes: number
    ) {
        super(
            `Estimated extracted size ${sizeBytes} bytes exceeds maximum ${maxBytes} bytes.`
        );
    }
}

export class ArchiveTooManyFilesError extends ArchiveError {
    readonly code = 'ARCHIVE_TOO_MANY_FILES';

    constructor(
        public readonly fileCount: number,
        public readonly maxFiles: number
    ) {
        super(
            `Archive contains ${fileCount} entries, exceeding maximum ${maxFiles}.`
        );
    }
}

export class ArchivePathTraversalError extends ArchiveError {
    readonly code = 'ARCHIVE_PATH_TRAVERSAL';

    constructor(public readonly path: string) {
        super(`Archive entry path is not allowed: ${path}`);
    }
}

export class ArchiveDuplicatePathError extends ArchiveError {
    readonly code = 'ARCHIVE_DUPLICATE_PATH';

    constructor(
        public readonly path: string,
        public readonly duplicateOf: string
    ) {
        super(
            `Duplicate archive path "${path}" (also declared as "${duplicateOf}").`
        );
    }
}

export class ArchiveEntryTooLargeError extends ArchiveError {
    readonly code = 'ARCHIVE_ENTRY_TOO_LARGE';

    constructor(
        public readonly path: string,
        public readonly sizeBytes: number,
        public readonly maxBytes: number
    ) {
        super(
            `Archive entry "${path}" size ${sizeBytes} bytes exceeds maximum ${maxBytes} bytes.`
        );
    }
}

export class ArchiveInvalidPathError extends ArchiveError {
    readonly code = 'ARCHIVE_INVALID_PATH';

    constructor(
        public readonly path: string,
        public readonly reason: string
    ) {
        super(`Invalid archive path "${path}": ${reason}`);
    }
}

export class ArchiveInvalidUtf8PathError extends ArchiveError {
    readonly code = 'ARCHIVE_INVALID_UTF8_PATH';

    constructor(public readonly path: string) {
        super(`Archive entry path is not valid UTF-8: ${path}`);
    }
}

export class ArchivePathTooLongError extends ArchiveError {
    readonly code = 'ARCHIVE_PATH_TOO_LONG';

    constructor(
        public readonly path: string,
        public readonly length: number,
        public readonly maxLength: number
    ) {
        super(
            `Archive path length ${length} exceeds maximum ${maxLength}: ${path}`
        );
    }
}

export class ArchiveDepthExceededError extends ArchiveError {
    readonly code = 'ARCHIVE_DEPTH_EXCEEDED';

    constructor(
        public readonly path: string,
        public readonly depth: number,
        public readonly maxDepth: number
    ) {
        super(
            `Archive path depth ${depth} exceeds maximum ${maxDepth}: ${path}`
        );
    }
}

export class ArchiveUnsupportedFormatError extends ArchiveError {
    readonly code = 'ARCHIVE_UNSUPPORTED_FORMAT';

    constructor(message = 'File is not a supported ZIP archive.') {
        super(message);
    }
}

export class ArchiveCorruptedError extends ArchiveError {
    readonly code = 'ARCHIVE_CORRUPTED';

    constructor(
        message = 'Archive is corrupted or could not be read.',
        public readonly cause?: unknown
    ) {
        super(message);
    }
}

export class ArchiveEntryNotFoundError extends ArchiveError {
    readonly code = 'ARCHIVE_ENTRY_NOT_FOUND';

    constructor(public readonly path: string) {
        super(`Archive entry not found: ${path}`);
    }
}

export class ArchiveClosedError extends ArchiveError {
    readonly code = 'ARCHIVE_CLOSED';

    constructor() {
        super('Archive reader is closed.');
    }
}

export class ArchiveDirectoryReadError extends ArchiveError {
    readonly code = 'ARCHIVE_DIRECTORY_READ';

    constructor(public readonly path: string) {
        super(`Cannot read directory entry as file content: ${path}`);
    }
}

export class ArchiveInvalidUtf8ContentError extends ArchiveError {
    readonly code = 'ARCHIVE_INVALID_UTF8_CONTENT';

    constructor(public readonly path: string) {
        super(`Archive entry content is not valid UTF-8: ${path}`);
    }
}
