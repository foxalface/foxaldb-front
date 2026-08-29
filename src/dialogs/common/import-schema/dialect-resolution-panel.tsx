import React, { useMemo } from 'react';
import { AlertTriangle, Star } from 'lucide-react';
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

export interface DialectResolutionPanelProps {
    variant?: DialectResolutionVariant;
    selectedDatabaseType: DatabaseType;
    candidates: DatabaseType[];
    candidateScores: DialectCandidateScore[];
    detectedDatabaseType: DatabaseType | null;
    resolvedSourceDialect: DatabaseType | null;
    onResolve: (databaseType: DatabaseType) => void;
}

export const DialectResolutionPanel: React.FC<DialectResolutionPanelProps> = ({
    candidates,
    candidateScores,
    detectedDatabaseType,
    resolvedSourceDialect,
    onResolve,
}) => {
    const { t } = useTranslation();

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
            aria-labelledby="dialect-resolution-title"
            className="flex flex-col gap-5 text-sm"
        >
            <div className="flex items-start gap-3 rounded-lg border border-amber-500 bg-amber-500/10 px-4 py-3 dark:border-amber-500/70 dark:bg-amber-500/15">
                <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500"
                    aria-hidden
                />
                <div className="flex flex-col gap-1">
                    <p id="dialect-resolution-title" className="font-medium">
                        {t(
                            'new_diagram_dialog.import_schema.detection.sql_ambiguous_title'
                        )}
                    </p>
                    <p className="text-muted-foreground">
                        {t(
                            'new_diagram_dialog.import_schema.detection.sql_ambiguous_description'
                        )}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-start gap-3">
                <p className="font-medium">
                    {t('new_diagram_dialog.import_schema.ambiguous.title')}
                </p>
                <ToggleGroup
                    type="single"
                    value={resolvedSourceDialect ?? ''}
                    onValueChange={(value) => {
                        if (!value) {
                            return;
                        }

                        onResolve(value as DatabaseType);
                    }}
                    className="flex w-full flex-wrap justify-start gap-x-3 gap-y-5 pb-2 pl-1.5 pt-1.5"
                    aria-label={t(
                        'new_diagram_dialog.import_schema.ambiguous.choose_source'
                    )}
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
                                                      'new_diagram_dialog.import_schema.ambiguous.candidate_recommended',
                                                      {
                                                          database:
                                                              databaseLabel,
                                                          percent:
                                                              score.confidencePercent,
                                                      }
                                                  )
                                                : t(
                                                      'new_diagram_dialog.import_schema.ambiguous.candidate_with_confidence',
                                                      {
                                                          database:
                                                              databaseLabel,
                                                          percent:
                                                              score.confidencePercent,
                                                      }
                                                  )
                                            : databaseLabel
                                    }
                                />
                                {score ? (
                                    <Badge
                                        variant="outline"
                                        className="absolute -left-1.5 -top-1.5 z-10 h-5 min-w-9 justify-center border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground shadow-sm"
                                    >
                                        {t(
                                            'new_diagram_dialog.import_schema.ambiguous.confidence_badge',
                                            {
                                                percent:
                                                    score.confidencePercent,
                                            }
                                        )}
                                    </Badge>
                                ) : null}
                                {isRecommended ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span
                                                className="absolute -bottom-1.5 left-1/2 z-10 inline-flex size-5 -translate-x-1/2 items-center justify-center rounded-md border border-border bg-background shadow-sm"
                                                aria-label={t(
                                                    'new_diagram_dialog.import_schema.ambiguous.recommended_aria',
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
                                            {t(
                                                'new_diagram_dialog.import_schema.ambiguous.recommended_tooltip'
                                            )}
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
