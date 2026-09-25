import React from 'react';
import { useTranslation } from 'react-i18next';
import { DbmlRefFormatToggle } from '@/lib/dbml/dbml-ref-format-toggle';
import type { DbmlRefFormat } from '@/lib/dbml/dbml-ref-format';
import { ExportCodePreviewBlock } from '../export-code-preview-block';

interface ExportDbmlPreviewStepProps {
    dbml?: string;
    refFormat: DbmlRefFormat;
    onRefFormatChange: (format: DbmlRefFormat) => void;
    isLoading: boolean;
    hasError: boolean;
}

export const ExportDbmlPreviewStep: React.FC<ExportDbmlPreviewStepProps> = ({
    dbml,
    refFormat,
    onRefFormatChange,
    isLoading,
    hasError,
}) => {
    const { t } = useTranslation();
    const generatingLabel = t('export_wizard.dbml.preview_step.generating');
    const isContentReady = !isLoading && dbml !== undefined && dbml.length > 0;

    if (hasError) {
        return (
            <p className="text-sm text-muted-foreground" role="alert">
                {t('export_wizard.dbml.preview_step.error')}
            </p>
        );
    }

    if (!isLoading && dbml !== undefined && dbml.length === 0) {
        return (
            <p className="text-sm text-muted-foreground" role="alert">
                {t('export_wizard.dbml.preview_step.empty')}
            </p>
        );
    }

    return (
        <ExportCodePreviewBlock
            code={isContentReady ? dbml : undefined}
            isLoading={!isContentReady}
            language="dbml"
            loadingAriaLabel={generatingLabel}
            loadingTestId="export-dbml-generating"
            containerTestId={
                isContentReady ? 'export-dbml-preview-container' : undefined
            }
            header={
                <DbmlRefFormatToggle
                    value={refFormat}
                    onValueChange={onRefFormatChange}
                    disabled={!isContentReady}
                />
            }
        />
    );
};
