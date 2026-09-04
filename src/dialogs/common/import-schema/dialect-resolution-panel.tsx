import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Info, Star } from 'lucide-react';
import { Badge } from '@/components/badge/badge';
import { ToggleGroup } from '@/components/toggle/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { DatabaseOption } from '@/dialogs/create-diagram-dialog/select-database/database-option';
import type { DatabaseType } from '@/lib/domain/database-type';
import type { DialectCandidateScore } from '@/lib/import/import-schema-resolution';
import { databaseTypeToLabelMap } from '@/lib/databases';
import { useTranslation } from 'react-i18next';

export type DialectResolutionVariant = 'create' | 'existing';

export type DialectResolutionCopyVariant = 'sql_ambiguous' | 'diagram_json';

const COPY_KEYS: Record<
    DialectResolutionCopyVariant,
    {
        detectionTitle: string;
        alertTitle: string;
        chooseTitle: string;
        selectionHelpPercentages: string;
        selectionHelpRecommended: string;
        selectionHelpAria: string;
        chooseSourceAria: string;
        candidateRecommended: string;
        candidateWithConfidence: string;
        candidatePlain: string;
        confidenceBadge: string;
        recommendedTooltip: string;
        recommendedAria: string;
    }
> = {
    sql_ambiguous: {
        detectionTitle:
            'new_diagram_dialog.import_schema.detection.sql_ambiguous_title',
        alertTitle:
            'new_diagram_dialog.import_schema.ambiguous.multiple_dbms_title',
        chooseTitle: 'new_diagram_dialog.import_schema.ambiguous.title',
        selectionHelpPercentages:
            'new_diagram_dialog.import_schema.ambiguous.selection_help_percentages',
        selectionHelpRecommended:
            'new_diagram_dialog.import_schema.ambiguous.selection_help_recommended',
        selectionHelpAria:
            'new_diagram_dialog.import_schema.ambiguous.selection_help_aria',
        chooseSourceAria:
            'new_diagram_dialog.import_schema.ambiguous.choose_source',
        candidateRecommended:
            'new_diagram_dialog.import_schema.ambiguous.candidate_recommended',
        candidateWithConfidence:
            'new_diagram_dialog.import_schema.ambiguous.candidate_with_confidence',
        candidatePlain: 'new_diagram_dialog.import_schema.ambiguous.candidate',
        confidenceBadge:
            'new_diagram_dialog.import_schema.ambiguous.confidence_badge',
        recommendedTooltip:
            'new_diagram_dialog.import_schema.ambiguous.recommended_tooltip',
        recommendedAria:
            'new_diagram_dialog.import_schema.ambiguous.recommended_aria',
    },
    diagram_json: {
        detectionTitle:
            'new_diagram_dialog.import_schema.detection.diagram_json',
        alertTitle:
            'new_diagram_dialog.import_schema.ambiguous.multiple_dbms_title',
        chooseTitle:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.title',
        selectionHelpPercentages:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.selection_help_percentages',
        selectionHelpRecommended:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.selection_help_recommended',
        selectionHelpAria:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.selection_help_aria',
        chooseSourceAria:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.choose_source',
        candidateRecommended:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.candidate_recommended',
        candidateWithConfidence:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.candidate_with_confidence',
        candidatePlain:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.candidate',
        confidenceBadge:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.confidence_badge',
        recommendedTooltip:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.recommended_tooltip',
        recommendedAria:
            'new_diagram_dialog.import_schema.diagram_json.ambiguous.recommended_aria',
    },
};

export interface DialectResolutionPanelProps {
    variant?: DialectResolutionVariant;
    copyVariant?: DialectResolutionCopyVariant;
    selectedDatabaseType: DatabaseType;
    candidates: DatabaseType[];
    candidateScores: DialectCandidateScore[];
    detectedDatabaseType: DatabaseType | null;
    resolvedSourceDialect: DatabaseType | null;
    onResolve: (databaseType: DatabaseType) => void;
}

export const DialectResolutionPanel: React.FC<DialectResolutionPanelProps> = ({
    copyVariant = 'sql_ambiguous',
    candidates,
    candidateScores,
    detectedDatabaseType,
    resolvedSourceDialect,
    onResolve,
}) => {
    const { t } = useTranslation();
    const copyKeys = COPY_KEYS[copyVariant];

    const scoresByDatabaseType = useMemo(
        () =>
            new Map(
                candidateScores.map((entry) => [entry.databaseType, entry])
            ),
        [candidateScores]
    );

    if (candidates.length === 0) {
        return null;
    }

    return (
        <div
            role="region"
            aria-labelledby="dialect-resolution-alert-title"
            className="flex flex-col gap-5 text-sm"
        >
            <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
                <div className="flex items-start gap-2">
                    <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-green-600"
                        aria-hidden
                    />
                    <p className="font-medium">{t(copyKeys.detectionTitle)}</p>
                </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-3 dark:border-amber-500/70 dark:bg-amber-500/15">
                <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
                    aria-hidden
                />
                <p id="dialect-resolution-alert-title" className="font-medium">
                    {t(copyKeys.alertTitle)}
                </p>
            </div>

            <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-1.5">
                    <p className="font-medium">{t(copyKeys.chooseTitle)}</p>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={t(copyKeys.selectionHelpAria)}
                            >
                                <Info className="size-3.5" aria-hidden />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            sideOffset={8}
                            className="z-[1100] max-w-xs"
                        >
                            <ul className="list-disc space-y-1 pl-4 text-left">
                                <li>{t(copyKeys.selectionHelpPercentages)}</li>
                                <li>{t(copyKeys.selectionHelpRecommended)}</li>
                            </ul>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={resolvedSourceDialect ?? ''}
                    onValueChange={(value) => {
                        if (!value) {
                            return;
                        }

                        onResolve(value as DatabaseType);
                    }}
                    className="flex w-full flex-wrap justify-start gap-x-3 gap-y-5 pb-2 pl-1.5 pt-1.5"
                    aria-label={t(copyKeys.chooseSourceAria)}
                >
                    {candidates.map((candidate) => {
                        const score = scoresByDatabaseType.get(candidate);
                        const databaseLabel = databaseTypeToLabelMap[candidate];
                        const isRecommended =
                            detectedDatabaseType !== null &&
                            candidate === detectedDatabaseType;

                        return (
                            <div key={candidate} className="relative shrink-0">
                                <DatabaseOption
                                    type={candidate}
                                    size="compact"
                                    ariaLabel={
                                        score
                                            ? isRecommended
                                                ? t(
                                                      copyKeys.candidateRecommended,
                                                      {
                                                          database:
                                                              databaseLabel,
                                                          percent:
                                                              score.confidencePercent,
                                                      }
                                                  )
                                                : t(
                                                      copyKeys.candidateWithConfidence,
                                                      {
                                                          database:
                                                              databaseLabel,
                                                          percent:
                                                              score.confidencePercent,
                                                      }
                                                  )
                                            : isRecommended
                                              ? t(
                                                    copyKeys.candidateRecommended,
                                                    {
                                                        database: databaseLabel,
                                                    }
                                                )
                                              : t(copyKeys.candidatePlain, {
                                                    database: databaseLabel,
                                                })
                                    }
                                />
                                {score ? (
                                    <Badge
                                        variant="outline"
                                        className="absolute -left-1.5 -top-1.5 z-10 h-5 min-w-9 select-none justify-center border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground shadow-sm"
                                    >
                                        {t(copyKeys.confidenceBadge, {
                                            percent: score.confidencePercent,
                                        })}
                                    </Badge>
                                ) : null}
                                {isRecommended ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span
                                                className="absolute -bottom-1.5 left-1/2 z-10 inline-flex size-5 -translate-x-1/2 items-center justify-center rounded-md border border-border bg-background shadow-sm"
                                                aria-label={t(
                                                    copyKeys.recommendedAria,
                                                    {
                                                        database: databaseLabel,
                                                    }
                                                )}
                                            >
                                                <Star
                                                    className="size-3 fill-amber-400 text-amber-400"
                                                    aria-hidden
                                                />
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="bottom"
                                            sideOffset={8}
                                            className="z-[1100]"
                                        >
                                            {t(copyKeys.recommendedTooltip)}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : null}
                            </div>
                        );
                    })}
                </ToggleGroup>
            </div>
        </div>
    );
};
