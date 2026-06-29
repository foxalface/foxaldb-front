import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogInternalContent,
    DialogTitle,
} from '@/components/dialog/dialog';
import { FileUploader } from '@/components/file-uploader/file-uploader';
import { Label } from '@/components/label/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import { Spinner } from '@/components/spinner/spinner';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import {
    DEFAULT_LARAVEL_VERSION,
    LARAVEL_VERSIONS,
    type LaravelVersion,
} from '@/lib/api/diagram-laravel-export';
import { compareDiagramToLaravelMigrationArchive } from '@/lib/api/laravel-migration-diff';
import { LARAVEL_MIGRATION_ARCHIVE_MAX_BYTES } from '@/lib/api/laravel-migration-import';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';
import { defaultSchemas } from '@/lib/data/default-schemas';
import {
    ApplyExecutionError,
    createLaravelMigrationApplyApi,
    executeLaravelMigrationDiffApply,
    planLaravelMigrationDiffApply,
    type ApplyPlan,
} from '@/lib/laravel-migration/apply-diff';
import { formatApiErrorMessage } from '@/pages/auth/format-api-error-message';
import type { LaravelMigrationSchemaDiff } from '@/types/laravel-migration';
import { useTranslation } from 'react-i18next';
import type { BaseDialogProps } from '../common/base-dialog-props';
import { LaravelMigrationDiffViewer } from './laravel-migration-diff-viewer';

export interface LaravelMigrationDiffDialogProps extends BaseDialogProps {
    diagramId: string;
    diagramName: string;
}

interface LaravelMigrationDiffOptions {
    laravelVersion: LaravelVersion;
    includeIndexes: boolean;
    includeForeignKeys: boolean;
}

const DEFAULT_DIFF_OPTIONS: LaravelMigrationDiffOptions = {
    laravelVersion: DEFAULT_LARAVEL_VERSION,
    includeIndexes: true,
    includeForeignKeys: true,
};

const countPlanValidationErrors = (plan: ApplyPlan): number =>
    plan.issues.filter((issue) => issue.severity === 'error').length;

export const LaravelMigrationDiffDialog: React.FC<
    LaravelMigrationDiffDialogProps
> = ({ dialog, diagramId }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { closeLaravelMigrationDiffDialog } = useDialog();
    const {
        currentDiagram,
        tables,
        relationships,
        databaseType,
        readonly,
        addTables,
        removeTables,
        addField,
        removeField,
        updateField,
        addIndex,
        removeIndex,
        updateIndex,
        addRelationships,
        removeRelationships,
        updateRelationship,
    } = useChartDB();
    const [archive, setArchive] = useState<File | null>(null);
    const [archiveUploadKey, setArchiveUploadKey] = useState(0);
    const [options, setOptions] =
        useState<LaravelMigrationDiffOptions>(DEFAULT_DIFF_OPTIONS);
    const [isComparing, setIsComparing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [applyError, setApplyError] = useState<string | null>(null);
    const [archiveError, setArchiveError] = useState<string | null>(null);
    const [compareError, setCompareError] = useState<string | null>(null);
    const [diff, setDiff] = useState<LaravelMigrationSchemaDiff | null>(null);

    const applyApi = useMemo(
        () =>
            createLaravelMigrationApplyApi({
                addTables,
                removeTables,
                addField,
                removeField,
                updateField,
                addIndex,
                removeIndex,
                updateIndex,
                addRelationships,
                removeRelationships,
                updateRelationship,
            }),
        [
            addField,
            addIndex,
            addRelationships,
            addTables,
            removeField,
            removeIndex,
            removeRelationships,
            removeTables,
            updateField,
            updateIndex,
            updateRelationship,
        ]
    );

    const applyPlan = useMemo(() => {
        if (!diff) {
            return null;
        }

        return planLaravelMigrationDiffApply({
            tables,
            relationships,
            diff,
        });
    }, [diff, relationships, tables]);

    const applySummary = useMemo(() => {
        if (!diff) {
            return null;
        }

        return {
            addedTables: diff.addedTables.length,
            removedTables: diff.removedTables.length,
            changedTables: diff.changedTables.length,
            validationIssues: applyPlan
                ? countPlanValidationErrors(applyPlan)
                : 0,
        };
    }, [applyPlan, diff]);

    const resetState = useCallback(() => {
        setArchive(null);
        setArchiveUploadKey((previous) => previous + 1);
        setOptions(DEFAULT_DIFF_OPTIONS);
        setIsComparing(false);
        setIsApplying(false);
        setApplySuccess(false);
        setApplyError(null);
        setArchiveError(null);
        setCompareError(null);
        setDiff(null);
    }, []);

    useEffect(() => {
        if (!dialog.open) {
            return;
        }

        resetState();
    }, [dialog.open, resetState]);

    const onArchiveChange = useCallback((files: File[]) => {
        setArchiveError(null);
        setCompareError(null);
        setApplyError(null);
        setApplySuccess(false);

        if (files.length === 0) {
            setArchive(null);
            return;
        }

        setArchive(files[0]);
    }, []);

    const handleCompare = useCallback(async () => {
        if (!archive) {
            setArchiveError(
                t('compare_laravel_migrations_dialog.errors.archive_required')
            );
            return;
        }

        if (archive.size > LARAVEL_MIGRATION_ARCHIVE_MAX_BYTES) {
            setArchiveError(
                t('compare_laravel_migrations_dialog.errors.file_too_large')
            );
            return;
        }

        setIsComparing(true);
        setArchiveError(null);
        setCompareError(null);
        setApplyError(null);
        setApplySuccess(false);

        try {
            const result = await compareDiagramToLaravelMigrationArchive(
                diagramId,
                {
                    archive,
                    content: currentDiagram,
                    laravelVersion: options.laravelVersion,
                    includeIndexes: options.includeIndexes,
                    includeForeignKeys: options.includeForeignKeys,
                }
            );
            setDiff(result);
        } catch (error) {
            const validationErrors = parseLaravelValidationErrors(error);

            if (validationErrors.archive) {
                setArchiveError(validationErrors.archive);
            }

            if (validationErrors.content) {
                setCompareError(validationErrors.content);
            }

            if (!validationErrors.archive && !validationErrors.content) {
                const message = formatApiErrorMessage(error);
                setCompareError(
                    message ||
                        t(
                            'compare_laravel_migrations_dialog.errors.compare_failed'
                        )
                );
            }
        } finally {
            setIsComparing(false);
        }
    }, [archive, currentDiagram, diagramId, options, t]);

    const handleCompareAnother = useCallback(() => {
        resetState();
    }, [resetState]);

    const handleApply = useCallback(async () => {
        if (!diff) {
            return;
        }

        setApplyError(null);
        setApplySuccess(false);

        const latestPlan = planLaravelMigrationDiffApply({
            tables,
            relationships,
            diff,
        });

        if (!latestPlan.canApply) {
            setApplyError(
                t('compare_laravel_migrations_dialog.apply.apply_blocked')
            );
            return;
        }

        setIsApplying(true);

        try {
            await executeLaravelMigrationDiffApply({
                plan: latestPlan,
                api: applyApi,
                existingTables: tables,
                existingRelationships: relationships,
                defaultSchema: defaultSchemas[databaseType] ?? null,
            });
            setApplySuccess(true);
        } catch (error) {
            const message =
                error instanceof ApplyExecutionError
                    ? error.message
                    : formatApiErrorMessage(error);

            setApplyError(
                message ||
                    t('compare_laravel_migrations_dialog.apply.apply_failed')
            );
        } finally {
            setIsApplying(false);
        }
    }, [applyApi, databaseType, diff, relationships, tables, t]);

    const canShowApply = Boolean(user && !readonly && diff);

    const applyFooter = canShowApply ? (
        <div className="space-y-3 border-t pt-3">
            {applySummary ? (
                <div className="space-y-2">
                    <p className="text-sm font-medium">
                        {applyPlan?.canApply
                            ? t(
                                  'compare_laravel_migrations_dialog.apply.ready_to_apply'
                              )
                            : t(
                                  'compare_laravel_migrations_dialog.apply.validation_issues'
                              )}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground md:grid-cols-4">
                        <span>
                            {t(
                                'compare_laravel_migrations_dialog.apply.added_tables'
                            )}
                            : {applySummary.addedTables}
                        </span>
                        <span>
                            {t(
                                'compare_laravel_migrations_dialog.apply.removed_tables'
                            )}
                            : {applySummary.removedTables}
                        </span>
                        <span>
                            {t(
                                'compare_laravel_migrations_dialog.apply.changed_tables'
                            )}
                            : {applySummary.changedTables}
                        </span>
                        <span>
                            {t(
                                'compare_laravel_migrations_dialog.apply.validation_issues'
                            )}
                            : {applySummary.validationIssues}
                        </span>
                    </div>
                </div>
            ) : null}

            {applySuccess ? (
                <p className="text-sm text-green-600 dark:text-green-400">
                    {t('compare_laravel_migrations_dialog.apply.apply_success')}
                </p>
            ) : null}

            {applyError ? (
                <p className="text-sm text-destructive">{applyError}</p>
            ) : null}

            <Button
                type="button"
                onClick={() => void handleApply()}
                disabled={
                    isApplying ||
                    isComparing ||
                    !applyPlan?.canApply ||
                    applySuccess
                }
            >
                {isApplying ? (
                    <>
                        <Spinner className="mr-1 size-5 text-primary-foreground" />
                        {t('compare_laravel_migrations_dialog.apply.applying')}
                    </>
                ) : (
                    t('compare_laravel_migrations_dialog.apply.apply')
                )}
            </Button>
        </div>
    ) : null;

    if (!user) {
        return null;
    }

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    closeLaravelMigrationDiffDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-h-screen max-w-2xl flex-col"
                showClose
            >
                <DialogHeader>
                    <DialogTitle>
                        {t('compare_laravel_migrations_dialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('compare_laravel_migrations_dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <DialogInternalContent>
                    {diff ? (
                        <LaravelMigrationDiffViewer
                            diff={diff}
                            footer={applyFooter}
                        />
                    ) : (
                        <div className="flex flex-col gap-4 p-1">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    {t(
                                        'compare_laravel_migrations_dialog.archive_label'
                                    )}
                                </p>
                                <FileUploader
                                    key={archiveUploadKey}
                                    supportedExtensions={['.zip']}
                                    onFilesChange={onArchiveChange}
                                />
                                {!archive ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'compare_laravel_migrations_dialog.no_archive_selected'
                                        )}
                                    </p>
                                ) : null}
                                {archiveError ? (
                                    <p className="text-sm text-destructive">
                                        {archiveError}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diff-laravel-version">
                                    {t(
                                        'compare_laravel_migrations_dialog.laravel_version'
                                    )}
                                </Label>
                                <Select
                                    value={options.laravelVersion}
                                    onValueChange={(value) =>
                                        setOptions((previous) => ({
                                            ...previous,
                                            laravelVersion:
                                                value as LaravelVersion,
                                        }))
                                    }
                                    disabled={isComparing}
                                >
                                    <SelectTrigger id="diff-laravel-version">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LARAVEL_VERSIONS.map((version) => (
                                            <SelectItem
                                                key={version}
                                                value={version}
                                            >
                                                {version}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="diff-include-table-indexes"
                                        checked={options.includeIndexes}
                                        onCheckedChange={(checked) =>
                                            setOptions((previous) => ({
                                                ...previous,
                                                includeIndexes:
                                                    checked === true,
                                            }))
                                        }
                                        disabled={isComparing}
                                    />
                                    <div className="grid gap-1 leading-none">
                                        <Label htmlFor="diff-include-table-indexes">
                                            {t(
                                                'compare_laravel_migrations_dialog.include_table_indexes'
                                            )}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'compare_laravel_migrations_dialog.include_table_indexes_description'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="diff-include-foreign-keys"
                                        checked={options.includeForeignKeys}
                                        onCheckedChange={(checked) =>
                                            setOptions((previous) => ({
                                                ...previous,
                                                includeForeignKeys:
                                                    checked === true,
                                            }))
                                        }
                                        disabled={isComparing}
                                    />
                                    <div className="grid gap-1 leading-none">
                                        <Label htmlFor="diff-include-foreign-keys">
                                            {t(
                                                'compare_laravel_migrations_dialog.include_foreign_keys'
                                            )}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'compare_laravel_migrations_dialog.include_foreign_keys_description'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {compareError ? (
                        <p className="mt-2 text-sm text-destructive">
                            {compareError}
                        </p>
                    ) : null}
                </DialogInternalContent>

                <DialogFooter className="flex gap-1 md:justify-between">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isComparing || isApplying}
                        >
                            {t('compare_laravel_migrations_dialog.close')}
                        </Button>
                    </DialogClose>

                    {diff ? (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCompareAnother}
                            disabled={isApplying}
                        >
                            {t(
                                'compare_laravel_migrations_dialog.compare_another'
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => void handleCompare()}
                            disabled={isComparing || archive === null}
                        >
                            {isComparing ? (
                                <>
                                    <Spinner className="mr-1 size-5 text-primary-foreground" />
                                    {t(
                                        'compare_laravel_migrations_dialog.comparing'
                                    )}
                                </>
                            ) : (
                                t('compare_laravel_migrations_dialog.compare')
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
