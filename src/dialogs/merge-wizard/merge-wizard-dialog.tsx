import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/dialog/dialog';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { useToast } from '@/components/toast/use-toast';
import type { BaseDialogProps } from '@/dialogs/common/base-dialog-props';
import { useAuth } from '@/hooks/use-auth';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import {
    applySchemaMerge,
    mapSchemaMergeApplyError,
    type SchemaMergeApplyFailure,
} from '@/lib/api/schema-merge-apply';
import {
    compareSchemaMerge,
    mapSchemaMergeCompareError,
    type SchemaMergeCompareFailure,
} from '@/lib/api/schema-merge-compare';
import { flushDiagramAutosave } from '@/lib/diagram-autosave/diagram-autosave-controller';
import type { DatabaseType } from '@/lib/domain/database-type';
import { isZipArchiveFile } from '@/lib/project-import/is-zip-archive-file';
import { isValidBackendDiagramId } from '@/lib/realtime/diagram-id';
import { noteSchemaMergeAuthoritativeHash } from '@/lib/realtime/schema-merge-refresh';
import { isSelectionDependencyClosed } from '@/lib/schema-merge/operation-selection';
import { prepareSchemaMergeSource } from '@/lib/schema-merge/prepare-schema-merge-source';
import type {
    SchemaMergeSourceInput,
    SchemaMergeSourcePreparationResult,
    SchemaMergeSourceResolution,
} from '@/lib/schema-merge/source-adapter-types';
import { defaultSchemas } from '@/lib/data/default-schemas';
import { useTranslation } from 'react-i18next';
import { mergeApplyInvalidatesComparison } from './merge-apply-error';
import { MergeResultStep } from './merge-result-step';
import { MergeSourceStep } from './merge-source-step';
import type { MergeWizardApplyContext } from './merge-wizard-apply-context';
import { MergeWizardStep } from './merge-wizard-step';

export type { MergeWizardApplyContext };

interface SelectedMergeFile {
    file: File;
    token: number;
    input: Extract<SchemaMergeSourceInput, { type: 'text_file' | 'archive' }>;
}

const resolutionFromState = (
    sourceDialect: DatabaseType | null,
    projectCandidateKey: string | null,
    databaseGroupId: string | null
): SchemaMergeSourceResolution | undefined => {
    const resolution: SchemaMergeSourceResolution = {};

    if (sourceDialect) {
        resolution.sourceDialect = sourceDialect;
    }

    if (projectCandidateKey) {
        resolution.projectCandidateKey = projectCandidateKey;
    }

    if (databaseGroupId) {
        resolution.databaseGroupId = databaseGroupId;
    }

    if (
        resolution.sourceDialect === undefined &&
        resolution.projectCandidateKey === undefined &&
        resolution.databaseGroupId === undefined
    ) {
        return undefined;
    }

    return resolution;
};

export interface MergeWizardDialogProps extends BaseDialogProps {}

export const MergeWizardDialog: React.FC<MergeWizardDialogProps> = ({
    dialog,
}) => {
    const { closeMergeWizardDialog } = useDialog();
    const { toast } = useToast();
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const {
        currentDiagram,
        databaseType: chartDatabaseType,
        replaceDiagram,
    } = useChartDB();
    const wasOpenRef = useRef(false);
    const sessionRef = useRef(0);
    const compareInFlightRef = useRef(false);
    const applyInFlightRef = useRef(false);
    const prepareRequestIdRef = useRef(0);
    const fileSelectionIdRef = useRef(0);
    const fileTokenRef = useRef(0);
    const compareGenerationRef = useRef(0);

    const [step, setStep] = useState<MergeWizardStep>(MergeWizardStep.SOURCE);
    const [text, setText] = useState('');
    const [selectedFile, setSelectedFile] = useState<SelectedMergeFile | null>(
        null
    );
    const [sourceDialect, setSourceDialect] = useState<DatabaseType | null>(
        null
    );
    const [projectCandidateKey, setProjectCandidateKey] = useState<
        string | null
    >(null);
    const [databaseGroupId, setDatabaseGroupId] = useState<string | null>(null);
    const [includeDeletions, setIncludeDeletions] = useState(false);
    const [preparation, setPreparation] =
        useState<SchemaMergeSourcePreparationResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isComparing, setIsComparing] = useState(false);
    const [compareError, setCompareError] =
        useState<SchemaMergeCompareFailure | null>(null);
    const [applyContext, setApplyContext] =
        useState<MergeWizardApplyContext | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const [applyError, setApplyError] =
        useState<SchemaMergeApplyFailure | null>(null);
    const preparationRef = useRef(preparation);
    preparationRef.current = preparation;

    const diagramId = currentDiagram?.id;
    const currentDatabaseType =
        currentDiagram?.databaseType ?? chartDatabaseType;
    const databaseEdition = currentDiagram?.databaseEdition;
    const unavailable = !isValidBackendDiagramId(diagramId);

    const resetWizardState = useCallback(() => {
        sessionRef.current += 1;
        prepareRequestIdRef.current += 1;
        fileSelectionIdRef.current += 1;
        compareInFlightRef.current = false;
        applyInFlightRef.current = false;
        setStep(MergeWizardStep.SOURCE);
        setText('');
        setSelectedFile(null);
        setSourceDialect(null);
        setProjectCandidateKey(null);
        setDatabaseGroupId(null);
        setIncludeDeletions(false);
        setPreparation(null);
        setIsAnalyzing(false);
        setIsComparing(false);
        setCompareError(null);
        setApplyContext(null);
        setIsApplying(false);
        setApplyError(null);
    }, []);

    useEffect(() => {
        const isOpen = dialog.open === true;

        if (isOpen && !wasOpenRef.current) {
            resetWizardState();
        }

        wasOpenRef.current = isOpen;
    }, [dialog.open, resetWizardState]);

    const clearResolutions = useCallback(() => {
        setSourceDialect(null);
        setProjectCandidateKey(null);
        setDatabaseGroupId(null);
    }, []);

    const handleTextChange = useCallback(
        (value: string) => {
            fileSelectionIdRef.current += 1;
            setText(value);
            setSelectedFile(null);
            clearResolutions();
            setCompareError(null);
        },
        [clearResolutions]
    );

    const handleFileSelected = useCallback(
        async (file: File) => {
            const selectionId = ++fileSelectionIdRef.current;
            const zip = await isZipArchiveFile(file);

            if (selectionId !== fileSelectionIdRef.current) {
                return;
            }

            const token = ++fileTokenRef.current;
            setText('');
            setSelectedFile({
                file,
                token,
                input: zip
                    ? { type: 'archive', file }
                    : { type: 'text_file', file },
            });
            clearResolutions();
            setCompareError(null);
        },
        [clearResolutions]
    );

    const sourceKey = selectedFile
        ? `file:${selectedFile.token}`
        : `text:${text}`;
    const previousSourceKeyRef = useRef(sourceKey);

    useEffect(() => {
        if (!dialog.open || unavailable) {
            return;
        }

        const sourceChanged = previousSourceKeyRef.current !== sourceKey;
        previousSourceKeyRef.current = sourceKey;
        const input: SchemaMergeSourceInput | null = selectedFile
            ? selectedFile.input
            : text.trim().length > 0
              ? { type: 'text', content: text }
              : null;

        if (!input) {
            prepareRequestIdRef.current += 1;
            setPreparation(null);
            setIsAnalyzing(false);
            return;
        }

        const requestId = ++prepareRequestIdRef.current;

        if (sourceChanged) {
            setPreparation(null);
        }

        setIsAnalyzing(true);
        let active = true;
        const resolution = resolutionFromState(
            sourceDialect,
            projectCandidateKey,
            databaseGroupId
        );

        void prepareSchemaMergeSource(input, {
            currentDiagram: {
                databaseType: currentDatabaseType,
                ...(databaseEdition ? { databaseEdition } : {}),
            },
            ...(resolution ? { resolution } : {}),
        })
            .then((result) => {
                if (!active || requestId !== prepareRequestIdRef.current) {
                    return;
                }

                setPreparation(result);
                setIsAnalyzing(false);
            })
            .catch((error: unknown) => {
                if (!active || requestId !== prepareRequestIdRef.current) {
                    return;
                }

                setPreparation(null);
                setIsAnalyzing(false);
                setCompareError(mapSchemaMergeCompareError(error));
            });

        return () => {
            active = false;
        };
    }, [
        currentDatabaseType,
        databaseEdition,
        databaseGroupId,
        dialog.open,
        projectCandidateKey,
        selectedFile,
        sourceDialect,
        sourceKey,
        text,
        unavailable,
    ]);

    const canCompare =
        !unavailable &&
        !isAnalyzing &&
        !isComparing &&
        preparation?.status === 'ready' &&
        isValidBackendDiagramId(diagramId);

    const handleCompare = useCallback(() => {
        if (
            compareInFlightRef.current ||
            isAnalyzing ||
            preparation?.status !== 'ready' ||
            !isValidBackendDiagramId(diagramId)
        ) {
            return;
        }

        const ready = preparation;
        const session = sessionRef.current;
        compareInFlightRef.current = true;
        setIsComparing(true);
        setCompareError(null);

        void (async () => {
            try {
                await flushDiagramAutosave();
            } catch {
                if (session !== sessionRef.current) {
                    return;
                }

                setCompareError({ type: 'autosave' });
                return;
            }

            if (session !== sessionRef.current) {
                return;
            }

            if (
                preparationRef.current?.status !== 'ready' ||
                !isValidBackendDiagramId(diagramId)
            ) {
                return;
            }

            const response = await compareSchemaMerge(diagramId, {
                incomingDiagram: ready.incomingDiagram,
                includeDeletions,
                source: {
                    kind: ready.source.kind,
                },
            });

            if (session !== sessionRef.current) {
                return;
            }

            compareGenerationRef.current += 1;
            setApplyContext({
                incomingDiagram: ready.incomingDiagram,
                source: {
                    kind: ready.source.kind,
                },
                includeDeletions,
                response,
                generation: compareGenerationRef.current,
            });
            setApplyError(null);
            setStep(MergeWizardStep.RESULT);
        })()
            .catch((error: unknown) => {
                if (session !== sessionRef.current) {
                    return;
                }

                setCompareError(mapSchemaMergeCompareError(error));
            })
            .finally(() => {
                if (session !== sessionRef.current) {
                    return;
                }

                compareInFlightRef.current = false;
                setIsComparing(false);
            });
    }, [diagramId, includeDeletions, isAnalyzing, preparation]);

    const handleResolveDialect = useCallback((dialect: DatabaseType) => {
        setSourceDialect(dialect);
        setCompareError(null);
    }, []);

    const handleResolveProject = useCallback((candidateKey: string) => {
        setProjectCandidateKey(candidateKey);
        setDatabaseGroupId(null);
        setCompareError(null);
    }, []);

    const handleResolveDatabaseGroup = useCallback((groupId: string) => {
        setDatabaseGroupId(groupId);
        setCompareError(null);
    }, []);

    const handleBackToSource = useCallback(() => {
        if (applyInFlightRef.current) {
            return;
        }

        setStep(MergeWizardStep.SOURCE);
    }, []);

    const handleApply = useCallback(
        (selectedOperationIds: readonly string[]) => {
            if (
                applyInFlightRef.current ||
                isApplying ||
                applyContext === null ||
                !isValidBackendDiagramId(diagramId)
            ) {
                return;
            }

            if (
                !isSelectionDependencyClosed(
                    new Set(selectedOperationIds),
                    applyContext.response.operations
                )
            ) {
                setApplyContext(null);
                setStep(MergeWizardStep.SOURCE);
                setCompareError({
                    type: 'merge_code',
                    code: 'incomplete_selection',
                });
                return;
            }

            const session = sessionRef.current;
            const context = applyContext;
            applyInFlightRef.current = true;
            setIsApplying(true);
            setApplyError(null);

            void applySchemaMerge(diagramId, {
                baseContentHash: context.response.baseContentHash,
                incomingDiagram: context.incomingDiagram,
                includeDeletions: context.includeDeletions,
                source: context.source,
                selectedOperationIds,
            })
                .then(async (response) => {
                    if (session !== sessionRef.current) {
                        return;
                    }

                    await replaceDiagram(response.content, {
                        updateHistory: true,
                        authoritative: true,
                        authoritativeContentHash: response.resultContentHash,
                    });

                    if (session !== sessionRef.current) {
                        return;
                    }

                    noteSchemaMergeAuthoritativeHash(
                        String(diagramId),
                        response.resultContentHash
                    );
                    toast({
                        title: t('merge_wizard.applied'),
                    });
                    closeMergeWizardDialog();
                })
                .catch((error: unknown) => {
                    if (session !== sessionRef.current) {
                        return;
                    }

                    const failure = mapSchemaMergeApplyError(error);

                    if (mergeApplyInvalidatesComparison(failure)) {
                        setApplyContext(null);
                        setApplyError(null);
                        setStep(MergeWizardStep.SOURCE);
                        setCompareError(
                            failure.type === 'merge_code'
                                ? {
                                      type: 'merge_code',
                                      code: failure.code,
                                  }
                                : { type: 'unexpected' }
                        );
                        return;
                    }

                    setApplyError(failure);
                })
                .finally(() => {
                    if (session !== sessionRef.current) {
                        return;
                    }

                    applyInFlightRef.current = false;
                    setIsApplying(false);
                });
        },
        [
            applyContext,
            closeMergeWizardDialog,
            diagramId,
            isApplying,
            replaceDiagram,
            t,
            toast,
        ]
    );

    return (
        <Dialog
            {...dialog}
            onOpenChange={(open) => {
                if (!open) {
                    if (isApplying) {
                        return;
                    }

                    closeMergeWizardDialog();
                }
            }}
        >
            <DialogContent
                className="flex max-h-dvh w-full max-w-[30rem] flex-col overflow-hidden sm:max-w-xl"
                showClose={!isApplying}
            >
                <TooltipProvider>
                    {step === MergeWizardStep.RESULT && applyContext ? (
                        <MergeResultStep
                            key={applyContext.generation}
                            applyContext={applyContext}
                            defaultSchema={
                                defaultSchemas[currentDatabaseType] ?? null
                            }
                            onBack={handleBackToSource}
                            onMerge={handleApply}
                            isApplying={isApplying}
                            applyError={applyError}
                            canApply={isValidBackendDiagramId(diagramId)}
                        />
                    ) : (
                        <MergeSourceStep
                            text={text}
                            fileName={selectedFile?.file.name ?? null}
                            preparation={preparation}
                            isAnalyzing={isAnalyzing}
                            isComparing={isComparing}
                            unavailable={unavailable}
                            canCompare={canCompare}
                            includeDeletions={includeDeletions}
                            currentDatabaseType={currentDatabaseType}
                            sourceDialect={sourceDialect}
                            projectCandidateKey={projectCandidateKey}
                            databaseGroupId={databaseGroupId}
                            compareError={compareError}
                            isAuthenticated={isAuthenticated}
                            onTextChange={handleTextChange}
                            onFileSelected={(file) => {
                                void handleFileSelected(file);
                            }}
                            onResolveDialect={handleResolveDialect}
                            onResolveProject={handleResolveProject}
                            onResolveDatabaseGroup={handleResolveDatabaseGroup}
                            onIncludeDeletionsChange={setIncludeDeletions}
                            onCompare={handleCompare}
                            onCancel={closeMergeWizardDialog}
                            hasCachedCompare={applyContext !== null}
                        />
                    )}
                </TooltipProvider>
            </DialogContent>
        </Dialog>
    );
};
