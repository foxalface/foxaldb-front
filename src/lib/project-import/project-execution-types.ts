import type { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type {
    ProjectDetectionCandidate,
    ProjectFileBundle,
    ProjectFramework,
} from './project-types';

export type ProjectImportDiagnosticSeverity = 'info' | 'warning' | 'error';

export interface ProjectImportDiagnostic {
    severity: ProjectImportDiagnosticSeverity;
    code: string;
    message: string;
    path?: string;
}

export interface ProjectImportInput {
    candidate: ProjectDetectionCandidate;
    bundle: ProjectFileBundle;
    targetDatabaseType: DatabaseType;
}

export interface ProjectImportResult {
    diagram: Diagram;
    framework: ProjectFramework;
    diagnostics: ProjectImportDiagnostic[];
}

export const PROJECT_IMPORT_API_VERSION = '1';

export const REMOTE_PROJECT_FRAMEWORKS = [
    'laravel',
    'entity_framework_core',
    'django',
] as const satisfies readonly ProjectFramework[];

export type RemoteProjectFramework = (typeof REMOTE_PROJECT_FRAMEWORKS)[number];

export const LOCAL_PROJECT_FRAMEWORKS = [
    'prisma',
    'drizzle',
    'rails',
] as const satisfies readonly ProjectFramework[];

export type LocalProjectFramework = (typeof LOCAL_PROJECT_FRAMEWORKS)[number];
