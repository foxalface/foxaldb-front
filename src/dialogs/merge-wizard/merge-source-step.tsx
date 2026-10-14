import React, { useId, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import {
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Spinner } from '@/components/spinner/spinner';
import { WizardCheckboxOption } from '@/dialogs/common/wizard-checkbox-option';
import { WIZARD_DIALOG_BODY_CLASS } from '@/dialogs/common/wizard-dialog-size';
import { WizardSchemaSourceField } from '@/dialogs/common/import-schema/wizard-schema-source-field';
import { DialectMismatchPanel } from '@/dialogs/common/import-schema/dialect-mismatch-panel';
import { DialectResolutionPanel } from '@/dialogs/common/import-schema/dialect-resolution-panel';
import { ProjectAmbiguityPanel } from '@/dialogs/common/import-schema/project-ambiguity-panel';
import { ProjectDatabaseGroupPanel } from '@/dialogs/common/import-schema/project-database-group-panel';
import type { DatabaseType } from '@/lib/domain/database-type';
import { getSelectableCandidates } from '@/lib/project-import/detection/detect-project';
import { getProjectCandidateKey } from '@/lib/project-import/framework-labels';
import type { SchemaMergeCompareFailure } from '@/lib/api/schema-merge-compare';
import type { SchemaMergeSourcePreparationResult } from '@/lib/schema-merge/source-adapter-types';
import { useTranslation } from 'react-i18next';
import { buildDetectionAnalysisForMergeReady } from '@/dialogs/common/import-schema/build-detection-analysis-for-merge-ready';
import { DetectionSummary } from '@/dialogs/common/import-schema/detection-summary';
import { ProjectDetectionSummary } from '@/dialogs/common/import-schema/project-detection-summary';
import { mergeCompareErrorKey } from './merge-compare-error';
import { InvalidDiagramJsonDetectionPanel } from '@/dialogs/common/import-schema/diagram-json-parse-error';
import { mergeSourcePreparationErrorKey } from './merge-source-preparation-message';
import { mergeUnsupportedDetectionAnalysis } from './merge-source-unsupported-detection';

export interface MergeSourceStepProps {
    text: string;
    fileName: string | null;
    fileErrorKey?: string | null;
    preparation: SchemaMergeSourcePreparationResult | null;
    isAnalyzing: boolean;
    isComparing: boolean;
    unavailable: boolean;
    canCompare: boolean;
    includeDeletions: boolean;
    currentDatabaseType: DatabaseType;
    sourceDialect: DatabaseType | null;
    projectCandidateKey: string | null;
    databaseGroupId: string | null;
    compareError: SchemaMergeCompareFailure | null;
    isAuthenticated: boolean;
    onTextChange: (value: string) => void;
    onFileSelected: (file: File) => void;
    onResolveDialect: (databaseType: DatabaseType) => void;
    onResolveProject: (candidateKey: string) => void;
    onResolveDatabaseGroup: (databaseGroupId: string) => void;
    onIncludeDeletionsChange: (includeDeletions: boolean) => void;
    onCompare: () => void;
    onCancel: () => void;
    hasCachedCompare: boolean;
}

export const MergeSourceStep: React.FC<MergeSourceStepProps> = ({
    text,
    fileName,
    fileErrorKey = null,
    preparation,
    isAnalyzing,
    isComparing,
    unavailable,
    canCompare,
    includeDeletions,
    currentDatabaseType,
    sourceDialect,
    projectCandidateKey,
    databaseGroupId,
    compareError,
    isAuthenticated,
    onTextChange,
    onFileSelected,
    onResolveDialect,
    onResolveProject,
    onResolveDatabaseGroup,
    onIncludeDeletionsChange,
    onCompare,
    onCancel,
    hasCachedCompare,
}) => {
    const { t } = useTranslation();
    const deletionsId = useId();
    const inputsLocked = unavailable || isComparing;
    const preparationErrorKey = mergeSourcePreparationErrorKey(preparation);
    const showInvalidDiagramJsonError =
        preparation?.status === 'invalid' &&
        preparation.code === 'invalid_diagram_json';
    const compareErrorKey = compareError
        ? mergeCompareErrorKey(compareError)
        : null;

    const projectDetectionCandidate = useMemo(() => {
        if (!preparation || preparation.status !== 'needs_project_resolution') {
            return null;
        }

        return (
            preparation.analysis.recommendedCandidate ??
            getSelectableCandidates(preparation.candidates)[0] ??
            null
        );
    }, [preparation]);

    const readyDetectionAnalysis = useMemo(() => {
        if (preparation?.status !== 'ready') {
            return null;
        }

        return buildDetectionAnalysisForMergeReady(preparation);
    }, [preparation]);

    const readyProjectCandidate = useMemo(() => {
        if (preparation?.status !== 'ready') {
            return null;
        }

        return preparation.projectCandidate ?? null;
    }, [preparation]);

    const unsupportedDetectionAnalysis = useMemo(
        () =>
            mergeUnsupportedDetectionAnalysis(
                preparation,
                text,
                currentDatabaseType,
                sourceDialect
            ),
        [preparation, text, currentDatabaseType, sourceDialect]
    );

    return (
        <>
            <DialogHeader className="shrink-0">
                <DialogTitle>{t('merge_wizard.title')}</DialogTitle>
            </DialogHeader>

            <div
                className="min-h-0 flex-1 overflow-y-auto"
                data-testid="merge-wizard-source-step"
                data-source-dialect={sourceDialect ?? ''}
                data-project-candidate={projectCandidateKey ?? ''}
                data-database-group={databaseGroupId ?? ''}
                data-cached-compare={hasCachedCompare ? 'true' : 'false'}
            >
                <div className={WIZARD_DIALOG_BODY_CLASS}>
                    {unavailable ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {t('merge_wizard.unavailable')}
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <WizardSchemaSourceField
                        label={t('merge_wizard.source_label')}
                        placeholder={t(
                            'new_diagram_dialog.import_schema.source_placeholder'
                        )}
                        value={text}
                        onValueChange={onTextChange}
                        selectedFileName={fileName}
                        onFileSelected={onFileSelected}
                        disabled={inputsLocked}
                        chooseFileAriaLabel={t('merge_wizard.choose_file')}
                        changeFileAriaLabel={t(
                            'merge_wizard.change_file_aria',
                            {
                                name: fileName ?? '',
                            }
                        )}
                        fileErrorMessage={fileErrorKey ? t(fileErrorKey) : null}
                        privacyContext="merge"
                    />

                    {isAnalyzing ? (
                        <p
                            role="status"
                            className="text-sm text-muted-foreground"
                        >
                            {t('merge_wizard.analyzing')}
                        </p>
                    ) : null}

                    {readyProjectCandidate ? (
                        <ProjectDetectionSummary
                            candidate={readyProjectCandidate}
                            isAuthenticated={isAuthenticated}
                        />
                    ) : null}

                    {readyDetectionAnalysis ? (
                        <DetectionSummary
                            analysis={readyDetectionAnalysis}
                            context="merge"
                        />
                    ) : null}

                    {unsupportedDetectionAnalysis ? (
                        <DetectionSummary
                            analysis={unsupportedDetectionAnalysis}
                            context="merge"
                        />
                    ) : null}

                    {preparation?.status === 'needs_dialect_resolution' ? (
                        <DialectResolutionPanel
                            variant="existing"
                            copyVariant="sql_ambiguous"
                            selectedDatabaseType={currentDatabaseType}
                            candidates={preparation.analysis.dialectCandidates}
                            candidateScores={
                                preparation.analysis.dialectCandidateScores
                            }
                            detectedDatabaseType={
                                preparation.analysis.detectedDatabaseType
                            }
                            resolvedSourceDialect={sourceDialect}
                            onResolve={onResolveDialect}
                        />
                    ) : null}

                    {preparation?.status === 'database_type_mismatch' ? (
                        <DialectMismatchPanel
                            variant="existing"
                            selectedDatabaseType={
                                preparation.currentDatabaseType
                            }
                            detectedDatabaseType={
                                preparation.detectedDatabaseType
                            }
                        />
                    ) : null}

                    {preparation?.status === 'needs_project_resolution' &&
                    projectDetectionCandidate ? (
                        <ProjectAmbiguityPanel
                            candidates={preparation.candidates}
                            selectedCandidateKey={projectCandidateKey ?? ''}
                            detectionCandidate={projectDetectionCandidate}
                            isAuthenticated={isAuthenticated}
                            onSelect={(candidate) =>
                                onResolveProject(
                                    getProjectCandidateKey(candidate)
                                )
                            }
                        />
                    ) : null}

                    {preparation?.status ===
                    'needs_database_group_resolution' ? (
                        <ProjectDatabaseGroupPanel
                            groups={preparation.analysis.groups}
                            selectedGroupKey={databaseGroupId ?? ''}
                            detectedCandidate={preparation.candidate}
                            isAuthenticated={isAuthenticated}
                            onSelect={(group) =>
                                onResolveDatabaseGroup(group.id)
                            }
                        />
                    ) : null}

                    {showInvalidDiagramJsonError ? (
                        <InvalidDiagramJsonDetectionPanel
                            path={preparation.diagramJsonPath ?? null}
                        />
                    ) : null}

                    {preparationErrorKey ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {t(preparationErrorKey)}
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    {compareErrorKey ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {t(compareErrorKey)}
                            </AlertDescription>
                        </Alert>
                    ) : null}
                </div>
            </div>

            <DialogFooter className="mt-4 flex shrink-0 flex-wrap items-center !justify-between gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    {t('merge_wizard.cancel')}
                </Button>
                <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
                    <WizardCheckboxOption
                        id={deletionsId}
                        label={t('merge_wizard.include_deletions.label')}
                        description={t(
                            'merge_wizard.include_deletions.description'
                        )}
                        checked={includeDeletions}
                        disabled={inputsLocked}
                        onCheckedChange={onIncludeDeletionsChange}
                    />
                    <Button
                        type="button"
                        onClick={onCompare}
                        disabled={!canCompare}
                        aria-busy={isComparing}
                    >
                        {isComparing ? (
                            <Spinner className="mr-1 size-5 text-primary-foreground" />
                        ) : null}
                        {isComparing
                            ? t('merge_wizard.comparing')
                            : t('merge_wizard.compare')}
                    </Button>
                </div>
            </DialogFooter>
        </>
    );
};
