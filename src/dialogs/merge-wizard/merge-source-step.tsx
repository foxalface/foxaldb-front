import React, { useId, useMemo, useRef } from 'react';
import { AlertTriangle, FileText, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Spinner } from '@/components/spinner/spinner';
import { Textarea } from '@/components/textarea/textarea';
import { WizardCheckboxOption } from '@/dialogs/common/wizard-checkbox-option';
import { DialectMismatchPanel } from '@/dialogs/common/import-schema/dialect-mismatch-panel';
import { DialectResolutionPanel } from '@/dialogs/common/import-schema/dialect-resolution-panel';
import { ProjectAmbiguityPanel } from '@/dialogs/common/import-schema/project-ambiguity-panel';
import { ProjectDatabaseGroupPanel } from '@/dialogs/common/import-schema/project-database-group-panel';
import { IMPORT_SCHEMA_FILE_ACCEPT } from '@/dialogs/common/import-schema/constants';
import type { DatabaseType } from '@/lib/domain/database-type';
import { getSelectableCandidates } from '@/lib/project-import/detection/detect-project';
import { getProjectCandidateKey } from '@/lib/project-import/framework-labels';
import type { SchemaMergeCompareFailure } from '@/lib/api/schema-merge-compare';
import type { SchemaMergeSourcePreparationResult } from '@/lib/schema-merge/source-adapter-types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { mergeCompareErrorKey } from './merge-compare-error';
import { MergeSourceDetectionSummary } from './merge-source-detection-summary';
import { mergeSourcePreparationErrorKey } from './merge-source-preparation-message';

const DELETION_WARNING_ID = 'merge-include-deletions-warning';

export interface MergeSourceStepProps {
    text: string;
    fileName: string | null;
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
}

export const MergeSourceStep: React.FC<MergeSourceStepProps> = ({
    text,
    fileName,
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
}) => {
    const { t } = useTranslation();
    const textareaId = useId();
    const fileInputId = useId();
    const deletionsId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputsLocked = unavailable || isComparing;
    const preparationErrorKey = mergeSourcePreparationErrorKey(preparation);
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

    return (
        <>
            <DialogHeader className="shrink-0">
                <DialogTitle>{t('merge_wizard.title')}</DialogTitle>
                <DialogDescription>
                    {t('merge_wizard.description')}
                </DialogDescription>
            </DialogHeader>

            <div
                className="min-h-0 flex-1 overflow-y-auto"
                data-testid="merge-wizard-source-step"
            >
                <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-4">
                    {unavailable ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {t('merge_wizard.unavailable')}
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor={textareaId}
                            className="text-sm font-medium"
                        >
                            {t('merge_wizard.source_label')}
                        </label>
                        <Textarea
                            id={textareaId}
                            value={text}
                            onChange={(event) =>
                                onTextChange(event.target.value)
                            }
                            placeholder={t('merge_wizard.source_placeholder')}
                            className="max-h-48 min-h-40 resize-none overflow-y-auto"
                            disabled={inputsLocked}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('merge_wizard.source_hint')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="h-px flex-1 bg-border" aria-hidden />
                        <span>
                            {t('new_diagram_dialog.import_schema.or_divider')}
                        </span>
                        <span className="h-px flex-1 bg-border" aria-hidden />
                    </div>

                    <div className="flex w-full flex-col items-center gap-2">
                        <input
                            ref={fileInputRef}
                            id={fileInputId}
                            type="file"
                            accept={IMPORT_SCHEMA_FILE_ACCEPT}
                            className="sr-only"
                            tabIndex={-1}
                            aria-hidden
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.target.value = '';

                                if (file) {
                                    onFileSelected(file);
                                }
                            }}
                            disabled={inputsLocked}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full max-w-full gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={inputsLocked}
                            aria-label={
                                fileName
                                    ? t('merge_wizard.change_file_aria', {
                                          name: fileName,
                                      })
                                    : t('merge_wizard.choose_file')
                            }
                            title={fileName ?? undefined}
                        >
                            {fileName ? (
                                <FileText
                                    className="size-4 shrink-0"
                                    aria-hidden
                                />
                            ) : (
                                <Upload
                                    className="size-4 shrink-0"
                                    aria-hidden
                                />
                            )}
                            <span className={cn(fileName && 'truncate')}>
                                {fileName ?? t('merge_wizard.choose_file')}
                            </span>
                        </Button>
                    </div>

                    {isAnalyzing ? (
                        <p
                            role="status"
                            className="text-sm text-muted-foreground"
                        >
                            {t('merge_wizard.analyzing')}
                        </p>
                    ) : null}

                    {preparation?.status === 'ready' ? (
                        <MergeSourceDetectionSummary result={preparation} />
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

                    <WizardCheckboxOption
                        id={deletionsId}
                        label={t('merge_wizard.include_deletions.label')}
                        description={t(
                            'merge_wizard.include_deletions.description'
                        )}
                        checked={includeDeletions}
                        disabled={inputsLocked}
                        describedBy={
                            includeDeletions ? DELETION_WARNING_ID : undefined
                        }
                        onCheckedChange={onIncludeDeletionsChange}
                    />

                    {includeDeletions ? (
                        <div
                            id={DELETION_WARNING_ID}
                            role="status"
                            className="flex items-start gap-3 rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-3 text-sm dark:border-amber-500/70 dark:bg-amber-500/15"
                        >
                            <AlertTriangle
                                className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
                                aria-hidden
                            />
                            <p>{t('merge_wizard.include_deletions.warning')}</p>
                        </div>
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

            <DialogFooter className="mt-4 flex shrink-0 !justify-between gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    {t('merge_wizard.cancel')}
                </Button>
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
            </DialogFooter>
        </>
    );
};
