import type {
    ProjectDetectionConfidence,
    ProjectEvidence,
    ProjectEvidenceCode,
} from '../project-types';

export const PROJECT_EVIDENCE_WEIGHTS: Record<ProjectEvidenceCode, number> = {
    laravel_artisan: 10,
    laravel_composer: 8,
    laravel_migrations: 6,
    laravel_bootstrap: 3,
    laravel_providers: 2,
    prisma_schema: 12,
    prisma_package_json: 6,
    prisma_migrations: 4,
    drizzle_config: 8,
    drizzle_journal: 6,
    drizzle_sql: 6,
    drizzle_package_json: 5,
    rails_schema_rb: 9,
    rails_gemfile: 7,
    rails_application_rb: 3,
    rails_migrations: 5,
    ef_model_snapshot: 10,
    ef_migrations: 6,
    ef_csproj: 5,
    django_manage_py: 8,
    django_migrations: 6,
    django_dependencies: 5,
    django_settings: 3,
};

export const STRONG_EVIDENCE_MIN_WEIGHT = 6;

export const CONFIDENCE_HIGH_MIN_SCORE = 12;
export const CONFIDENCE_MEDIUM_MIN_SCORE = 8;

export const isStrongEvidence = (evidence: ProjectEvidence): boolean =>
    evidence.weight >= STRONG_EVIDENCE_MIN_WEIGHT;

export const sumEvidenceScore = (evidence: ProjectEvidence[]): number =>
    evidence.reduce((total, item) => total + item.weight, 0);

export const resolveDetectionConfidence = (
    score: number,
    evidence: ProjectEvidence[]
): ProjectDetectionConfidence => {
    const hasStrongSignal = evidence.some(isStrongEvidence);

    if (score >= CONFIDENCE_HIGH_MIN_SCORE && hasStrongSignal) {
        return 'high';
    }

    if (score >= CONFIDENCE_MEDIUM_MIN_SCORE) {
        return 'medium';
    }

    return 'low';
};

export const isSelectableConfidence = (
    confidence: ProjectDetectionConfidence
): boolean => confidence === 'high' || confidence === 'medium';
