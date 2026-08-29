import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { databaseTypeToLabelMap } from '@/lib/databases';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { ImportDetectionAnalysis } from './analyze-import-content';

export interface DetectionSummaryProps {
    analysis: ImportDetectionAnalysis;
}

export const DetectionSummary: React.FC<DetectionSummaryProps> = ({
    analysis,
}) => {
    const { t } = useTranslation();

    const content = useMemo(() => {
        if (analysis.displayKind === 'empty') {
            return null;
        }

        if (
            analysis.displayKind === 'dialect' &&
            analysis.detectedDatabaseType
        ) {
            return {
                title: t('new_diagram_dialog.import_schema.detection.dialect', {
                    database:
                        databaseTypeToLabelMap[analysis.detectedDatabaseType],
                }),
                description: undefined,
                severity: analysis.severity,
            };
        }

        if (analysis.displayKind === 'dbml') {
            return {
                title: t('new_diagram_dialog.import_schema.detection.dbml'),
                description: undefined,
                severity: analysis.severity,
            };
        }

        if (analysis.displayKind === 'metadata_json') {
            return {
                title: t(
                    'new_diagram_dialog.import_schema.detection.metadata_json'
                ),
                description: undefined,
                severity: analysis.severity,
            };
        }

        if (analysis.displayKind === 'diagram_json') {
            return {
                title: t(
                    'new_diagram_dialog.import_schema.detection.diagram_json'
                ),
                description: t(
                    'new_diagram_dialog.import_schema.errors.diagram_json'
                ),
                severity: analysis.severity,
            };
        }

        if (analysis.displayKind === 'sql_ambiguous') {
            return {
                title: t(
                    'new_diagram_dialog.import_schema.detection.sql_ambiguous_title'
                ),
                description: t(
                    'new_diagram_dialog.import_schema.detection.sql_ambiguous_description'
                ),
                severity: analysis.severity,
            };
        }

        if (analysis.displayKind === 'dialect_mismatch') {
            return null;
        }

        if (analysis.displayKind === 'clickhouse_unsupported') {
            return {
                title: t(
                    'new_diagram_dialog.import_schema.detection.clickhouse_unsupported'
                ),
                description: t(
                    'new_diagram_dialog.import_schema.errors.clickhouse_unsupported'
                ),
                severity: analysis.severity,
            };
        }

        if (analysis.displayKind === 'malformed_json') {
            return {
                title: t(
                    'new_diagram_dialog.import_schema.errors.malformed_json'
                ),
                description: undefined,
                severity: 'error' as const,
            };
        }

        return {
            title: t('new_diagram_dialog.import_schema.detection.unsupported'),
            description: t(
                'new_diagram_dialog.import_schema.errors.unsupported'
            ),
            severity: 'warning' as const,
        };
    }, [analysis, t]);

    if (!content) {
        return null;
    }

    const Icon =
        content.severity === 'success'
            ? CheckCircle2
            : content.severity === 'warning'
              ? AlertTriangle
              : AlertCircle;

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
                content.severity === 'success' && 'border-border bg-muted/50',
                content.severity === 'warning' &&
                    'border-amber-500 dark:border-amber-500/70',
                content.severity === 'error' && 'border-destructive'
            )}
        >
            <Icon
                className={cn(
                    'mt-0.5 size-4 shrink-0',
                    content.severity === 'warning' &&
                        'text-amber-600 dark:text-amber-500',
                    content.severity === 'error' && 'text-destructive'
                )}
                aria-hidden
            />
            <div className="flex flex-col gap-1">
                <span className="font-medium">{content.title}</span>
                {content.description ? (
                    <span className="text-muted-foreground">
                        {content.description}
                    </span>
                ) : null}
            </div>
        </div>
    );
};
