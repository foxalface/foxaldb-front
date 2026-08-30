export type ProjectImportErrorCode =
    | 'project_parser_unavailable'
    | 'project_import_unauthenticated'
    | 'project_import_validation_rejected'
    | 'unsupported_project_import_api_version'
    | 'malformed_project_import_payload'
    | 'inconsistent_project_import_framework'
    | 'project_import_network_failure'
    | 'project_import_remote_failure'
    | 'invalid_remote_project_framework';

export class ProjectImportError extends Error {
    readonly code: ProjectImportErrorCode;

    constructor(message: string, code: ProjectImportErrorCode) {
        super(message);
        this.name = 'ProjectImportError';
        this.code = code;
    }
}

export class ProjectImportParserUnavailableError extends ProjectImportError {
    constructor(
        message = 'Project parser is not available for this framework.'
    ) {
        super(message, 'project_parser_unavailable');
        this.name = 'ProjectImportParserUnavailableError';
    }
}

export class ProjectImportUnauthenticatedError extends ProjectImportError {
    constructor(message = 'Sign in is required to import this project.') {
        super(message, 'project_import_unauthenticated');
        this.name = 'ProjectImportUnauthenticatedError';
    }
}

export class ProjectImportValidationRejectedError extends ProjectImportError {
    readonly path?: string;

    constructor(message: string, path?: string) {
        super(message, 'project_import_validation_rejected');
        this.name = 'ProjectImportValidationRejectedError';
        this.path = path;
    }
}

export class UnsupportedProjectImportApiVersionError extends ProjectImportError {
    readonly receivedVersion: unknown;

    constructor(receivedVersion: unknown) {
        super(
            'The project import response uses an unsupported API version.',
            'unsupported_project_import_api_version'
        );
        this.name = 'UnsupportedProjectImportApiVersionError';
        this.receivedVersion = receivedVersion;
    }
}

export class MalformedProjectImportPayloadError extends ProjectImportError {
    constructor(
        message = 'The project import response could not be normalized.'
    ) {
        super(message, 'malformed_project_import_payload');
        this.name = 'MalformedProjectImportPayloadError';
    }
}

export class InconsistentProjectImportFrameworkError extends ProjectImportError {
    readonly expectedFramework: string;
    readonly receivedFramework: string;

    constructor(expectedFramework: string, receivedFramework: string) {
        super(
            'The project import response framework does not match the requested framework.',
            'inconsistent_project_import_framework'
        );
        this.name = 'InconsistentProjectImportFrameworkError';
        this.expectedFramework = expectedFramework;
        this.receivedFramework = receivedFramework;
    }
}

export class ProjectImportNetworkError extends ProjectImportError {
    constructor(
        message = 'The project import request could not be completed.'
    ) {
        super(message, 'project_import_network_failure');
        this.name = 'ProjectImportNetworkError';
    }
}

export class ProjectImportRemoteFailureError extends ProjectImportError {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message, 'project_import_remote_failure');
        this.name = 'ProjectImportRemoteFailureError';
        this.status = status;
    }
}

export class InvalidRemoteProjectFrameworkError extends ProjectImportError {
    readonly framework: string;

    constructor(framework: string) {
        super(
            'Only remote project frameworks can be sent to the project import API.',
            'invalid_remote_project_framework'
        );
        this.name = 'InvalidRemoteProjectFrameworkError';
        this.framework = framework;
    }
}
