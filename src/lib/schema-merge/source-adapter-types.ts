import type { DatabaseEdition } from '@/lib/domain/database-edition';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { ImportDetectionAnalysis } from '@/dialogs/common/import-schema/analyze-import-content';
import type { ImportFormat } from '@/lib/import/types';
import type { ProjectImportErrorCode } from '@/lib/project-import/project-import-errors';
import type {
    ProjectArchiveAnalysis,
    ProjectDatabaseGroupAnalysis,
    ProjectDetectionCandidate,
    ProjectFramework,
} from '@/lib/project-import/project-types';
import type { UploadCapabilities } from '@/lib/upload-capabilities/types';
import type {
    SchemaMergeCompareSource,
    SchemaMergeSourceKind,
} from './source-kinds';

/**
 * Future wizard inputs. Core parsing stays free of React.
 * Archive inspection still receives a `File` because `ArchiveReader` does.
 */
export type SchemaMergeSourceInput =
    | {
          readonly type: 'text';
          readonly content: string;
      }
    | {
          readonly type: 'text_file';
          readonly file: File;
      }
    | {
          readonly type: 'archive';
          readonly file: File;
      };

/**
 * Caller-owned resolution from a previous preparation result.
 * Nothing is stored on the module between calls.
 */
export interface SchemaMergeSourceResolution {
    sourceDialect?: DatabaseType;
    projectCandidateKey?: string;
    databaseGroupId?: string;
}

export interface PrepareSchemaMergeSourceContext {
    currentDiagram: {
        databaseType: DatabaseType;
        databaseEdition?: DatabaseEdition;
    };
    resolution?: SchemaMergeSourceResolution;
    /**
     * When omitted, limits come from `resolveUploadCapabilities()`.
     * That function already substitutes the conservative safety ceiling
     * if the public capabilities endpoint cannot be reached.
     */
    uploadCapabilities?: UploadCapabilities;
}

export interface SchemaMergeReadySource {
    status: 'ready';
    incomingDiagram: Diagram;
    source: SchemaMergeCompareSource;
    detectedFormat: ImportFormat | null;
    detectedFramework: ProjectFramework | null;
    detectedDatabaseType: DatabaseType;
}

export interface SchemaMergeNeedsDialectResolution {
    status: 'needs_dialect_resolution';
    analysis: ImportDetectionAnalysis;
}

export interface SchemaMergeNeedsProjectResolution {
    status: 'needs_project_resolution';
    analysis: ProjectArchiveAnalysis;
    candidates: ProjectDetectionCandidate[];
}

export interface SchemaMergeNeedsDatabaseGroupResolution {
    status: 'needs_database_group_resolution';
    sourceKind: SchemaMergeSourceKind;
    framework: ProjectFramework;
    candidate: ProjectDetectionCandidate;
    analysis: ProjectDatabaseGroupAnalysis;
}

export type SchemaMergeUnsupportedCode =
    | 'unable_to_detect'
    | 'unsupported_source'
    | 'unsupported_file_extension';

export interface SchemaMergeUnsupportedSource {
    status: 'unsupported';
    code: SchemaMergeUnsupportedCode;
}

export type SchemaMergeInvalidCode =
    | 'empty_content'
    | 'malformed_source'
    | 'malformed_archive'
    | 'unreadable_file'
    | 'archive_input_required'
    | 'unknown_project_candidate'
    | 'unknown_database_group'
    | 'invalid_dialect_resolution';

export interface SchemaMergeInvalidSource {
    status: 'invalid';
    code: SchemaMergeInvalidCode;
    archiveCode?: string;
}

export interface SchemaMergeDatabaseTypeMismatch {
    status: 'database_type_mismatch';
    sourceKind: SchemaMergeSourceKind;
    currentDatabaseType: DatabaseType;
    detectedDatabaseType: DatabaseType;
}

export type SchemaMergeFileTooLargeLimit =
    | 'text'
    | 'archive_compressed'
    | 'archive_uncompressed'
    | 'archive_entry'
    | 'archive_entry_count';

export interface SchemaMergeFileTooLarge {
    status: 'file_too_large';
    limit: SchemaMergeFileTooLargeLimit;
    sizeBytes: number;
    maxBytes: number;
}

export interface SchemaMergeProjectParseFailure {
    status: 'project_parse_failure';
    code: ProjectImportErrorCode;
    parserLocation: 'local' | 'remote';
    path?: string;
}

export type SchemaMergeSourcePreparationResult =
    | SchemaMergeReadySource
    | SchemaMergeNeedsDialectResolution
    | SchemaMergeNeedsProjectResolution
    | SchemaMergeNeedsDatabaseGroupResolution
    | SchemaMergeUnsupportedSource
    | SchemaMergeInvalidSource
    | SchemaMergeDatabaseTypeMismatch
    | SchemaMergeFileTooLarge
    | SchemaMergeProjectParseFailure;
