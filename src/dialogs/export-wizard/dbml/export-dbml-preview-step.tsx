import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CodeSnippet } from '@/components/code-snippet/code-snippet';
import { Spinner } from '@/components/spinner/spinner';
import { Label } from '@/components/label/label';
import { DbmlRefFormatToggle } from '@/lib/dbml/dbml-ref-format-toggle';
import type { DbmlRefFormat } from '@/lib/dbml/dbml-ref-format';

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

    const renderContent = useCallback(() => {
        if (hasError) {
            return (
                <p className="text-sm text-muted-foreground" role="alert">
                    {t('export_wizard.dbml.preview_step.error')}
                </p>
            );
        }

        if (isLoading || dbml === undefined) {
            return (
                <div className="flex flex-col items-center gap-2 py-8">
                    <Spinner />
                    <Label className="text-sm">
                        {t('export_wizard.dbml.preview_step.generating')}
                    </Label>
                </div>
            );
        }

        if (dbml.length === 0) {
            return (
                <p className="text-sm text-muted-foreground" role="alert">
                    {t('export_wizard.dbml.preview_step.empty')}
                </p>
            );
        }

        return (
            <>
                <DbmlRefFormatToggle
                    value={refFormat}
                    onValueChange={onRefFormatChange}
                />
                <div
                    className="h-96 min-h-72 w-full shrink-0"
                    data-testid="export-dbml-preview-container"
                >
                    <CodeSnippet
                        className="size-full flex-none"
                        code={dbml}
                        language="dbml"
                        isComplete={!isLoading}
                        editorProps={{
                            options: {
                                scrollbar: {
                                    vertical: 'auto',
                                    horizontal: 'auto',
                                },
                            },
                        }}
                    />
                </div>
            </>
        );
    }, [dbml, hasError, isLoading, onRefFormatChange, refFormat, t]);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            {renderContent()}
        </div>
    );
};
