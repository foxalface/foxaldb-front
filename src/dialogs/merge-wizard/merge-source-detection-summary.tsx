import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { databaseTypeToLabelMap } from '@/lib/databases';
import { PROJECT_FRAMEWORK_LABEL_KEYS } from '@/lib/project-import/framework-labels';
import type { SchemaMergeReadySource } from '@/lib/schema-merge/source-adapter-types';
import { useTranslation } from 'react-i18next';

interface MergeSourceDetectionSummaryProps {
    result: SchemaMergeReadySource;
}

export const MergeSourceDetectionSummary: React.FC<
    MergeSourceDetectionSummaryProps
> = ({ result }) => {
    const { t } = useTranslation();

    const title = useMemo(() => {
        if (result.detectedFramework) {
            return t('new_diagram_dialog.import_schema.project.detected', {
                framework: t(
                    PROJECT_FRAMEWORK_LABEL_KEYS[result.detectedFramework]
                ),
            });
        }

        if (result.detectedFormat === 'dbml') {
            return t('new_diagram_dialog.import_schema.detection.dbml');
        }

        if (result.detectedFormat === 'diagram_json') {
            return t('new_diagram_dialog.import_schema.detection.diagram_json');
        }

        if (result.detectedFormat === 'metadata_json') {
            return t(
                'new_diagram_dialog.import_schema.detection.metadata_json'
            );
        }

        if (
            result.detectedFormat === 'sql' ||
            result.detectedFormat === 'postgres_dump'
        ) {
            return t('new_diagram_dialog.import_schema.detection.dialect', {
                database: databaseTypeToLabelMap[result.detectedDatabaseType],
            });
        }

        return null;
    }, [result, t]);

    if (!title) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
        >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="font-medium">{title}</span>
        </div>
    );
};
