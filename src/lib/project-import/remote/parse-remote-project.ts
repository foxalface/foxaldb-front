import type { DatabaseType } from '@/lib/domain/database-type';
import { apiRequest, ApiError } from '@/lib/api/client';
import type { ProjectFileBundle } from '../project-types';
import type {
    ProjectImportResult,
    RemoteProjectFramework,
} from '../project-execution-types';
import { REMOTE_PROJECT_FRAMEWORKS } from '../project-execution-types';
import {
    InvalidRemoteProjectFrameworkError,
    ProjectImportNetworkError,
    ProjectImportParserUnavailableError,
    ProjectImportRemoteFailureError,
    ProjectImportUnauthenticatedError,
    ProjectImportValidationRejectedError,
} from '../project-import-errors';
import type { ProjectFramework } from '../project-types';
import { normalizeProjectImportPayload } from '../normalize-project-import-payload';

export interface ParseRemoteProjectParams {
    framework: ProjectFramework;
    files: ProjectFileBundle['files'];
    rootPath: string;
    targetDatabaseType: DatabaseType;
}

interface RemoteProjectImportRequestBody {
    framework: RemoteProjectFramework;
    files: Array<{
        path: string;
        content: string;
    }>;
    rootPath?: string;
    targetDatabaseType: DatabaseType;
}

const isRemoteProjectFramework = (
    framework: ProjectFramework
): framework is RemoteProjectFramework =>
    REMOTE_PROJECT_FRAMEWORKS.includes(framework as RemoteProjectFramework);

const getApiErrorCode = (payload: unknown): string | null => {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'code' in payload &&
        typeof payload.code === 'string'
    ) {
        return payload.code;
    }

    return null;
};

const getApiErrorPath = (payload: unknown): string | undefined => {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'path' in payload &&
        typeof payload.path === 'string'
    ) {
        return payload.path;
    }

    return undefined;
};

export const mapRemoteProjectImportError = (error: unknown): never => {
    if (error instanceof ApiError) {
        const code = getApiErrorCode(error.payload);

        if (error.status === 401) {
            throw new ProjectImportUnauthenticatedError(error.message);
        }

        if (error.status === 422) {
            throw new ProjectImportValidationRejectedError(
                error.message,
                getApiErrorPath(error.payload)
            );
        }

        if (error.status === 501 && code === 'project_parser_unavailable') {
            throw new ProjectImportParserUnavailableError(error.message);
        }

        throw new ProjectImportRemoteFailureError(error.message, error.status);
    }

    if (error instanceof TypeError) {
        throw new ProjectImportNetworkError();
    }

    throw error;
};

export const parseRemoteProject = async (
    params: ParseRemoteProjectParams
): Promise<ProjectImportResult> => {
    if (!isRemoteProjectFramework(params.framework)) {
        throw new InvalidRemoteProjectFrameworkError(params.framework);
    }

    const body: RemoteProjectImportRequestBody = {
        framework: params.framework,
        files: params.files.map((file) => ({
            path: file.relativePath,
            content: file.content,
        })),
        targetDatabaseType: params.targetDatabaseType,
    };

    if (params.rootPath.length > 0) {
        body.rootPath = params.rootPath;
    }

    try {
        const response = await apiRequest<{ data: unknown }>(
            '/project-import/parse',
            {
                method: 'POST',
                data: body,
            }
        );

        return normalizeProjectImportPayload(response, params.framework);
    } catch (error) {
        return mapRemoteProjectImportError(error);
    }
};
