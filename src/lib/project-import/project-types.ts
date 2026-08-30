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
    | 'prisma_schema'
    | 'prisma_package_json'
    | 'prisma_migrations'
    | 'drizzle_config'
    | 'drizzle_journal'
    | 'drizzle_sql'
    | 'drizzle_package_json'
    | 'rails_schema_rb'
    | 'rails_gemfile'
    | 'rails_application_rb'
    | 'rails_migrations'
    | 'ef_model_snapshot'
    | 'ef_migrations'
    | 'ef_csproj'
    | 'django_manage_py'
    | 'django_migrations'
    | 'django_dependencies'
    | 'django_settings';

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
}

export interface ProjectFileBundleEntry {
    relativePath: string;
    content: string;
}

export interface ProjectFileBundle {
    framework: ProjectFramework;
    rootPath: string;
    files: ProjectFileBundleEntry[];
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
