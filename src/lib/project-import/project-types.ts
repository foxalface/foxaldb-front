export type ProjectFramework =
    | 'laravel'
    | 'prisma'
    | 'drizzle'
    | 'rails'
    | 'entity_framework_core'
    | 'django';

export type ParserLocation = 'local' | 'remote';

export type ProjectDetectionConfidence = 'high' | 'medium' | 'low';

export type ProjectEvidenceCode =
    | 'laravel_artisan'
    | 'laravel_composer'
    | 'laravel_migrations'
    | 'laravel_bootstrap'
    | 'laravel_providers'
    | 'laravel_source_signature'
    | 'prisma_schema'
    | 'prisma_package_json'
    | 'prisma_migrations'
    | 'prisma_schema_signature'
    | 'drizzle_config'
    | 'drizzle_journal'
    | 'drizzle_sql'
    | 'drizzle_package_json'
    | 'drizzle_journal_signature'
    | 'rails_schema_rb'
    | 'rails_gemfile'
    | 'rails_application_rb'
    | 'rails_migrations'
    | 'rails_schema_signature'
    | 'ef_model_snapshot'
    | 'ef_migrations'
    | 'ef_csproj'
    | 'ef_snapshot_signature'
    | 'django_manage_py'
    | 'django_migrations'
    | 'django_dependencies'
    | 'django_settings'
    | 'django_migration_signature';

export interface ProjectPathMapping {
    physicalPath: string;
    logicalPath: string;
}

export interface ProjectEvidence {
    code: ProjectEvidenceCode;
    weight: number;
    path?: string;
}

export interface ProjectDetectionCandidate {
    framework: ProjectFramework;
    rootPath: string;
    score: number;
    confidence: ProjectDetectionConfidence;
    evidence: ProjectEvidence[];
    relevantFiles: string[];
    parserLocation: ParserLocation;
    usesVirtualLayout?: boolean;
    pathMappings?: ProjectPathMapping[];
}

export interface ProjectFileBundleEntry {
    relativePath: string;
    content: string;
}

export interface ProjectFileBundle {
    framework: ProjectFramework;
    rootPath: string;
    files: ProjectFileBundleEntry[];
    diagramNameHint?: string;
}

export interface ProjectDatabaseGroup {
    id: string;
    framework: ProjectFramework;
    label: string;
    rootPath: string;
    fileMappings: ProjectPathMapping[];
    supportingFileMappings?: ProjectPathMapping[];
    evidence: ProjectEvidence[];
    confidence: ProjectDetectionConfidence;
    isRecommended?: boolean;
    summaryPath?: string;
}

export type ProjectDatabaseGroupAnalysisStatus = 'single' | 'multiple';

export interface ProjectDatabaseGroupAnalysis {
    groups: ProjectDatabaseGroup[];
    recommendedGroup: ProjectDatabaseGroup | null;
    status: ProjectDatabaseGroupAnalysisStatus;
}

export type ProjectArchiveAnalysisStatus =
    | 'detected'
    | 'ambiguous'
    | 'unsupported';

export interface ProjectArchiveAnalysis {
    candidates: ProjectDetectionCandidate[];
    recommendedCandidate: ProjectDetectionCandidate | null;
    status: ProjectArchiveAnalysisStatus;
}
