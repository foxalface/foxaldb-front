import { normalizeDiagramFromApi } from '@/lib/api/normalize-diagram-from-api';
import type { Diagram } from '@/lib/domain/diagram';
import type {
    ProjectImportDiagnostic,
    ProjectImportDiagnosticSeverity,
    ProjectImportResult,
} from './project-execution-types';
import { PROJECT_IMPORT_API_VERSION } from './project-execution-types';
import type { ProjectFramework } from './project-types';
import {
    InconsistentProjectImportFrameworkError,
    MalformedProjectImportPayloadError,
    UnsupportedProjectImportApiVersionError,
} from './project-import-errors';

const SUPPORTED_FRAMEWORKS: readonly ProjectFramework[] = [
    'laravel',
    'prisma',
    'drizzle',
    'rails',
    'entity_framework_core',
    'django',
];

const SUPPORTED_DIAGNOSTIC_SEVERITIES: readonly ProjectImportDiagnosticSeverity[] =
    ['info', 'warning', 'error'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isSupportedFramework = (value: unknown): value is ProjectFramework =>
    typeof value === 'string' &&
    (SUPPORTED_FRAMEWORKS as readonly string[]).includes(value);

const normalizeDiagnostic = (value: unknown): ProjectImportDiagnostic => {
    if (!isRecord(value)) {
        throw new MalformedProjectImportPayloadError();
    }

    const severity = value.severity;
    const code = value.code;
    const message = value.message;
    const path = value.path;

    if (
        typeof severity !== 'string' ||
        !(SUPPORTED_DIAGNOSTIC_SEVERITIES as readonly string[]).includes(
            severity
        )
    ) {
        throw new MalformedProjectImportPayloadError();
    }

    if (typeof code !== 'string' || code.length === 0) {
        throw new MalformedProjectImportPayloadError();
    }

    if (typeof message !== 'string' || message.length === 0) {
        throw new MalformedProjectImportPayloadError();
    }

    if (path !== undefined && typeof path !== 'string') {
        throw new MalformedProjectImportPayloadError();
    }

    return {
        severity: severity as ProjectImportDiagnosticSeverity,
        code,
        message,
        path,
    };
};

const validateProjectImportDiagramStructure = (value: unknown): void => {
    if (!isRecord(value)) {
        throw new MalformedProjectImportPayloadError();
    }

    if (typeof value.name !== 'string' || value.name.length === 0) {
        throw new MalformedProjectImportPayloadError();
    }

    if (
        typeof value.databaseType !== 'string' ||
        value.databaseType.length === 0
    ) {
        throw new MalformedProjectImportPayloadError();
    }

    if (!Array.isArray(value.tables)) {
        throw new MalformedProjectImportPayloadError();
    }

    if (!Array.isArray(value.relationships)) {
        throw new MalformedProjectImportPayloadError();
    }

    for (const table of value.tables) {
        if (!isRecord(table)) {
            throw new MalformedProjectImportPayloadError();
        }

        if (typeof table.id !== 'string' || typeof table.name !== 'string') {
            throw new MalformedProjectImportPayloadError();
        }

        if (!Array.isArray(table.fields)) {
            throw new MalformedProjectImportPayloadError();
        }

        for (const field of table.fields) {
            if (!isRecord(field)) {
                throw new MalformedProjectImportPayloadError();
            }

            if (
                typeof field.id !== 'string' ||
                typeof field.name !== 'string'
            ) {
                throw new MalformedProjectImportPayloadError();
            }

            if (!isRecord(field.type) || typeof field.type.id !== 'string') {
                throw new MalformedProjectImportPayloadError();
            }
        }
    }
};

const normalizeDiagramPayload = (value: unknown): Diagram => {
    validateProjectImportDiagramStructure(value);

    return normalizeDiagramFromApi({ content: value });
};

export const normalizeProjectImportPayload = (
    payload: unknown,
    expectedFramework: ProjectFramework
): ProjectImportResult => {
    if (!isRecord(payload)) {
        throw new MalformedProjectImportPayloadError();
    }

    const data = payload.data;

    if (!isRecord(data)) {
        throw new MalformedProjectImportPayloadError();
    }

    const apiVersion = data.apiVersion;

    if (apiVersion === undefined || apiVersion === null) {
        throw new UnsupportedProjectImportApiVersionError(apiVersion);
    }

    if (apiVersion !== PROJECT_IMPORT_API_VERSION) {
        throw new UnsupportedProjectImportApiVersionError(apiVersion);
    }

    const framework = data.framework;

    if (!isSupportedFramework(framework)) {
        throw new MalformedProjectImportPayloadError();
    }

    if (framework !== expectedFramework) {
        throw new InconsistentProjectImportFrameworkError(
            expectedFramework,
            framework
        );
    }

    if (!('diagram' in data)) {
        throw new MalformedProjectImportPayloadError();
    }

    const diagram = normalizeDiagramPayload(data.diagram);

    const diagnosticsValue = data.diagnostics;

    if (!Array.isArray(diagnosticsValue)) {
        throw new MalformedProjectImportPayloadError();
    }

    const diagnostics = diagnosticsValue.map(normalizeDiagnostic);

    return {
        diagram,
        framework,
        diagnostics,
    };
};
